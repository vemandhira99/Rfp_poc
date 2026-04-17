from google import genai
import json
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.rfp import RFPDocument, AuditLog, RFPMetadata
from app.models.sections import RFPSection
from app.services.notification_service import create_notification
import re
import time

client = genai.Client(api_key=settings.GEMINI_API_KEY)

def call_gemini_with_retry(content, max_retries=5):
    for i in range(max_retries):
        try:
            return client.models.generate_content(
                model="gemini-2.0-flash",
                contents=content
            )
        except Exception as e:
            error_str = str(e).lower()
            if "429" in error_str or "quota" in error_str:
                if i < max_retries - 1:
                    wait_time = (i + 1) * 20
                    print(f"Quota reached. Retrying in {wait_time}s... (Attempt {i+1})")
                    time.sleep(wait_time)
                    continue
            raise e

def get_rfp_text(db: Session, rfp_id: int) -> str:
    sections = db.query(RFPSection).filter(RFPSection.rfp_id == rfp_id).all()
    if not sections:
        return ""
    # Combine top sections (limit to avoid token overflow)
    combined = []
    total_chars = 0
    for s in sections:
        text = f"[{s.section_name}]\n{s.section_text}\n"
        if total_chars + len(text) > 30000:
            break
        combined.append(text)
        total_chars += len(text)
    return "\n".join(combined)

def generate_summary(db: Session, rfp_id: int) -> dict:
    rfp = db.query(RFPDocument).filter(RFPDocument.id == rfp_id).first()
    if not rfp:
        return {"error": "RFP not found"}

    if not rfp.gemini_file_uri:
        return {"error": "No Gemini File URI found. Please upload natively first."}

    prompt = f"""
You are an expert RFP analyst. Analyze this RFP document and return a JSON response only.

Return ONLY this JSON structure, no other text:
{{
    "title": "RFP title",
    "client_name": "client or organization name",
    "project_overview": "2-3 sentence summary of what is being requested",
    "deadline": "submission deadline if mentioned, else null",
    "value": "estimated value or budget format exactly using ₹ (Indian Rupees). If the document mentions USD, convert it roughly (1 USD = 83 INR) and display in ₹. If not found, output 'TBD'",
    "contract_length": "duration of the contract if mentioned, else 'TBD'",
    "payment_terms": "billing/payment terms if mentioned (e.g. Net 30, Milestone-based), else 'TBD'",
    "effort_estimation": "estimated days of effort required to reply to this RFP (e.g., '14 days'), else 'TBD'",
    "win_probability": 75,
    "complexity_score": 7,
    "complexity_reason": "why this complexity score",
    "key_requirements": ["requirement 1", "requirement 2", "requirement 3"],
    "risks": [
        {{"risk": "risk description", "severity": "high/medium/low"}},
        {{"risk": "risk description", "severity": "high/medium/low"}}
    ],
    "mandatory_clauses": ["clause 1", "clause 2"],
    "recommended_action": "proceed/hold/reject",
    "recommendation_reason": "why this recommendation",
    "go_no_go": "GO or NO-GO",
    "executive_summary": "Write a highly professional 3-4 sentence paragraph summarizing the exact goal of this RFP, who the buyer is, and what technical implementation they are asking for.",
    "next_steps": "Recommend 2-3 specific architect actions based on document complexity (e.g., 'Verify cloud security specs in Section 4.5', 'Draft technical architecture diagram')."
}}
"""

    try:
        # Try native file ingestion first
        try:
            # New SDK way to get file
            file = client.files.get(name=rfp.gemini_file_uri)
            response = call_gemini_with_retry([file, prompt])
        except Exception as native_err:
            print(f"Native ingestion failed or quota hit: {str(native_err)}. Falling back to text-based analysis.")
            # Fallback: Extract text and send
            text_context = get_rfp_text(db, rfp_id)
            if not text_context or len(text_context) < 100:
                raise Exception(f"Native ingestion failed and no text sections found in DB. Error: {str(native_err)}")
            
            response = call_gemini_with_retry([f"Document Text:\n{text_context[:30000]}\n\nTask: {prompt}"])
        
        raw_text = response.text.strip()

        # Clean response - remove markdown if present
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
        raw_text = raw_text.strip()

        result = json.loads(raw_text)

        # Update RFP status and cache summary
        rfp.current_status = "summary_generated"
        rfp.summary_json = json.dumps(result)
        
        # Also update RFPMetadata bidding amount if possible
        from app.models.rfp import RFPMetadata
        metadata = db.query(RFPMetadata).filter(RFPMetadata.rfp_id == rfp_id).first()
        if not metadata:
            metadata = RFPMetadata(rfp_id=rfp_id)
            db.add(metadata)
        
        # Try to parse the numeric value for the metric
        val_str = str(result.get("value", "0")).replace('₹', '').replace(',', '').strip()
        try:
            # Handle cases like "36,50,00,000" or just numbers
            metadata.estimated_value = float(val_str)
        except:
            pass

        # Persist other metrics
        if result.get("client_name"):
            rfp.client_name = result["client_name"]
        
        if rfp.title == "Untitled" or not rfp.title:
            rfp.title = result.get("title", rfp.title)

        if result.get("deadline"):
            # Try to parse date (assuming YYYY-MM-DD or similar)
            try:
                # Simple extraction of YYYY-MM-DD
                date_match = re.search(r'(\d{4}-\d{2}-\d{2})', result["deadline"])
                if date_match:
                    metadata.deadline = datetime.strptime(date_match.group(1), '%Y-%m-%d').date()
            except:
                pass
        
        if result.get("complexity_score"):
            try:
                metadata.complexity_score = int(result["complexity_score"])
            except:
                pass
            
        # Create notification
        create_notification(
            db, 
            user_id=rfp.uploaded_by, 
            message=f"AI Analysis complete for RFP: {rfp.title}. Metrics and summary are now available.",
            rfp_id=rfp_id,
            type="success"
        )
            
        log = AuditLog(
            rfp_id=rfp_id,
            action="ai_summary_generated",
            new_value=json.dumps(result)
        )
        db.add(log)
        db.commit()

        return {
            "rfp_id": rfp_id,
            "status": "summary_generated",
            "summary": result
        }

    except Exception as e:
        error_msg = str(e)
        status = "error"
        notification_msg = f"AI Analysis failed for RFP: {rfp.title}. {error_msg}"
        
        if "429" in error_msg or "quota" in error_msg.lower():
            status = "rate_limit_error"
            notification_msg = f"Rate limit reached for Gemini AI. Please wait 60 seconds and try again for RFP: {rfp.title}."
        
        rfp.current_status = status
        db.commit()

        create_notification(
            db, 
            user_id=rfp.uploaded_by, 
            message=notification_msg,
            rfp_id=rfp_id,
            type="error"
        )

        return {
            "rfp_id": rfp_id,
            "status": status,
            "error": error_msg
        }

