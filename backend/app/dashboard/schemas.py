
from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_students: int = 0
    total_professors: int = 0
    total_subjects: int = 0
    total_lectures: int = 0
    present_today: int = 0
    absent_today: int = 0
    attendance_percentage: float = 0.0