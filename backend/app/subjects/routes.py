
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Body, Depends, HTTPException
from pymongo.errors import PyMongoError

from app.core.dependencies import get_current_user, serialize_document, require_roles
from app.database import subjects_collection, professors_collection

router = APIRouter()

FIELDS = {
    "subject_code", "subject_name", "department",
    "course", "semester", "professor_id", "credits", "status",
}


@router.get("/")
def list_subjects(
    current_user: dict = Depends(get_current_user),
):
    try:
        query = {}

        if current_user.get("role") == "professor":
            query["professor_id"] = current_user.get("professor_id")

        subjects = list(
            subjects_collection.find(query)
            .sort("subject_code", 1)
            .limit(500)
        )

        # Load professors once instead of querying for each subject.
        professors = list(
            professors_collection.find(
                {},
                {
                    "_id": 1,
                    "professor_id": 1,
                    "full_name": 1,
                },
            )
        )

        # Match either the business Professor ID or MongoDB document ID.
        professor_map = {}

        for professor in professors:
            name = str(professor.get("full_name") or "").strip()

            if not name:
                continue

            professor_id = professor.get("professor_id")
            mongo_id = professor.get("_id")

            if professor_id:
                professor_map[str(professor_id).strip().casefold()] = name

            if mongo_id is not None:
                professor_map[str(mongo_id).strip().casefold()] = name

        result = []

        for subject in subjects:
            item = serialize_document(subject)

            professor_id = (
                subject.get("professor_id")
                or subject.get("professorId")
                or subject.get("teacher_id")
                or subject.get("teacherId")
            )

            # Keep an existing professor name if one is already stored.
            professor_name = (
                subject.get("professor_name")
                or subject.get("professorName")
                or subject.get("teacher_name")
                or subject.get("teacherName")
                or ""
            )

            if professor_id is not None:
                key = str(professor_id).strip().casefold()
                professor_name = professor_map.get(key, professor_name)

            item["professor_name"] = professor_name
            result.append(item)

        return result

    except PyMongoError as exc:
        print(f"MongoDB list_subjects error: {exc!r}")
        raise HTTPException(
            status_code=503,
            detail="Could not retrieve subjects.",
        ) from exc
    try:
        query = {}

        if current_user.get("role") == "professor":
            query["professor_id"] = current_user.get("professor_id")

        subjects = list(
            subjects_collection.find(query)
            .sort("subject_code", 1)
            .limit(500)
        )

        result = []

        for subject in subjects:
            professor_id = str(
                subject.get("professor_id") or ""
            ).strip()

            professor = None

            if professor_id:
                professor = professors_collection.find_one(
                    {"professor_id": professor_id},
                    {"_id": 0, "professor_id": 1, "full_name": 1},
                )

                # Support older records that may store MongoDB _id.
                if not professor and ObjectId.is_valid(professor_id):
                    professor = professors_collection.find_one(
                        {"_id": ObjectId(professor_id)},
                        {"_id": 0, "professor_id": 1, "full_name": 1},
                    )

            item = serialize_document(subject)
            item["professor_name"] = (
                professor.get("full_name", "")
                if professor
                else ""
            )

            result.append(item)

        return result

    except PyMongoError:
        raise HTTPException(
            status_code=503,
            detail="Could not retrieve subjects.",
        )


    try:
        query = {}
        if current_user.get("role") == "professor":
            query["professor_id"] = current_user.get("professor_id")

        return [
            serialize_document(item)
            for item in subjects_collection.find(query).sort("subject_code", 1).limit(500)
        ]
    except PyMongoError:
        raise HTTPException(status_code=503, detail="Could not retrieve subjects.")


@router.post("/", status_code=201)
def create_subject(
    data: dict = Body(...),
    current_user: dict = Depends(require_roles("admin")),
):
    subject = {k: v for k, v in data.items() if k in FIELDS}
    required = ("subject_code", "subject_name", "department", "course", "semester")
    if any(not subject.get(k) for k in required):
        raise HTTPException(status_code=422, detail="Subject code, name, department, course, and semester are required.")

    subject["subject_code"] = str(subject["subject_code"]).strip().upper()
    subject["created_at"] = datetime.now(timezone.utc)
    subject["updated_at"] = datetime.now(timezone.utc)
    subject.setdefault("status", "Active")

    try:
        if subjects_collection.find_one({"subject_code": subject["subject_code"]}):
            raise HTTPException(status_code=409, detail="Subject Code already exists.")

        subjects_collection.insert_one(subject)
        return {"message": "Subject created successfully."}
    except HTTPException:
        raise
    except PyMongoError:
        raise HTTPException(status_code=503, detail="Could not save subject.")



@router.put("/{subject_id}")
def update_subject(
    subject_id: str,
    data: dict = Body(...),
    current_user: dict = Depends(require_roles("admin")),
):
    updates = {k: v for k, v in data.items() if k in FIELDS}

    if not updates:
        raise HTTPException(
            status_code=422,
            detail="No valid fields provided.",
        )

    if "subject_code" in updates:
        updates["subject_code"] = str(updates["subject_code"]).strip().upper()

    updates["updated_at"] = datetime.now(timezone.utc)

    selector = (
        {"_id": ObjectId(subject_id)}
        if ObjectId.is_valid(subject_id)
        else {"subject_code": subject_id.strip().upper()}
    )

    try:
        existing = subjects_collection.find_one(selector)

        if not existing:
            raise HTTPException(
                status_code=404,
                detail="Subject not found.",
            )

        # Check whether another subject already uses this code.
        if "subject_code" in updates:
            duplicate = subjects_collection.find_one({
                "subject_code": updates["subject_code"],
                "_id": {"$ne": existing["_id"]},
            })

            if duplicate:
                raise HTTPException(
                    status_code=409,
                    detail="Subject Code already exists.",
                )

        result = subjects_collection.update_one(
            {"_id": existing["_id"]},
            {"$set": updates},
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Subject not found.",
            )

        return {"message": "Subject updated successfully."}

    except HTTPException:
        raise

    except PyMongoError as exc:
        # Print the real MongoDB error in the backend terminal.
        print(f"MongoDB update_subject error: {exc!r}")

        raise HTTPException(
            status_code=503,
            detail="Could not update subject. Check the backend terminal.",
        ) from exc


@router.delete("/{subject_id}")
def delete_subject(
    subject_id: str,
    current_user: dict = Depends(require_roles("admin")),
):
    selector = (
        {"_id": ObjectId(subject_id)}
        if ObjectId.is_valid(subject_id)
        else {"subject_code": subject_id.upper()}
    )
    try:
        result = subjects_collection.delete_one(selector)
        if not result.deleted_count:
            raise HTTPException(status_code=404, detail="Subject not found.")
        return {"message": "Subject deleted successfully."}
    except HTTPException:
        raise
    except PyMongoError:
        raise HTTPException(status_code=503, detail="Could not delete subject.")