from google import genai
import json
import os
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.rfp import RFPDocument, AuditLog, RFPMetadata, RFPDraft
from app.models.sections import RFPSection
from app.services.notification_service import create_notification
import re
import time
from datetime import datetime

client = genai.Client(api_key=settings.GEMINI_API_KEY)

def ensure_gemini_file(db: Session, rfp: RFPDocument):
    """
    Ensures a valid Gemini File reference exists. Re-uploads if the URI is invalid or 
    belongs to a different API key/project.
    """
    file_ref = None
    if rfp.gemini_file_uri:
        try:
            file_ref = client.files.get(name=rfp.gemini_file_uri)
        except Exception as e:
            print(f"Gemini File URI invalid or from different project for RFP {rfp.id}: {str(e)}. Re-uploading...")
            file_ref = None

    if not file_ref:
        if rfp.file_path and os.path.exists(rfp.file_path):
            try:
                print(f"Uploading file for RFP {rfp.id}: {rfp.file_path}")
                file_ref = client.files.upload(file=rfp.file_path, config={'display_name': rfp.file_name})
                
                # Wait for file to be active
                for _ in range(12): # Wait up to 60s
                    file_ref = client.files.get(name=file_ref.name)
                    if file_ref.state.name == "ACTIVE":
                        break
                    time.sleep(5)
                
                rfp.gemini_file_uri = file_ref.name
                db.commit()
            except Exception as ue:
                print(f"Error uploading file for RFP {rfp.id}: {str(ue)}")
                return None
        else:
            return None
    return file_ref

def get_or_create_cache(db: Session, rfp_id: int):
    """
    Helper to manage Context Caching. 
    NOTE: Disabled for Free Tier due to 0-token storage limit.
    """
    return None

def track_quota_usage(db, is_error=False, error_msg=""):
    from app.models.quota import QuotaUsage
    today = datetime.now().strftime("%Y-%m-%d")
    
    quota = db.query(QuotaUsage).filter(QuotaUsage.day == today).first()
    if not quota:
        quota = QuotaUsage(day=today, request_count=0)
        db.add(quota)
    
    quota.request_count += 1
    if is_error:
        error_msg_lower = error_msg.lower()
        if "429" in error_msg_lower or "quota" in error_msg_lower:
            quota.is_exhausted = True
        elif "503" in error_msg_lower or "unavailable" in error_msg_lower:
            # Mark as high demand but not necessarily exhausted for the day
            print(f"Server Busy (503): {error_msg}")
    
    db.commit()

def call_gemini_with_retry(content, model="gemini-2.5-flash", config=None, max_retries=5):
    for i in range(max_retries):
        try:
            # Use provided config or default to empty dict
            gen_config = config if config else {}
            
            return client.models.generate_content(
                model=model,
                contents=content,
                config=gen_config
            )
        except Exception as e:
            error_str = str(e).lower()
            # Handle both Rate Limits (429) and Temporary Server Overload (503)
            if any(code in error_str for code in ["429", "503", "quota", "unavailable", "overloaded"]):
                if i < max_retries - 1:
                    # Exponential backoff: 5s, 10s, 15s...
                    wait_time = (i + 1) * 5 
                    print(f"Server busy or Rate limit reached. Retrying in {wait_time}s... (Attempt {i+1})")
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

    # Optimization: Skip if summary already exists
    if rfp.summary_json:
        print(f"Summary already exists for RFP {rfp_id}. Skipping regeneration.")
        try:
            return {
                "rfp_id": rfp_id,
                "status": "summary_generated",
                "summary": json.loads(rfp.summary_json)
            }
        except:
            pass # If JSON is corrupt, re-generate

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

    # Optimization: Context Caching disabled for Free Tier stability
    # try:
    #     cache = get_or_create_cache(db, rfp_id)
    #     if cache:
    #         response = call_gemini_with_retry(
    #             content=prompt,
    #             config={"cached_content": cache.name}
    #         )
    #     else:
    #         file = client.files.get(name=rfp.gemini_file_uri)
    #         response = call_gemini_with_retry([file, prompt])
    # except:
    #     file = client.files.get(name=rfp.gemini_file_uri)
    #     response = call_gemini_with_retry([file, prompt])

    try:
        # Standard native ingestion (reliable for Free Tier)
        file = ensure_gemini_file(db, rfp)
        if not file:
             return {"error": "Failed to prepare document for AI."}
        response = call_gemini_with_retry([file, prompt])
        
        raw_text = response.text.strip()

        # Clean response - remove markdown if present
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
        raw_text = raw_text.strip()

        result = json.loads(raw_text)

        # Update RFP status and cache summary
        rfp.current_status = "pending-review"
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
            "status": "pending-review",
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

