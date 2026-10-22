
from datetime import datetime

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.database import db

router = APIRouter()

lectures_collection = db["lectures"]


class LectureCreate(BaseModel):
    lecture_code: str = Field(..., min_length=1)
    subject_code: str = Field(..., min_length=1)
    professor_id: str = Field(..., min_length=1)
    professor_name: str = ""
    department: str = Field(..., min_length=1)
    course: str = "MCA"
    semester: int = Field(..., ge=1)
    lecture_date: str = Field(..., min_length=1)
    start_time: str = ""
    end_time: str = ""
    status: str = "scheduled"


def serialize_lecture(lecture: dict) -> dict:
    lecture["id"] = str(lecture.pop("_id"))
    return lecture


@router.get("/")
def get_lectures():
    lectures = lectures_collection.find().sort("lecture_date", -1)
    return [serialize_lecture(item) for item in lectures]


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_lecture(lecture: LectureCreate):
    lecture_data = lecture.model_dump()
    lecture_data["lecture_code"] = lecture_data["lecture_code"].strip()

    existing = lectures_collection.find_one(
        {"lecture_code": lecture_data["lecture_code"]}
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Lecture Code already exists.",
        )

    lecture_data["created_at"] = datetime.utcnow()
    result = lectures_collection.insert_one(lecture_data)
    saved = lectures_collection.find_one({"_id": result.inserted_id})

    return {
        "message": "Lecture created successfully.",
        "lecture": serialize_lecture(saved),
    }


@router.get("/{lecture_code}")
def get_lecture(lecture_code: str):
    lecture = lectures_collection.find_one(
        {"lecture_code": lecture_code}
    )

    if not lecture:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lecture not found.",
        )

    return serialize_lecture(lecture)