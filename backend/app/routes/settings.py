from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models import User
from app.services.auth_service import get_current_user
from app.services.ai_service import get_ai_status

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("/system")
def get_system_settings(current_user: User = Depends(get_current_user)):
    ai_stat = get_ai_status()
    db_type = "PostgreSQL" if "postgresql" in settings.DATABASE_URL else "SQLite (Local Dev)"
    
    return {
        "product_name": settings.PROJECT_NAME,
        "version": "1.0.0-MVP",
        "database_type": db_type,
        "ai_status": ai_stat,
        "storage_directory": settings.UPLOAD_DIR,
        "jwt_algorithm": settings.ALGORITHM,
        "token_expiry_days": 7
    }
