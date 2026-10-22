
from pydantic import BaseModel, Field
from datetime import date, time
from typing import Literal


class LectureCreate(BaseModel):
    lecture_code: str = Field(min_length=1, max_length=50)
    subject_code: str
    professor_id: str
    department: str
    course: str
    semester: int = Field(ge=1, le=12)
    lecture_date: date
    start_time: time | None = None
    end_time: time | None = None
    status: Literal["Scheduled", "Completed", "Cancelled"] = "Scheduled"


class LectureUpdate(BaseModel):
    subject_code: str | None = None
    professor_id: str | None = None
    department: str | None = None
    course: str | None = None
    semester: int | None = Field(default=None, ge=1, le=12)
    lecture_date: date | None = None
    start_time: time | None = None
    end_time: time | None = None
    status: Literal["Scheduled", "Completed", "Cancelled"] | None = None