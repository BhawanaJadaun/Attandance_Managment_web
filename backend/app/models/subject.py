from typing import Optional
from app.models.common import MongoDocument, utc_now


class SubjectModel(MongoDocument):
    subject_code: str
    subject_name: str
    department: str
    course: str = "MCA"
    semester: int = 1
    professor_id: Optional[str] = None
    status: str = "Active"
    created_at: object = utc_now()
    updated_at: object = utc_now()