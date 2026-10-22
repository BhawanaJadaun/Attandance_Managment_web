from typing import Optional
from pydantic import BaseModel, EmailStr


class ProfileModel(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None