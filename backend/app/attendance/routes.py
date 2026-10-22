
import logging
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Body, Depends, HTTPException
from pymongo.errors import PyMongoError

from app.core.dependencies import (
    get_current_user,
    serialize_document,
    require_roles,
)
from app.notifications.service import notify_attendance_recorded
from app.database import (
    attendance_collection,
    lectures_collection,
    notifications_collection,
    students_collection,
)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/")
def list_attendance(
    lecture_code: str | None = None,
    registration_number: str | None = None,
    date: str | None = None,
    current_user: dict = Depends(get_current_user),
):
    try:
        query = {}

        if lecture_code:
            query["lecture_code"] = lecture_code.strip().upper()

        if registration_number:
            query["registration_number"] = registration_number.strip().upper()

        if date:
            query["attendance_date"] = date

        if current_user.get("role") == "student":
            own_reg = current_user.get("registration_number")
            if not own_reg:
                return []
            query["registration_number"] = own_reg.strip().upper()

        if current_user.get("role") == "professor":
            query["professor_id"] = current_user.get("professor_id")

        records = (
            attendance_collection.find(query)
            .sort("created_at", -1)
            .limit(1000)
        )
        return [serialize_document(item) for item in records]

    except PyMongoError:
        raise HTTPException(
            status_code=503,
            detail="Could not retrieve attendance.",
        )


@router.post("/", status_code=201)
def mark_attendance(
    data: dict = Body(...),
    current_user: dict = Depends(require_roles("admin", "professor")),
):
    lecture_code = str(data.get("lecture_code", "")).strip().upper()
    registration_number = str(
        data.get("registration_number", "")
    ).strip().upper()
    present = data.get("present")

    if (
        not lecture_code
        or not registration_number
        or not isinstance(present, bool)
    ):
        raise HTTPException(
            status_code=422,
            detail="lecture_code, registration_number, and boolean present are required.",
        )

    try:
        lecture = lectures_collection.find_one(
            {"lecture_code": lecture_code}
        )
        if not lecture:
            raise HTTPException(
                status_code=404,
                detail="Lecture not found.",
            )

        if current_user.get("role") == "professor":
            if lecture.get("professor_id") != current_user.get("professor_id"):
                raise HTTPException(
                    status_code=403,
                    detail="You cannot mark attendance for this lecture.",
                )

        student = students_collection.find_one(
            {"registration_number": registration_number}
        )
        if not student:
            raise HTTPException(
                status_code=404,
                detail="Student Registration Number not found.",
            )

        if student.get("department") != lecture.get("department"):
            raise HTTPException(
                status_code=422,
                detail="Student department does not match the lecture.",
            )

        if student.get("course") != lecture.get("course"):
            raise HTTPException(
                status_code=422,
                detail="Student course does not match the lecture.",
            )

        if str(student.get("semester")) != str(lecture.get("semester")):
            raise HTTPException(
                status_code=422,
                detail="Student semester does not match the lecture.",
            )

        existing = attendance_collection.find_one({
            "lecture_code": lecture_code,
            "registration_number": registration_number,
        })
        if existing:
            raise HTTPException(
                status_code=409,
                detail="Attendance has already been recorded for this student and lecture.",
            )

        now = datetime.now(timezone.utc)

        record = {
            "lecture_code": lecture_code,
            "registration_number": registration_number,
            "roll_number": student.get("roll_number"),
            "student_name": student.get("full_name"),
            "department": lecture.get("department"),
            "course": lecture.get("course"),
            "semester": lecture.get("semester"),
            "subject_code": lecture.get("subject_code"),
            "professor_id": lecture.get("professor_id"),
            "teacher_name": lecture.get("teacher_name"),
            "attendance_date": str(lecture.get("lecture_date")),
            "present": present,
            "status": "Present" if present else "Absent",
            "marked_by": current_user.get("email"),
            "created_at": now,
            "updated_at": now,
        }

        result = attendance_collection.insert_one(record)

        try:
            print("NOTIFICATION DEBUG: calling notification service")

            notify_attendance_recorded(
                registration_number=registration_number,
                lecture_code=lecture_code,
                present=present,
                attendance_id=str(result.inserted_id),
            )

            print("NOTIFICATION DEBUG: service finished")
            print(
                "NOTIFICATION DEBUG: total saved =",
                notifications_collection.count_documents({}),
            )

        except Exception:
            logger.exception("NOTIFICATION DEBUG: failed")

        return {
            "message": "Attendance recorded successfully.",
            "status": record["status"],
        }

    except HTTPException:
        raise
    except PyMongoError:
        logger.exception("Could not save attendance")
        raise HTTPException(
            status_code=503,
            detail="Could not save attendance.",
        )


@router.put("/{attendance_id}")
def update_attendance(
    attendance_id: str,
    data: dict = Body(...),
    current_user: dict = Depends(require_roles("admin", "professor")),
):
    present = data.get("present")

    if not isinstance(present, bool):
        raise HTTPException(
            status_code=422,
            detail="present must be true or false.",
        )

    try:
        selector = (
            {"_id": ObjectId(attendance_id)}
            if ObjectId.is_valid(attendance_id)
            else {"lecture_code": attendance_id.strip().upper()}
        )

        record = attendance_collection.find_one(selector)
        if not record:
            raise HTTPException(
                status_code=404,
                detail="Attendance record not found.",
            )

        if current_user.get("role") == "professor":
            if record.get("professor_id") != current_user.get("professor_id"):
                raise HTTPException(
                    status_code=403,
                    detail="You cannot update this attendance record.",
                )

        attendance_collection.update_one(
            {"_id": record["_id"]},
            {
                "$set": {
                    "present": present,
                    "status": "Present" if present else "Absent",
                    "updated_at": datetime.now(timezone.utc),
                    "updated_by": current_user.get("email"),
                }
            },
        )

        try:
            notify_attendance_recorded(
                registration_number=record["registration_number"],
                lecture_code=record["lecture_code"],
                present=present,
                attendance_id=str(record["_id"]),
                event_type="updated",
            )
        except Exception:
            logger.exception(
                "Could not create attendance update notification"
            )

        return {"message": "Attendance updated successfully."}

    except HTTPException:
        raise
    except PyMongoError:
        logger.exception("Could not update attendance")
        raise HTTPException(
            status_code=503,
            detail="Could not update attendance.",
        )