def generate_proposal_section(db: Session, rfp_id: int, section_name: str, section_order: int, user_id: int, version: int = 1):
    """
    Generates a deep-dive for a specific section of the proposal.
    """
    from app.models.rfp import RFPDraft
    rfp = db.query(RFPDocument).filter(RFPDocument.id == rfp_id).first()
    if not rfp:
        return None

    # THE MASTER PROMPT (Experienced Consultant & Strategic Bid Manager)
    master_instruction = """
You are a senior bid manager and experienced management consultant. Your task is to generate a submission-ready, evaluator-grade RFP response that is outcome-driven and strategically superior.

🔴 CORE RULES:
1. NO INVENTION: Use [TO BE CONFIRMED] if data is missing. Do NOT invent metrics or timelines.
2. CONSULTANT TONE: Write with the voice of an experienced consultant. Avoid repetitive sentence patterns; ensure smooth transitions and a confident, professional narrative flow.
3. STRATEGIC STRENGTHS: Consistently reinforce 2-3 key solution strengths (e.g., seamless ERPNext/Akashic integration) throughout the document.
4. VISUAL READABILITY: Use summary tables, step-by-step sequences, and "text diagrams" to make technical flows scannable.
5. IMPLEMENTATION CONFIDENCE: Include specific milestone checkpoints and approval gates in all strategy sections.
6. OWNERSHIP CLARITY: Clearly define ownership in all risks, assumptions, and dependencies.
7. TONE GRADIENT: Use a highly confident tone for confirmed capabilities and a professional, cautious tone for assumptions.
8. INTERNAL VALIDATION: Ensure no accidental placeholders remain and there are no internal contradictions.

🟢 REQUIREMENT RESPONSE FORMAT:
Requirement: [Text]
Proposed Response: [Text]
How It Is Supported: [Specific Workflow]
Key Controls: [Audit/Versioning details]
Compliance Status: [Compliant/Partial/Non-Compliant]
"""

    prompt = f"""
{master_instruction}

### TARGET SECTION TO EXPAND:
**{section_order}. {section_name}**

Please write the full, detailed content for this section now. Be as exhaustive as possible. Aim for maximum depth.
Return the response as a raw Markdown string.
"""

    try:
        print(f"[{rfp_id}] Starting section: {section_name} (Order: {section_order}, Version: {version})")
        # Standard file upload (caching disabled for stability)
        file = ensure_gemini_file(db, rfp)
        if not file:
            print(f"[{rfp_id}] Error: Could not retrieve file for {section_name}")
            return None
        response = call_gemini_with_retry([file, prompt])
        
        print(f"[{rfp_id}] AI Response received for {section_name}")
        content = response.text.strip()
        
        # Save this section to the database
        draft_section = RFPDraft(
            rfp_id=rfp_id,
            section_name=section_name,
            section_order=section_order,
            version=version,
            draft_content=content,
            created_by=user_id
        )
        db.add(draft_section)
        db.commit()
        print(f"[{rfp_id}] Section {section_name} saved successfully.")
        return draft_section

    except Exception as e:
        db.rollback()
        print(f"[{rfp_id}] Error generating section {section_name}: {str(e)}")
        return None

