from datetime import date
from typing import Optional
from pydantic import BaseModel, Field


class AttendanceReportFilterModel(BaseModel):
    registration_number: Optional[str] = None
    roll_number: Optional[str] = None
    department: Optional[str] = None
    subject_code: Optional[str] = None
    professor_id: Optional[str] = None
    lecture_code: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = Field(default=None, pattern="^(Present|Absent)$")