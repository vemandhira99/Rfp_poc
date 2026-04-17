from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Numeric
from sqlalchemy.sql import func
from app.core.database import Base

class RFPSection(Base):
    __tablename__ = "rfp_sections"
    id           = Column(Integer, primary_key=True, index=True)
    rfp_id       = Column(Integer, ForeignKey("rfp_documents.id"), nullable=False)
    section_name = Column(String(200))
    section_text = Column(Text)
    page_number  = Column(Integer)
    confidence   = Column(Numeric(5, 2))
    created_at   = Column(DateTime, default=func.now())