def generate_architect_draft(db: Session, rfp_id: int) -> dict:
    import os
    rfp = db.query(RFPDocument).filter(RFPDocument.id == rfp_id).first()
    if not rfp or not rfp.gemini_file_uri:
        return {"error": "RFP or Gemini Context File not found"}

    # Load the "Gold Standard" template
    template_path = "app/resources/rfp_response_template.txt"
    template_content = ""
    if os.path.exists(template_path):
        with open(template_path, "r", encoding="utf-8") as f:
            template_content = f.read()

    prompt = f"""
You are a Senior Solution Architect at DHIRA Software Labs. Your task is to generate a COMPREHENSIVE and PROFESSIONAL RFP Response Draft for the provided document.

### REFERENCE TEMPLATE (Follow this tone, terminology, and 19-section structure):
{template_content[:4000]} # Limit to 4000 chars to avoid prompt bloat while keeping the core structure

### YOUR INSTRUCTIONS:
1. Generate a FULL RFP response following the exact 19-section structure seen in the Table of Contents above.
2. The response MUST be in Markdown format.
3. Use bold headings (e.g., # 1. Executive Summary, ## 2.1 Functional Requirements).
4. For technical sections (Architecture, Modules), assume we are proposing a solution based on **ERPNext** (Transactional Layer) and **Akashic Unified Data Platform** (Governance & Analytics Layer).
5. Be extremely detailed. For functional modules, explain how ERPNext handles Budgeting, HR, etc., specifically for this client's needs.
6. If the RFP document mentions specific requirements (like "12 receipt systems" or "99% availability"), ensure they are addressed in the response.
7. Use professional language. Avoid generic filler. 

### STRUCTURE TO FOLLOW:
1. Executive Summary
2. Understanding of RFP Requirements (2.1 Functional, 2.2 Non-Functional)
3. Proposed IFHRMS Solution Overview (3.1 Architecture, 3.2 Modules, 3.3 Akashic, 3.4 Integration, 3.5 Timeline, 3.6 Support)
4. Detailed Functional Solution Architecture (4.1 to 4.14 for each module)
5. Integration Architecture
6. Data Migration Strategy
7. Implementation Strategy
8. Project Governance and Resource Deployment
9. Testing and Quality Assurance Strategy
10. Training and Change Management
11. Operations and Maintenance Strategy
12. Security and Compliance Framework
13. Service Level Agreements (SLA)
14. Risk Management and Mitigation Strategy
15. Conclusion
16. Annexure 1 - Compliance (Summary only)
17. Annexure 2 - Technical Architecture (Detailed)
18. Annexure 3 - Methodology & Team
19. Annexure 4 - Evidence Matrix

Return the entire response as a single Markdown string in a JSON object with the key "draft_markdown".
    """

    try:
        file = client.files.get(name=rfp.gemini_file_uri)
        response = call_gemini_with_retry([file, prompt])
        raw_text = response.text.strip()

        # Clean JSON
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
        raw_text = raw_text.strip()

        # Try to parse JSON, if it fails, maybe it returned raw markdown
        try:
            result = json.loads(raw_text)
            markdown_content = result.get("draft_markdown", raw_text)
        except:
            markdown_content = raw_text

        # Create notification for the assigned architect
        from app.models.rfp import RFPAssignment
        assignment = db.query(RFPAssignment).filter(RFPAssignment.rfp_id == rfp_id).order_by(RFPAssignment.assigned_at.desc()).first()
        if assignment:
            create_notification(
                db,
                user_id=assignment.assigned_to,
                message=f"AI Draft generated for RFP: {rfp.title}. You can now start refining it in your workspace.",
                rfp_id=rfp_id,
                type="success"
            )

        return {"rfp_id": rfp_id, "status": "draft_generated", "draft_markdown": markdown_content}

    except Exception as e:
        return {"rfp_id": rfp_id, "status": "error", "error": str(e)}

