
from fastapi import APIRouter, Depends, HTTPException
from pymongo.errors import PyMongoError

from app.core.dependencies import get_current_user
from app.database import (
    students_collection,
    professors_collection,
    subjects_collection,
    lectures_collection,
    attendance_collection,
)

router = APIRouter()


@router.get("/")
def dashboard(current_user: dict = Depends(get_current_user)):
    try:
        role = current_user.get("role", "").lower()

        if role == "student":
            registration_number = current_user.get("registration_number")
            if not registration_number:
                raise HTTPException(
                    status_code=403,
                    detail="Your account is not linked to a student record.",
                )

            records = list(attendance_collection.find({
                "registration_number": registration_number
            }).limit(5000))

            total = len(records)
            present = sum(1 for r in records if r.get("present") is True)

            return {
                "role": role,
                "registration_number": registration_number,
                "total_classes": total,
                "present": present,
                "absent": total - present,
                "attendance_percentage": round(present / total * 100, 2) if total else 0,
            }

        if role == "professor":
            professor_id = current_user.get("professor_id")
            lecture_query = {"professor_id": professor_id}
            lecture_codes = [
                item["lecture_code"]
                for item in lectures_collection.find(lecture_query, {"lecture_code": 1})
                if item.get("lecture_code")
            ]
            attendance_query = {"lecture_code": {"$in": lecture_codes}}

            return {
                "role": role,
                "my_lectures": len(lecture_codes),
                "attendance_records": attendance_collection.count_documents(attendance_query),
                "students": students_collection.count_documents({}),
            }

        total_students = students_collection.count_documents({})
        total_professors = professors_collection.count_documents({})
        total_subjects = subjects_collection.count_documents({})
        total_lectures = lectures_collection.count_documents({})
        total_attendance = attendance_collection.count_documents({})
        present_count = attendance_collection.count_documents({"present": True})
        absent_count = attendance_collection.count_documents({"present": False})

        return {
            "role": role,
            "total_students": total_students,
            "total_professors": total_professors,
            "total_subjects": total_subjects,
            "total_lectures": total_lectures,
            "total_attendance_records": total_attendance,
            "present_records": present_count,
            "absent_records": absent_count,
        }
    except HTTPException:
        raise
    except PyMongoError:
        raise HTTPException(status_code=503, detail="Could not load dashboard statistics.")