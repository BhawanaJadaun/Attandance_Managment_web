from typing import Optional
from pydantic import Field, EmailStr
from app.models.common import MongoDocument, utc_now


class ProfessorModel(MongoDocument):
    professor_id: str = Field(..., min_length=1)
    name: str = Field(..., min_length=2)
    department: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    designation: Optional[str] = None
    status: str = "Active"
    created_at: object = Field(default_factory=utc_now)
    updated_at: object = Field(default_factory=utc_now)