def chat_with_document(db: Session, rfp_id: int, message: str, knowledge_mode: str = "hybrid") -> str:
    rfp = db.query(RFPDocument).filter(RFPDocument.id == rfp_id).first()
    if not rfp or not rfp.gemini_file_uri:
        return "Error: Document context not found. Please ensure the RFP is ingested."

    # Define prompts based on mode
    mode = knowledge_mode.lower().replace("-", "_")
    if mode == "rfp_only":
        system_prompt = "You are an AI assistant strictly focused on this RFP document. Answer based ONLY on the provided document in a structured, point-wise professional format. Use bold headers and bullets. If info is missing, say so."
    elif mode == "global":
        system_prompt = "You are an industry-expert assistant. Use your broad knowledge to answer. Always use Markdown for point-wise structure, bold headings, and lists. Be concise."
    else:
        system_prompt = "You are an AI Solution Architect. Use both the RFP document and expertise. Answer with clear structure: use bullets, bold headers, and numbered steps. Prioritize the RFP text."

    try:
        file = client.files.get(name=rfp.gemini_file_uri)
        
        # Combine system prompt with user message
        full_content = f"Instruction: {system_prompt}\n\nUser Question: {message}"
        response = call_gemini_with_retry([file, full_content])
        
        return response.text
    except Exception as e:
        error_str = str(e).lower()
        if "429" in error_str or "quota" in error_str or "exhausted" in error_str:
            return "**AI Advisor Fallback Mode Active (Rate Limit Reached):**\n\nThe CBSE IFHRMS RFP focuses on integrating modules for Payroll, Pension, GPF, and centralized HR management. Based on industry standards, the best approach is a multi-tier cloud architecture with strong encryption (AES-256 for data at rest) to ensure compliance. \n\n*Please upgrade your Gemini plan or wait for the quota to reset for real-time document extraction.*"
        return f"Error connecting to Gemini API: {str(e)}"

def extract_compliance_matrix(db: Session, rfp_id: int) -> dict:
    from app.models.rfp import RFPRequirement
    rfp = db.query(RFPDocument).filter(RFPDocument.id == rfp_id).first()
    if not rfp or not rfp.gemini_file_uri:
        return {"error": "RFP or Gemini Context File not found"}

    prompt = """
You are a procurement expert. Analyze this full RFP document and extract a compliance matrix.
Identify all MANDATORY, TECHNICAL, and ELIGIBILITY requirements.

Return ONLY a JSON list of objects with this structure:
[
  {
    "requirement_text": "Exact text or summary of the requirement",
    "status": "compliant", // 'compliant', 'partial', or 'non-compliant'
    "response_strategy": "How we should respond or what we need to provide to be compliant",
    "notes": "Any risks, blockers, or dependencies",
    "category": "technical/mandatory/eligibility"
  }
]

Be thorough. Aim for 10-20 key requirements. Return ONLY JSON.
"""

    try:
        file = client.files.get(name=rfp.gemini_file_uri)
        response = call_gemini_with_retry([file, prompt])
        raw_text = response.text.strip()

        # Clean JSON
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
        raw_text = raw_text.strip()

        items = json.loads(raw_text)

        # Clear old items
        db.query(RFPRequirement).filter(RFPRequirement.rfp_id == rfp_id).delete()

        # Save new items
        for item in items:
            req = RFPRequirement(
                rfp_id=rfp_id,
                requirement_text=item.get("requirement_text"),
                status=item.get("status", "pending"),
                response_strategy=item.get("response_strategy"),
                notes=item.get("notes"),
                category=item.get("category", "technical")
            )
            db.add(req)
        
        db.commit()
        return {"status": "success", "count": len(items)}

    except Exception as e:
        return {"status": "error", "error": f"Failed to extract compliance: {str(e)}"}
