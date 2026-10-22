
from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pymongo.collation import Collation
from pymongo.errors import PyMongoError

from app.core.dependencies import get_current_user, serialize_document
from app.database import attendance_collection, students_collection

router = APIRouter()


@router.get("/attendance")
def attendance_report(
    registration_number: str | None = None,
    department: str | None = None,
    subject_code: str | None = None,
    professor_id: str | None = None,
    lecture_code: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    current_user: dict = Depends(get_current_user),
):
    try:
        role = str(current_user.get("role", "")).lower()
        query = {}

        # Restrict student reports to the authenticated student.
        if role == "student":
            own_registration = current_user.get("registration_number")
            user_id = current_user.get("_id") or current_user.get("id")
            linked_student = None

            # Match an explicit user_id link, if present.
            if user_id:
                linked_student = students_collection.find_one(
                    {"user_id": user_id}
                )

                if not linked_student and ObjectId.is_valid(str(user_id)):
                    linked_student = students_collection.find_one(
                        {"user_id": ObjectId(str(user_id))}
                    )

            # Otherwise, match the login email to the student email.
            user_email = str(current_user.get("email") or "").strip().lower()

            if not linked_student and user_email:
                linked_student = students_collection.find_one(
                    {"email": user_email},
                    collation=Collation(locale="en", strength=2),
                )

            if linked_student:
                own_registration = linked_student.get("registration_number")

            if not own_registration:
                raise HTTPException(
                    status_code=403,
                    detail=(
                        "Student account is not linked. "
                        "Ensure your login email matches the email "
                        "on your student record."
                    ),
                )

            query["registration_number"] = (
                str(own_registration).strip().upper()
            )

        elif role == "professor":
            own_professor_id = current_user.get("professor_id")

            if not own_professor_id:
                raise HTTPException(
                    status_code=403,
                    detail="Professor account is not linked.",
                )

            query["professor_id"] = own_professor_id

        elif role not in {"admin", "administrator"}:
            raise HTTPException(
                status_code=403,
                detail="You are not authorized to view these reports.",
            )

        # Apply optional filters without overriding student restrictions.
        if department:
            query["department"] = department.strip()

        if subject_code:
            query["subject_code"] = subject_code.strip().upper()

        if lecture_code:
            query["lecture_code"] = lecture_code.strip().upper()

        if start_date or end_date:
            date_filter = {}

            if start_date:
                date_filter["$gte"] = start_date

            if end_date:
                date_filter["$lte"] = end_date

            query["attendance_date"] = date_filter

        # Only administrators may select another student or professor.
        if role in {"admin", "administrator"}:
            if registration_number:
                query["registration_number"] = (
                    registration_number.strip().upper()
                )

            if professor_id:
                query["professor_id"] = professor_id.strip()

        records = [
            serialize_document(item)
            for item in attendance_collection.find(query)
            .sort("attendance_date", -1)
            .limit(5000)
        ]

        total = len(records)
        present = sum(
            1 for item in records if item.get("present") is True
        )
        absent = sum(
            1 for item in records if item.get("present") is False
        )

        return {
            "filters": query,
            "total_records": total,
            "present": present,
            "absent": absent,
            "attendance_percentage": (
                round(present / total * 100, 2) if total else 0
            ),
            "records": records,
        }

    except HTTPException:
        raise
    except PyMongoError:
        raise HTTPException(
            status_code=503,
            detail="Could not generate attendance report.",
        )