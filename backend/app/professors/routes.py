
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Body, Depends, HTTPException
from pymongo.errors import PyMongoError, DuplicateKeyError

from app.core.dependencies import get_current_user, serialize_document, require_roles
from app.database import professors_collection

router = APIRouter()

ALLOWED_FIELDS = {
    "professor_id", "full_name", "email", "phone",
    "department", "designation", "status",
}

@router.get("/{professor_id}")
def get_professor(
    professor_id: str,
    current_user: dict = Depends(get_current_user),
):
    if not professor_id.strip():
        raise HTTPException(
            status_code=400,
            detail="Professor ID is required.",
        )

    selector = (
        {"_id": ObjectId(professor_id)}
        if ObjectId.is_valid(professor_id)
        else {"professor_id": professor_id.strip().upper()}
    )

    try:
        professor = professors_collection.find_one(selector)

        if not professor:
            raise HTTPException(
                status_code=404,
                detail="Professor not found.",
            )

        # Professors can view only their own profile.
        if current_user.get("role") == "professor":
            user_email = str(
                current_user.get("email", "")
            ).strip().lower()

            professor_email = str(
                professor.get("email", "")
            ).strip().lower()

            if user_email != professor_email:
                raise HTTPException(
                    status_code=404,
                    detail="Professor not found.",
                )

        return serialize_document(professor)

    except HTTPException:
        raise
    except PyMongoError:
        raise HTTPException(
            status_code=503,
            detail="Could not retrieve professor details.",
        )


@router.get("/")
def list_professors(
    current_user: dict = Depends(get_current_user),
):
    try:
        query = {}

        if current_user.get("role") == "professor":
            query["email"] = str(
                current_user.get("email", "")
            ).strip().lower()

        print("MongoDB database:", professors_collection.database.name)
        print(
            "Total professors in database:",
            professors_collection.count_documents({})
        )

        professors = list(
            professors_collection.find(query).sort("full_name", 1)
        )

        print("Professors returned by API:", len(professors))

        return [
            serialize_document(professor)
            for professor in professors
        ]

    except PyMongoError as error:
        print("Professor list error:", error)
        raise HTTPException(
            status_code=503,
            detail="Could not retrieve professors.",
        )



@router.post("/", status_code=201)
def create_professor(
    data: dict = Body(...),
    current_user: dict = Depends(require_roles("admin")),
):
    professor = {k: v for k, v in data.items() if k in ALLOWED_FIELDS}
    required = ("professor_id", "full_name", "email", "department")
    if any(not professor.get(k) for k in required):
        raise HTTPException(status_code=422, detail="Professor ID, name, email, and department are required.")

    professor["professor_id"] = str(professor["professor_id"]).strip().upper()
    professor["email"] = str(professor["email"]).strip().lower()
    professor["created_at"] = datetime.now(timezone.utc)
    professor["updated_at"] = datetime.now(timezone.utc)
    professor.setdefault("status", "Active")

    try:
        if professors_collection.find_one({"professor_id": professor["professor_id"]}):
            raise HTTPException(status_code=409, detail="Professor ID already exists.")
        if professors_collection.find_one({"email": professor["email"]}):
            raise HTTPException(status_code=409, detail="Professor email already exists.")

        professors_collection.insert_one(professor)
        return {"message": "Professor created successfully."}
    except HTTPException:
        raise
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="Professor identifier already exists.")
    except PyMongoError:
        raise HTTPException(status_code=503, detail="Could not save professor.")


@router.put("/{professor_id}")
def update_professor(
    professor_id: str,
    data: dict = Body(...),
    current_user: dict = Depends(require_roles("admin")),
):
    updates = {k: v for k, v in data.items() if k in ALLOWED_FIELDS}
    if not updates:
        raise HTTPException(status_code=422, detail="No valid fields provided.")

    if "email" in updates:
        updates["email"] = str(updates["email"]).strip().lower()
    if "professor_id" in updates:
        updates["professor_id"] = str(updates["professor_id"]).strip().upper()
    updates["updated_at"] = datetime.now(timezone.utc)

    selector = (
        {"_id": ObjectId(professor_id)}
        if ObjectId.is_valid(professor_id)
        else {"professor_id": professor_id.upper()}
    )
    try:
        result = professors_collection.update_one(selector, {"$set": updates})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Professor not found.")
        return {"message": "Professor updated successfully."}
    except HTTPException:
        raise
    except PyMongoError:
        raise HTTPException(status_code=503, detail="Could not update professor.")


@router.delete("/{professor_id}")
def delete_professor(
    professor_id: str,
    current_user: dict = Depends(require_roles("admin")),
):
    selector = (
        {"_id": ObjectId(professor_id)}
        if ObjectId.is_valid(professor_id)
        else {"professor_id": professor_id.upper()}
    )
    try:
        result = professors_collection.delete_one(selector)
        if not result.deleted_count:
            raise HTTPException(status_code=404, detail="Professor not found.")
        return {"message": "Professor deleted successfully."}
    except HTTPException:
        raise
    except PyMongoError:
        raise HTTPException(status_code=503, detail="Could not delete professor.")