def generate_architect_draft(db: Session, rfp_id: int) -> dict:
    import os
    rfp = db.query(RFPDocument).filter(RFPDocument.id == rfp_id).first()
    if not rfp:
        return {"error": "RFP not found"}

    try:
        # Define the 21 Sections from the user's updated structure (from resume_rfp_17.py)
        sections = [
            "Executive Summary",
            "Understanding of RFP Requirements (Functional & Non-Functional)",
            "Proposed Solution Overview (Architecture, Modules, Technology)",
            "Detailed Functional Solution Architecture: Budget & Commitment Management",
            "Detailed Functional Solution Architecture: Contract & Sanction Management",
            "Detailed Functional Solution Architecture: Human Resource Management",
            "Detailed Functional Solution Architecture: Receipt & Payment Management",
            "Detailed Functional Solution Architecture: Grant & Project Management",
            "Detailed Functional Solution Architecture: Asset & General Ledger Accounting",
            "Detailed Functional Solution Architecture: Data Analytics & Master Data",
            "Detailed Functional Requirement Specification (FRS) Coverage",
            "Integration Architecture (Gateways, Banking, Governance)",
            "Data Migration Strategy (ETL, Validation, Governance)",
            "Implementation Strategy (Phases, Timeline, Training)",
            "Project Governance and Resource Deployment",
            "Testing and Quality Assurance Strategy",
            "Training and Change Management",
            "Operations and Maintenance Strategy",
            "Security and Compliance Framework",
            "Service Level Agreements (SLA) and Risks",
            "Conclusion and Annexures (Compliance Matrix, Evidence)"
        ]

        # Determine the version. If we are 'in_drafting' and already have some sections, we resume the latest version.
        # Otherwise, we start a new version.
        from sqlalchemy import desc
        latest_v_record = db.query(RFPDraft).filter(RFPDraft.rfp_id == rfp_id).order_by(desc(RFPDraft.version)).first()
        
        # We start a new version ONLY if the latest one is already 'completed' (has 21 sections) 
        # or if there is no record yet.
        if latest_v_record:
            completed_count = db.query(RFPDraft).filter(
                RFPDraft.rfp_id == rfp_id, 
                RFPDraft.version == latest_v_record.version,
                RFPDraft.section_name != None
            ).count()
            if completed_count >= len(sections):
                next_version = latest_v_record.version + 1
            else:
                next_version = latest_v_record.version
        else:
            next_version = 1

        # Create a placeholder record for this version to signal progress tracking (if not already there)
        existing_placeholder = db.query(RFPDraft).filter(
            RFPDraft.rfp_id == rfp_id, 
            RFPDraft.version == next_version,
            RFPDraft.section_order == 0
        ).first()
        
        if not existing_placeholder:
            placeholder = RFPDraft(
                rfp_id=rfp_id,
                version=next_version,
                section_name=None, # Marker for "starting"
                section_order=0,
                draft_content="Proposal generation initiated...",
                created_by=rfp.uploaded_by
            )
            db.add(placeholder)
            db.commit()

        # Generate all sections iteratively
        for i, section_title in enumerate(sections):
            # Check for cancellation
            db.refresh(rfp)
            if rfp.current_status != "in_drafting":
                print(f"[{rfp_id}] Generation cancelled or stopped (Status: {rfp.current_status}).")
                return {"rfp_id": rfp_id, "status": "stopped"}

            # Check if this section already exists for this version (Resume capability)
            existing = db.query(RFPDraft).filter(
                RFPDraft.rfp_id == rfp_id,
                RFPDraft.version == next_version,
                RFPDraft.section_name == section_title
            ).first()
            if existing:
                print(f"[{rfp_id}] Section {section_title} already exists. Skipping.")
                continue

            result = generate_proposal_section(db, rfp_id, section_title, i+1, rfp.uploaded_by, version=next_version)
            
            if result is None:
                # If generation failed, check if it was a rate limit
                # Note: call_gemini_with_retry will raise an exception if retries fail.
                # If we get here, it means generate_proposal_section caught it and returned None.
                # We stop the loop to avoid burning more retries on other sections.
                print(f"[{rfp_id}] Failed to generate {section_title}. Stopping loop to preserve quota.")
                rfp.current_status = "rate_limit_error"
                db.commit()
                return {"rfp_id": rfp_id, "status": "rate_limit_error", "error": f"Failed at section {section_title}"}

            time.sleep(5) # Delay to stay under 15 RPM Free Tier limit

        # Notify user that process has completed
        create_notification(
            db,
            user_id=rfp.uploaded_by,
            message=f"Success! The High-Density Proposal for {rfp.title} is now complete with {len(sections)} sections.",
            rfp_id=rfp_id,
            type="success"
        )

        return {
            "rfp_id": rfp_id, 
            "status": "success", 
            "message": f"All {len(sections)} sections generated successfully.",
            "sections_count": len(sections)
        }

    except Exception as e:
        return {"rfp_id": rfp_id, "status": "error", "error": str(e)}

def chat_with_document(db: Session, rfp_id: int, message: str, knowledge_mode: str = "hybrid", history: list = None) -> str:
    # 1. Greeting Bypass (Save AI credits/quota for simple greetings)
    greetings = ["hi", "hello", "hii", "hii", "helli", "hey", "good morning", "good evening"]
    thanks = ["thanks", "thank you", "thx", "appreciate it", "nice", "cool"]
    
    clean_msg = message.lower().strip().strip("?!.")
    if clean_msg in greetings:
        return "Hello! I am your AI Advisor. I've analyzed this RFP and I'm ready to help. What would you like to know?"
    if clean_msg in thanks:
        return "You're welcome! I'm here if you have any more questions about the RFP."

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
        # Context caching disabled for free tier stability
        # cache = get_or_create_cache(db, rfp_id)
        
        # Build prompt parts
        prompt_parts = []
        
        # Add system instruction
        prompt_parts.append(f"Instruction: {system_prompt}")
        
        # Add history if present
        if history:
            history_text = "\n".join([f"{m['role'].upper()}: {m['text']}" for m in history if m.get('text')])
            prompt_parts.append(f"Previous Conversation History:\n{history_text}")
            
        # Add current question
        prompt_parts.append(f"Current User Question: {message}")
        
        # Standard file upload (caching disabled for stability)
        file = ensure_gemini_file(db, rfp)
        if not file:
            return "Error: Document context could not be loaded."
        response = call_gemini_with_retry([file] + prompt_parts)
        
        return response.text
    except Exception as e:
        error_str = str(e).lower()
        if "429" in error_str or "quota" in error_str or "exhausted" in error_str:
            return "**AI Advisor Fallback Mode Active (Rate Limit Reached):**\n\nThe CBSE IFHRMS RFP focuses on integrating modules for Payroll, Pension, GPF, and centralized HR management. Based on industry standards, the best approach is a multi-tier cloud architecture with strong encryption (AES-256 for data at rest) to ensure compliance. \n\n*Please upgrade your Gemini plan or wait for the quota to reset for real-time document extraction.*"
        return f"Error connecting to Gemini API: {str(e)}"

