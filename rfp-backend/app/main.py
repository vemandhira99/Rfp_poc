from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from app.core.config import settings
from app.api.routes import auth, rfps, uploads, ai   # ✅ added ai
import os

# Security scheme (for JWT / token-based auth)
security = HTTPBearer()

# Database initialization
from app.core.database import engine, Base
from app.models import Notification # Ensure all models are imported
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="RFP POC Backend",
    version="1.0.0",
    description="Backend API for RFP Management System"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Register routers
from app.models import rfp, role, sections, user

# trigger reload
app.include_router(auth.router)
app.include_router(rfps.router)
app.include_router(uploads.router)
# Trigger reload check 2
app.include_router(ai.router)   # ✅ NEW

@app.get("/")
def root():
    return {
        "status": "RFP Backend is running",
        "version": "1.0.0"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}