
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from pymongo.errors import DuplicateKeyError, PyMongoError

from app.core.dependencies import get_current_user, serialize_document, require_roles
from app.database import students_collection

router = APIRouter()


def clean_student(data: dict, partial: bool = False) -> dict:
    allowed = {
        "registration_number", "roll_number", "full_name",
        "department", "course", "semester", "section",
        "email", "phone", "status",
    }
    result = {key: value for key, value in data.items() if key in allowed}

    if not partial:
        required = [
            "registration_number", "roll_number", "full_name",
            "department", "course", "semester",
        ]
        missing = [key for key in required if not result.get(key)]
        if missing:
            raise HTTPException(
                status_code=422,
                detail=f"Required fields missing: {', '.join(missing)}",
            )

    for key in ("registration_number", "roll_number", "full_name",
                "department", "course", "section", "email", "phone"):
        if key in result and isinstance(result[key], str):
            result[key] = result[key].strip()

    if "registration_number" in result:
        result["registration_number"] = result["registration_number"].upper()

    if "semester" in result:
        try:
            result["semester"] = int(result["semester"])
            if result["semester"] < 1:
                raise ValueError()
        except (ValueError, TypeError):
            raise HTTPException(status_code=422, detail="Semester must be a positive integer.")

    return result


@router.get("/")
def list_students(
    search: str | None = Query(default=None),
    department: str | None = None,
    course: str | None = None,
    semester: int | None = None,
    current_user: dict = Depends(get_current_user),
):
    try:
        query = {}
        if search:
            query["$or"] = [
                {"registration_number": {"$regex": search, "$options": "i"}},
                {"roll_number": {"$regex": search, "$options": "i"}},
                {"full_name": {"$regex": search, "$options": "i"}},
            ]
        if department:
            query["department"] = department
        if course:
            query["course"] = course
        if semester is not None:
            query["semester"] = semester

        # Students may only view their own record.
        if current_user.get("role") == "student":
            registration_number = current_user.get("registration_number")
            if not registration_number:
                return []
            query["registration_number"] = registration_number

        records = students_collection.find(query).sort("full_name", 1).limit(500)
        return [serialize_document(item) for item in records]
    except PyMongoError:
        raise HTTPException(status_code=503, detail="Could not retrieve students.")


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_student(
    data: dict = Body(...),
    current_user: dict = Depends(require_roles("admin")),
):
    student = clean_student(data)
    student["created_at"] = datetime.now(timezone.utc)
    student["updated_at"] = datetime.now(timezone.utc)
    student.setdefault("status", "Active")

    try:
        if students_collection.find_one(
            {"registration_number": student["registration_number"]}
        ):
            raise HTTPException(status_code=409, detail="Registration Number already exists.")

        students_collection.insert_one(student)
        return {"message": "Student created successfully."}
    except HTTPException:
        raise
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="Duplicate student identifier.")
    except PyMongoError:
        raise HTTPException(status_code=503, detail="Could not save student.")


@router.get("/{student_id}")
def get_student(
    student_id: str,
    current_user: dict = Depends(get_current_user),
):
    try:
        if ObjectId.is_valid(student_id):
            student = students_collection.find_one({"_id": ObjectId(student_id)})
        else:
            student = students_collection.find_one(
                {"registration_number": student_id.upper()}
            )

        if not student:
            raise HTTPException(status_code=404, detail="Student not found.")

        if current_user.get("role") == "student":
            if current_user.get("registration_number") != student.get("registration_number"):
                raise HTTPException(status_code=403, detail="You can only view your own record.")

        return serialize_document(student)
    except HTTPException:
        raise
    except PyMongoError:
        raise HTTPException(status_code=503, detail="Could not retrieve student.")


@router.put("/{student_id}")
def update_student(
    student_id: str,
    data: dict = Body(...),
    current_user: dict = Depends(require_roles("admin")),
):
    updates = clean_student(data, partial=True)

    if not updates:
        raise HTTPException(
            status_code=422,
            detail="No valid fields provided."
        )

    updates["updated_at"] = datetime.now(timezone.utc)

    try:
        # Find the existing student using either MongoDB ID
        # or registration number.
        if ObjectId.is_valid(student_id):
            selector = {"_id": ObjectId(student_id)}
        else:
            selector = {
                "registration_number": student_id.strip().upper()
            }

        existing_student = students_collection.find_one(selector)

        if not existing_student:
            raise HTTPException(
                status_code=404,
                detail="Student not found."
            )

        # Check for duplicates only if the registration number
        # is being changed.
        if "registration_number" in updates:
            new_registration = updates["registration_number"]
            old_registration = existing_student.get(
                "registration_number", ""
            )

            if new_registration != old_registration:
                duplicate = students_collection.find_one({
                    "registration_number": new_registration,
                    "_id": {"$ne": existing_student["_id"]}
                })

                if duplicate:
                    raise HTTPException(
                        status_code=409,
                        detail="Registration Number already exists."
                    )

        result = students_collection.update_one(
            {"_id": existing_student["_id"]},
            {"$set": updates}
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Student not found."
            )

        return {
            "message": "Student updated successfully."
        }

    except HTTPException:
        raise
    except DuplicateKeyError:
        raise HTTPException(
            status_code=409,
            detail="Registration Number already exists."
        )
    except PyMongoError:
        raise HTTPException(
            status_code=503,
            detail="Could not update student."
        )



@router.delete("/{student_id}")
def delete_student(
    student_id: str,
    current_user: dict = Depends(require_roles("admin")),
):
    try:
        selector = (
            {"_id": ObjectId(student_id)}
            if ObjectId.is_valid(student_id)
            else {"registration_number": student_id.upper()}
        )
        result = students_collection.delete_one(selector)
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Student not found.")

        return {"message": "Student deleted successfully."}
    except HTTPException:
        raise
    except PyMongoError:
        raise HTTPException(status_code=503, detail="Could not delete student.")