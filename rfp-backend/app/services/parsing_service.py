import os
from sqlalchemy.orm import Session
from app.models.rfp import RFPDocument, AuditLog
from app.models.sections import RFPSection

# Keywords to detect section types
SECTION_KEYWORDS = {
    "scope":       ["scope", "objective", "purpose", "overview"],
    "deadline":    ["deadline", "timeline", "schedule", "due date", "submission"],
    "budget":      ["budget", "cost", "price", "financial", "commercial"],
    "legal":       ["legal", "compliance", "terms", "conditions", "liability"],
    "sla":         ["sla", "service level", "performance", "availability"],
    "technical":   ["technical", "architecture", "infrastructure", "technology"],
    "eligibility": ["eligibility", "qualification", "criteria", "requirement"],
    "contact":     ["contact", "address", "email", "phone", "submit"],
}

def detect_tags(text: str) -> list:
    text_lower = text.lower()
    tags = []
    for tag, keywords in SECTION_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            tags.append(tag)
    return tags

def parse_pdf(file_path: str) -> list:
    """Extract sections from PDF file"""
    sections = []
    try:
        import PyPDF2
        with open(file_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            total_pages = len(reader.pages)

            current_section = None
            current_text = []
            current_page = 1

            for page_num in range(total_pages):
                page = reader.pages[page_num]
                text = page.extract_text() or ""
                lines = text.split("\n")

                for line in lines:
                    line = line.strip()
                    if not line:
                        continue

                    # Detect if this line is a heading
                    is_heading = (
                        len(line) < 80 and
                        (line.isupper() or
                         line.endswith(":") or
                         any(line.lower().startswith(kw) for kws in SECTION_KEYWORDS.values() for kw in kws))
                    )

                    if is_heading and current_text:
                        # Save previous section
                        section_text = " ".join(current_text).strip()
                        if section_text and current_section:
                            sections.append({
                                "section_name": current_section,
                                "section_text": section_text[:5000],
                                "page_number": current_page,
                                "confidence": 85.0,
                                "tags": detect_tags(section_text)
                            })
                        current_section = line
                        current_text = []
                        current_page = page_num + 1
                    else:
                        if not current_section:
                            current_section = "Introduction"
                        current_text.append(line)

            # Save last section
            if current_text and current_section:
                section_text = " ".join(current_text).strip()
                sections.append({
                    "section_name": current_section,
                    "section_text": section_text[:5000],
                    "page_number": current_page,
                    "confidence": 85.0,
                    "tags": detect_tags(section_text)
                })

    except Exception as e:
        # Fallback: save whole file as one section
        sections.append({
            "section_name": "Full Document",
            "section_text": f"Could not parse sections: {str(e)}",
            "page_number": 1,
            "confidence": 0.0,
            "tags": []
        })

    return sections

def parse_docx(file_path: str) -> list:
    """Extract sections from DOCX file"""
    sections = []
    try:
        from docx import Document
        doc = Document(file_path)
        current_section = "Introduction"
        current_text = []
        page_num = 1

        for para in doc.paragraphs:
            text = para.text.strip()
            if not text:
                continue

            is_heading = para.style.name.startswith("Heading") or (
                len(text) < 80 and text.isupper()
            )

            if is_heading and current_text:
                section_text = " ".join(current_text).strip()
                if section_text:
                    sections.append({
                        "section_name": current_section,
                        "section_text": section_text[:5000],
                        "page_number": page_num,
                        "confidence": 90.0,
                        "tags": detect_tags(section_text)
                    })
                current_section = text
                current_text = []
            else:
                current_text.append(text)

        if current_text:
            section_text = " ".join(current_text).strip()
            sections.append({
                "section_name": current_section,
                "section_text": section_text[:5000],
                "page_number": page_num,
                "confidence": 90.0,
                "tags": detect_tags(section_text)
            })

    except Exception as e:
        sections.append({
            "section_name": "Full Document",
            "section_text": f"Could not parse: {str(e)}",
            "page_number": 1,
            "confidence": 0.0,
            "tags": []
        })

    return sections

def run_parsing(db: Session, rfp_id: int):
    """Main function - parse RFP and save sections to DB"""
    rfp = db.query(RFPDocument).filter(RFPDocument.id == rfp_id).first()
    if not rfp:
        return {"error": "RFP not found"}

    # Update status to parsing
    rfp.current_status = "parsing"
    db.commit()

    try:
        # Parse based on file type
        if rfp.file_type == "pdf":
            sections = parse_pdf(rfp.file_path)
        elif rfp.file_type == "docx":
            sections = parse_docx(rfp.file_path)
        else:
            sections = [{
                "section_name": "Full Document",
                "section_text": open(rfp.file_path).read()[:5000],
                "page_number": 1,
                "confidence": 100.0,
                "tags": []
            }]

        # Delete old sections if re-parsing
        db.query(RFPSection).filter(RFPSection.rfp_id == rfp_id).delete()

        # Save all sections to DB
        for s in sections:
            section = RFPSection(
                rfp_id=rfp_id,
                section_name=s["section_name"],
                section_text=s["section_text"],
                page_number=s["page_number"],
                confidence=s["confidence"]
            )
            db.add(section)

        # Update status to parsed
        rfp.current_status = "parsed"
        log = AuditLog(rfp_id=rfp_id, action="rfp_parsed",
                       new_value=f"{len(sections)} sections extracted")
        db.add(log)
        db.commit()

        return {
            "status": "parsed",
            "sections_extracted": len(sections),
            "rfp_id": rfp_id
        }

    except Exception as e:
        rfp.current_status = "uploaded"
        db.commit()
        return {"error": str(e)}