def stream_chat_with_document(db: Session, rfp_id: int, message: str, knowledge_mode: str = "hybrid", history: list = None):
    # 1. Greeting Bypass (Same as non-streaming for consistency)
    greetings = ["hi", "hello", "hii", "hii", "helli", "hey", "good morning", "good evening"]
    thanks = ["thanks", "thank you", "thx", "appreciate it", "nice", "cool"]
    
    clean_msg = message.lower().strip().strip("?!.")
    if clean_msg in greetings:
        yield "Hello! I am your AI Advisor. I've analyzed this RFP and I'm ready to help. What would you like to know?"
        return
    if clean_msg in thanks:
        yield "You're welcome! I'm here if you have any more questions about the RFP."
        return

    rfp = db.query(RFPDocument).filter(RFPDocument.id == rfp_id).first()
    if not rfp or not rfp.gemini_file_uri:
        yield "Error: Document context not found. Please ensure the RFP is ingested."
        return

    # Determine system prompt based on knowledge mode
    base_instruction = (
        "You are an AI Solution Architect specializing in enterprise RFP responses. "
        "Your goal is to provide highly structured, professional, and actionable insights. "
        "ALWAYS use Markdown formatting: \n"
        "- Use ### for section headers.\n"
        "- Use **bold** for emphasis on key terms and dates.\n"
        "- Use bullet points and numbered lists for readability.\n"
        "- Use tables if you need to compare complex data.\n"
        "- Break your answer into clear logical sections (e.g., Overview, Technical Highlights, Risks, Next Steps).\n"
    )

    if knowledge_mode == "RFP-Only":
        system_prompt = f"{base_instruction} Use ONLY the provided RFP document. If the answer isn't in the RFP, say so clearly. Do not hallucinate."
    elif knowledge_mode == "Global":
        system_prompt = f"{base_instruction} Use your general expertise AND the RFP document. Prioritize the RFP, but add value from industry standards and best practices."
    else: # Hybrid
        system_prompt = f"{base_instruction} Use both the RFP document and your professional expertise. Provide a comprehensive answer with clear sectioning."

    try:
        # Context caching disabled for free tier stability
        # cache = get_or_create_cache(db, rfp_id)
        
        prompt_parts = [f"Instruction: {system_prompt}"]
        
        if history:
            history_text = "\n".join([f"{m['role'].upper()}: {m['text']}" for m in history if m.get('text')])
            prompt_parts.append(f"Previous Conversation History:\n{history_text}")
            
        prompt_parts.append(f"Current User Question: {message}")
        
        # Tracking: Every chat request counts
        track_quota_usage(db)

        # Standard file upload (caching disabled for stability)
        file = ensure_gemini_file(db, rfp)
        if not file:
            yield "Error: Document context could not be loaded."
            return
        response = client.models.generate_content_stream(
            model="gemini-2.5-flash",
            contents=[file] + prompt_parts
        )
        
        for chunk in response:
            if chunk.text:
                yield chunk.text
                
    except Exception as e:
        track_quota_usage(db, is_error=True, error_msg=str(e))
        yield f"Error connecting to Gemini API: {str(e)}"

def extract_compliance_matrix(db: Session, rfp_id: int) -> dict:
    from app.models.rfp import RFPRequirement
    rfp = db.query(RFPDocument).filter(RFPDocument.id == rfp_id).first()
    if not rfp or not rfp.gemini_file_uri:
        return {"error": "RFP or Gemini Context File not found"}

    if rfp.current_status != "in_drafting":
        return {"status": "cancelled", "message": "Compliance extraction skipped due to status change."}

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

Be extremely thorough. Aim for 40-50 key requirements across all technical and functional areas. Return ONLY JSON.
"""

    try:
        # Standard file upload (caching disabled for stability)
        file = ensure_gemini_file(db, rfp)
        if not file:
            return {"error": "Failed to load document for compliance extraction."}
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
