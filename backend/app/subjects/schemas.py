
from pydantic import BaseModel, Field


class SubjectCreate(BaseModel):
    subject_code: str = Field(min_length=1, max_length=30)
    subject_name: str = Field(min_length=2, max_length=100)
    department: str
    course: str
    semester: int = Field(ge=1, le=12)
    professor_id: str | None = None


class SubjectUpdate(BaseModel):
    subject_name: str | None = None
    department: str | None = None
    course: str | None = None
    semester: int | None = Field(default=None, ge=1, le=12)
    professor_id: str | None = None