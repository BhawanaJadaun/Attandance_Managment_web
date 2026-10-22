
from pydantic import BaseModel
from datetime import date


class AttendanceReportFilter(BaseModel):
    registration_number: str | None = None
    roll_no: str | None = None
    department: str | None = None
    subject_code: str | None = None
    professor_id: str | None = None
    lecture_code: str | None = None
    start_date: date | None = None
    end_date: date | None = None