from datetime import date, time
from typing import Optional
from pydantic import Field, model_validator
from app.models.common import MongoDocument, utc_now


class LectureModel(MongoDocument):
    lecture_code: str = Field(..., min_length=1)
    subject_code: str
    subject_name: Optional[str] = None
    professor_id: str
    professor_name: Optional[str] = None
    department: str
    course: str = "MCA"
    semester: int = Field(default=1, ge=1, le=12)
    lecture_date: date
    start_time: time
    end_time: time
    status: str = "Scheduled"
    created_at: object = Field(default_factory=utc_now)
    updated_at: object = Field(default_factory=utc_now)

    @model_validator(mode="after")
    def validate_time(self):
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be later than start_time")
        return self