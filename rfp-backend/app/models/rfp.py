from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Numeric, Boolean, Date, ARRAY
from sqlalchemy.sql import func
from app.core.database import Base

class RFPDocument(Base):
    __tablename__ = "rfp_documents"
    id             = Column(Integer, primary_key=True, index=True)
    title          = Column(String(300), nullable=False)
    client_name    = Column(String(200))
    uploaded_by    = Column(Integer, ForeignKey("users.id"))
    file_path      = Column(Text)
    file_name      = Column(String(255))
    file_type      = Column(String(20))
    file_size_kb   = Column(Integer)
    current_status = Column(String(50), default="uploaded")
    gemini_file_uri= Column(String(500), nullable=True)
    gemini_cache_name = Column(String(500), nullable=True)
    summary_json   = Column(Text, nullable=True)
    created_at     = Column(DateTime, default=func.now())
    updated_at     = Column(DateTime, default=func.now(), onupdate=func.now())

class RFPMetadata(Base):
    __tablename__ = "rfp_metadata"
    id              = Column(Integer, primary_key=True, index=True)
    rfp_id          = Column(Integer, ForeignKey("rfp_documents.id"), unique=True)
    deadline        = Column(Date)
    budget          = Column(Numeric(18, 2))
    currency        = Column(String(10), default="USD")
    department      = Column(String(150))
    estimated_value = Column(Numeric(18, 2))
    priority        = Column(String(20), default="medium")
    complexity_score = Column(Integer)
    created_at      = Column(DateTime, default=func.now())
    updated_at      = Column(DateTime, default=func.now(), onupdate=func.now())

class RFPAssignment(Base):
    __tablename__ = "rfp_assignments"
    id                = Column(Integer, primary_key=True, index=True)
    rfp_id            = Column(Integer, ForeignKey("rfp_documents.id"))
    assigned_to       = Column(Integer, ForeignKey("users.id"))
    assigned_by       = Column(Integer, ForeignKey("users.id"))
    assignment_status = Column(String(30), default="active")
    notes             = Column(Text)
    assigned_at       = Column(DateTime, default=func.now())
    updated_at        = Column(DateTime, default=func.now(), onupdate=func.now())

class RFPApproval(Base):
    __tablename__ = "rfp_approvals"
    id          = Column(Integer, primary_key=True, index=True)
    rfp_id      = Column(Integer, ForeignKey("rfp_documents.id"))
    approved_by = Column(Integer, ForeignKey("users.id"))
    decision    = Column(String(20), nullable=False)
    reason      = Column(Text)
    decided_at  = Column(DateTime, default=func.now())

class RFPComment(Base):
    __tablename__ = "rfp_comments"
    id           = Column(Integer, primary_key=True, index=True)
    rfp_id       = Column(Integer, ForeignKey("rfp_documents.id"))
    user_id      = Column(Integer, ForeignKey("users.id"))
    entity_type  = Column(String(50))
    entity_id    = Column(Integer)
    comment_text = Column(Text, nullable=False)
    created_at   = Column(DateTime, default=func.now())
    updated_at   = Column(DateTime, default=func.now(), onupdate=func.now())

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id          = Column(Integer, primary_key=True, index=True)
    rfp_id      = Column(Integer, ForeignKey("rfp_documents.id"))
    user_id     = Column(Integer, ForeignKey("users.id"))
    action      = Column(String(100), nullable=False)
    entity_type = Column(String(50))
    entity_id   = Column(Integer)
    old_value   = Column(Text)
    new_value   = Column(Text)
    ip_address  = Column(String(45))
    created_at  = Column(DateTime, default=func.now())

class RFPDraft(Base):
    __tablename__ = "rfp_drafts"
    id            = Column(Integer, primary_key=True, index=True)
    rfp_id        = Column(Integer, ForeignKey("rfp_documents.id"))
    section_name  = Column(String(200), nullable=True) # e.g., "Executive Summary"
    section_order = Column(Integer, default=1)
    version       = Column(Integer, default=1)
    draft_content = Column(Text, nullable=False)
    created_by    = Column(Integer, ForeignKey("users.id"))
    is_final      = Column(Boolean, default=False)
    created_at    = Column(DateTime, default=func.now())

class RFPRequirement(Base):
    __tablename__ = "rfp_requirements"
    id                = Column(Integer, primary_key=True, index=True)
    rfp_id            = Column(Integer, ForeignKey("rfp_documents.id"))
    requirement_text  = Column(Text, nullable=False)
    status            = Column(String(50), default="pending") # compliant, partial, non-compliant, pending
    response_strategy = Column(Text)
    notes             = Column(Text)
    category          = Column(String(100)) # technical, mandatory, eligibility, etc.
    created_at        = Column(DateTime, default=func.now())
    updated_at        = Column(DateTime, default=func.now(), onupdate=func.now())
