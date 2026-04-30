from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.api.routes.auth import get_current_user
from app.models.rfp import RFPDocument, AuditLog
from app.services.parsing_service import run_parsing
from app.services.ai_service import generate_summary
import os, time

router = APIRouter(prefix="/uploads", tags=["Uploads"])

ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "text/plain": "txt"
}

@router.post("/rfp")
async def upload_rfp(
    title: str = Form(...),
    client_name: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, TXT files allowed")

    contents = await file.read()
    size_kb = len(contents) / 1024
    if size_kb > (settings.MAX_FILE_SIZE_MB * 1024):
        raise HTTPException(status_code=400, detail=f"File too large. Max {settings.MAX_FILE_SIZE_MB}MB")

    ext = ALLOWED_TYPES[file.content_type]
    safe_name = f"{int(time.time())}_{file.filename.replace(' ', '_')}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_name)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    with open(file_path, "wb") as f:
        f.write(contents)

    rfp = RFPDocument(
        title=title, client_name=client_name, uploaded_by=current_user.id,
        file_path=file_path, file_name=file.filename, file_type=ext,
        file_size_kb=int(size_kb), current_status="uploaded"
    )
    db.add(rfp)
    log = AuditLog(user_id=current_user.id, action="rfp_uploaded", new_value=title)
    db.add(log)
    db.commit()
    db.refresh(rfp)

    return {
        "message": "RFP uploaded successfully",
        "document_id": rfp.id,
        "file_name": rfp.file_name,
        "file_type": rfp.file_type,
        "size_kb": rfp.file_size_kb,
        "status": rfp.current_status
    }

def process_rfp_background(rfp_id: int, db_session_factory):
    # We use a fresh session for background tasks if needed, 
    # but here we can just use the provided one or handle scoping.
    # For simplicity in this environment, we'll use the passed DB
    from app.core.database import SessionLocal
    from app.core.config import settings
    from google import genai
    
    db = SessionLocal()
    try:
        rfp = db.query(RFPDocument).filter(RFPDocument.id == rfp_id).first()
        if not rfp:
            return

        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        # 1. Native Ingestion
        uploaded_file = client.files.upload(file=rfp.file_path, config={'display_name': rfp.file_name})
        rfp.gemini_file_uri = uploaded_file.name
        rfp.current_status = "processing_summary"
        db.commit()

        # 2. Generate Summary (This also triggers the notification)
        generate_summary(db, rfp_id)
        
    except Exception as e:
        print(f"Background processing failed for RFP {rfp_id}: {str(e)}")
        # Update status to error
        try:
            rfp = db.query(RFPDocument).filter(RFPDocument.id == rfp_id).first()
            if rfp:
                rfp.current_status = "error"
                db.commit()
        except:
            pass
    finally:
        db.close()

@router.post("/rfp/{rfp_id}/parse")
def parse_rfp(rfp_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db),
              current_user = Depends(get_current_user)):
    rfp = db.query(RFPDocument).filter(RFPDocument.id == rfp_id).first()
    if not rfp:
        raise HTTPException(status_code=404, detail="RFP not found")

    rfp.current_status = "queued_for_processing"
    db.commit()
    
    background_tasks.add_task(process_rfp_background, rfp_id, None)
    
    return {"message": "RFP parsing started in background.", "rfp_id": rfp_id, "status": "queued_for_processing"}

@router.get("/rfp/{rfp_id}/sections")
def get_sections(rfp_id: int, db: Session = Depends(get_db),
                 current_user = Depends(get_current_user)):
    from app.models.sections import RFPSection
    sections = db.query(RFPSection).filter(RFPSection.rfp_id == rfp_id).all()
    return [{"id": s.id, "section_name": s.section_name,
             "section_text": s.section_text[:200] + "..." if s.section_text and len(s.section_text) > 200 else s.section_text,
             "page_number": s.page_number, "confidence": float(s.confidence or 0)} for s in sections]

@router.get("/rfp/{rfp_id}/download")
def download_rfp(rfp_id: int, db: Session = Depends(get_db)):
    from fastapi.responses import FileResponse
    rfp = db.query(RFPDocument).filter(RFPDocument.id == rfp_id).first()
    if not rfp or not rfp.file_path or not os.path.exists(rfp.file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(rfp.file_path, filename=rfp.file_name)