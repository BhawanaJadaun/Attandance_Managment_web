
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Literal


class StudentCreate(BaseModel):
    registration_number: str = Field(min_length=1, max_length=50)
    roll_no: str = Field(min_length=1, max_length=30)
    name: str = Field(min_length=2, max_length=100)
    department: str
    course: str = "MCA"
    semester: int = Field(ge=1, le=12)
    section: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    status: Literal["Active", "Inactive"] = "Active"


class StudentUpdate(BaseModel):
    roll_no: str | None = None
    name: str | None = None
    department: str | None = None
    course: str | None = None
    semester: int | None = Field(default=None, ge=1, le=12)
    section: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    status: Literal["Active", "Inactive"] | None = None


class StudentResponse(StudentCreate):
    id: str
    model_config = ConfigDict(from_attributes=True)