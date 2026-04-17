from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RFPCreate(BaseModel):
    title: str
    client_name: Optional[str] = None

class RFPOut(BaseModel):
    id: int
    title: str
    client_name: Optional[str]
    current_status: str
    uploaded_by: Optional[int]
    file_name: Optional[str]
    file_type: Optional[str]
    created_at: Optional[datetime]
    assigned_by_name: Optional[str] = None
    summary_json: Optional[str] = None

    class Config:
        from_attributes = True

class RFPStatusUpdate(BaseModel):
    status: str

class DecisionRequest(BaseModel):
    decision: str        # approved, rejected, on_hold, proceed
    reason: Optional[str] = None

class AssignRequest(BaseModel):
    architect_id: int
    notes: Optional[str] = None

class CommentRequest(BaseModel):
    comment_text: str
    entity_type: Optional[str] = "rfp"
    entity_id: Optional[int] = None

class DashboardSummary(BaseModel):
    total: int
    uploaded: int
    under_review: int
    approved: int
    rejected: int
    assigned: int

class DraftCreate(BaseModel):
    draft_content: str
    is_final: Optional[bool] = False

class DraftOut(BaseModel):
    id: int
    rfp_id: int
    version: int
    draft_content: str
    created_by: int
    is_final: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str
    knowledge_mode: str = "Hybrid"

class DraftRequest(BaseModel):
    content: str

class RequirementOut(BaseModel):
    id: int
    rfp_id: int
    requirement_text: str
    status: str
    response_strategy: Optional[str]
    notes: Optional[str]
    category: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

class NotificationOut(BaseModel):
    id: int
    user_id: int
    rfp_id: Optional[int]
    message: str
    is_read: bool
    type: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True