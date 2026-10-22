
from datetime import datetime, timezone

from fastapi import APIRouter, Body, Depends, HTTPException
from pymongo.errors import PyMongoError

from app.core.dependencies import get_current_user
from app.database import users_collection

router = APIRouter()


@router.get("/me")
def get_my_profile(current_user: dict = Depends(get_current_user)):
    current_user.pop("password_hash", None)
    return current_user


@router.put("/me")
def update_my_profile(
    data: dict = Body(...),
    current_user: dict = Depends(get_current_user),
):
    allowed = {"full_name", "phone"}
    updates = {
        key: value.strip() if isinstance(value, str) else value
        for key, value in data.items()
        if key in allowed
    }

    if not updates:
        raise HTTPException(status_code=422, detail="Provide full_name or phone to update.")

    updates["updated_at"] = datetime.now(timezone.utc)

    try:
        from bson import ObjectId

        user_id = current_user.get("_id")
        if not user_id or not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=401, detail="Invalid user account.")

        result = users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": updates},
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found.")

        return {"message": "Profile updated successfully."}
    except HTTPException:
        raise
    except PyMongoError:
        raise HTTPException(status_code=503, detail="Could not update profile.")