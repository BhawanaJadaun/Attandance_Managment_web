from typing import Optional
from pydantic import Field, EmailStr
from app.models.common import MongoDocument, utc_now


class StudentModel(MongoDocument):
    registration_number: str = Field(..., min_length=1)
    roll_number: str = Field(..., min_length=1)
    name: str = Field(..., min_length=2)
    department: str
    course: str = "MCA"
    semester: int = Field(default=1, ge=1, le=12)
    section: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    status: str = "Active"
    created_at: object = Field(default_factory=utc_now)
    updated_at: object = Field(default_factory=utc_now)