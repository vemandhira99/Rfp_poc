from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.api.routes.auth import get_current_user
from app.services.ai_service import generate_summary, generate_architect_draft

router = APIRouter(prefix="/ai", tags=["AI"])

@router.get("/quota-status")
def get_quota_status(db: Session = Depends(get_db)):
    from app.models.quota import QuotaUsage
    today = datetime.now().strftime("%Y-%m-%d")
    quota = db.query(QuotaUsage).filter(QuotaUsage.day == today).first()
    
    if not quota:
        return {"request_count": 0, "is_exhausted": False, "health": "Good"}
    
    health = "Good"
    if quota.is_exhausted:
        health = "Critical"
    elif quota.request_count > 50:
        health = "Warning"
        
    return {
        "request_count": quota.request_count,
        "is_exhausted": quota.is_exhausted,
        "health": health
    }

@router.post("/rfp/{rfp_id}/summary")
def get_ai_summary(rfp_id: int, db: Session = Depends(get_db),
                   current_user = Depends(get_current_user)):
    result = generate_summary(db, rfp_id)
    if "error" in result and result.get("status") == "error":
        raise HTTPException(status_code=500, detail=result["error"])
    return result

@router.post("/rfp/{rfp_id}/draft")
def get_architect_draft(rfp_id: int, db: Session = Depends(get_db),
                        current_user = Depends(get_current_user)):
    if current_user.role not in ["Solution_Architect", "CEO", "Admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = generate_architect_draft(db, rfp_id)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    
    # Auto-save to draft table
    from app.models.rfp import RFPDraft
    latest = db.query(RFPDraft).filter(RFPDraft.rfp_id == rfp_id).order_by(RFPDraft.version.desc()).first()
    new_version = (latest.version + 1) if latest else 1
    
    new_draft = RFPDraft(
        rfp_id=rfp_id,
        version=new_version,
        draft_content=result["draft_markdown"],
        created_by=current_user.id
    )
    db.add(new_draft)
    db.commit()
    
    return result

@router.post("/rfp/{rfp_id}/compliance-generate")
def generate_compliance(rfp_id: int, db: Session = Depends(get_db),
                        current_user = Depends(get_current_user)):
    from app.services.ai_service import extract_compliance_matrix
    if current_user.role not in ["Solution_Architect", "CEO", "Admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = extract_compliance_matrix(db, rfp_id)
    if result.get("status") == "error":
        raise HTTPException(status_code=500, detail=result["error"])
    return result