
from pydantic import BaseModel, Field
from datetime import date
from typing import Literal


class AttendanceCreate(BaseModel):
    lecture_code: str
    registration_number: str
    roll_no: str
    subject_code: str
    professor_id: str
    attendance_date: date
    status: Literal["Present", "Absent"]


class AttendanceUpdate(BaseModel):
    status: Literal["Present", "Absent"]


class AttendanceResponse(AttendanceCreate):
    id: str