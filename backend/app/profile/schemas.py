
from pydantic import BaseModel, EmailStr, Field


class ProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    email: EmailStr | None = None
    phone: str | None = None


class ProfileResponse(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    role: str