from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.rfp import RFPDraft, RFPDocument, AuditLog

def save_draft(db: Session, rfp_id: int, user_id: int, draft_content: str, is_final: bool = False):
    # Determine the next version
    latest_draft = db.query(RFPDraft).filter(RFPDraft.rfp_id == rfp_id).order_by(desc(RFPDraft.version)).first()
    next_version = (latest_draft.version + 1) if latest_draft else 1

    draft = RFPDraft(
        rfp_id=rfp_id,
        version=next_version,
        draft_content=draft_content,
        created_by=user_id,
        is_final=is_final
    )
    db.add(draft)
    
    # Update RFP status if draft is marked as final
    rfp = db.query(RFPDocument).filter(RFPDocument.id == rfp_id).first()
    if rfp and is_final:
        rfp.current_status = "under_review"
    elif rfp and rfp.current_status == "assigned_to_sa":
        rfp.current_status = "in_drafting"
        
    action_type = "draft_finalized" if is_final else "draft_saved"
    log = AuditLog(
        rfp_id=rfp_id,
        user_id=user_id,
        action=action_type,
        new_value=f"Version {next_version}"
    )
    db.add(log)
    db.commit()
    db.refresh(draft)
    return draft

def get_latest_draft(db: Session, rfp_id: int):
    return db.query(RFPDraft).filter(RFPDraft.rfp_id == rfp_id).order_by(desc(RFPDraft.version)).first()

def get_draft_history(db: Session, rfp_id: int):
    return db.query(RFPDraft).filter(RFPDraft.rfp_id == rfp_id).order_by(desc(RFPDraft.version)).all()
