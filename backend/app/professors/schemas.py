
from pydantic import BaseModel, EmailStr, Field
from typing import Literal


class ProfessorCreate(BaseModel):
    professor_id: str = Field(min_length=1, max_length=50)
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone: str | None = None
    department: str
    status: Literal["Active", "Inactive"] = "Active"


class ProfessorUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    department: str | None = None
    status: Literal["Active", "Inactive"] | None = None