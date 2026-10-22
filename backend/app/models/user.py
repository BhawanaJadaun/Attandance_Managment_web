from typing import Optional, Literal
from pydantic import Field, EmailStr
from app.models.common import MongoDocument, utc_now


class UserModel(MongoDocument):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    role: Literal["admin", "professor", "student"] = "student"
    password_hash: Optional[str] = None
    is_active: bool = True
    created_at: object = Field(default_factory=utc_now)
    updated_at: object = Field(default_factory=utc_now)