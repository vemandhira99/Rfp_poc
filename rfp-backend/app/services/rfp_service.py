from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.rfp import RFPDocument, RFPApproval, RFPAssignment, RFPComment, AuditLog
from app.models.user import User
from typing import Optional

def get_all_rfps(db: Session):
    return db.query(RFPDocument).order_by(RFPDocument.created_at.desc()).all()

def get_rfp_by_id(db: Session, rfp_id: int):
    return db.query(RFPDocument).filter(RFPDocument.id == rfp_id).first()

def get_dashboard_summary(db: Session):
    from app.models.rfp import RFPMetadata
    total    = db.query(func.count(RFPDocument.id)).scalar()
    # Standardizing counts based on actual lifecycle statuses
    uploaded = db.query(func.count(RFPDocument.id)).filter(RFPDocument.current_status == "uploaded").scalar()
    # RFPs which have summaries or are being refined
    review   = db.query(func.count(RFPDocument.id)).filter(RFPDocument.current_status.in_(["summary_generated", "under_review", "awaiting_ceo_decision"])).scalar()
    approved = db.query(func.count(RFPDocument.id)).filter(RFPDocument.current_status == "approved").scalar()
    rejected = db.query(func.count(RFPDocument.id)).filter(RFPDocument.current_status == "rejected").scalar()
    
    # Bidding Amount Metric (Total Value)
    # Sum of budget from RFPMetadata or previously extracted AI values
    total_val = db.query(func.sum(RFPMetadata.estimated_value)).scalar() or 0
    
    return {
        "total": total, 
        "uploaded": uploaded, 
        "under_review": review,
        "approved": approved, 
        "rejected": rejected,
        "total_value": float(total_val)
    }

def update_rfp_status(db: Session, rfp_id: int, status: str, user_id: int):
    rfp = db.query(RFPDocument).filter(RFPDocument.id == rfp_id).first()
    if not rfp:
        return None
    old_status = rfp.current_status
    rfp.current_status = status
    log = AuditLog(rfp_id=rfp_id, user_id=user_id, action="status_changed",
                   old_value=old_status, new_value=status)
    db.add(log)
    db.commit()
    db.refresh(rfp)
    return rfp

def save_decision(db: Session, rfp_id: int, user_id: int, decision: str, reason: str):
    approval = RFPApproval(rfp_id=rfp_id, approved_by=user_id, decision=decision, reason=reason)
    db.add(approval)
    status_map = {
        "approved": "approved", "rejected": "rejected",
        "on_hold": "on_hold",   "proceed": "awaiting_ceo_decision"
    }
    rfp = db.query(RFPDocument).filter(RFPDocument.id == rfp_id).first()
    if rfp:
        rfp.current_status = status_map.get(decision, rfp.current_status)
    log = AuditLog(rfp_id=rfp_id, user_id=user_id, action=f"decision_{decision}", new_value=reason)
    db.add(log)
    db.commit()
    return approval

def assign_architect(db: Session, rfp_id: int, assigned_to: int, assigned_by: int, notes: str):
    assignment = RFPAssignment(rfp_id=rfp_id, assigned_to=assigned_to,
                               assigned_by=assigned_by, notes=notes)
    db.add(assignment)
    rfp = db.query(RFPDocument).filter(RFPDocument.id == rfp_id).first()
    if rfp:
        rfp.current_status = "assigned_to_sa"
    log = AuditLog(rfp_id=rfp_id, user_id=assigned_by, action="assigned_to_architect",
                   new_value=str(assigned_to))
    db.add(log)
    db.commit()
    return assignment

def get_assigned_rfps(db: Session, user_id: int):
    # Join RFPAssignment directly to fetch the assigner User
    results = db.query(RFPDocument, RFPAssignment, User.name)\
        .join(RFPAssignment, RFPAssignment.rfp_id == RFPDocument.id)\
        .join(User, User.id == RFPAssignment.assigned_by)\
        .filter(
            RFPAssignment.assigned_to == user_id,
            RFPAssignment.assignment_status == "active"
        ).all()
        
    final_rfps = []
    for rfp, assignment, assigner_name in results:
        # We attach the extra assigned_by_name attribute
        rfp_data = rfp.__dict__.copy()
        rfp_data['assigned_by_name'] = assigner_name
        final_rfps.append(rfp_data)
        
    return final_rfps

def add_comment(db: Session, rfp_id: int, user_id: int, text: str, entity_type: str, entity_id: int):
    comment = RFPComment(rfp_id=rfp_id, user_id=user_id, comment_text=text,
                         entity_type=entity_type, entity_id=entity_id)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment