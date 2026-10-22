from datetime import date
from typing import Optional
from pydantic import Field
from app.models.common import MongoDocument, utc_now


class AttendanceModel(MongoDocument):
    lecture_code: str = Field(..., min_length=1)
    registration_number: str = Field(..., min_length=1)
    roll_number: str
    student_name: Optional[str] = None
    subject_code: str
    professor_id: str
    professor_name: Optional[str] = None
    attendance_date: date
    is_present: bool
    remarks: Optional[str] = None
    created_at: object = Field(default_factory=utc_now)
    updated_at: object = Field(default_factory=utc_now)