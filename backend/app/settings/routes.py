
from datetime import datetime, timezone

from fastapi import APIRouter, Body, Depends, HTTPException
from pymongo.errors import PyMongoError

from app.core.dependencies import get_current_user, serialize_document
from app.database import settings_collection

router = APIRouter()


ALLOWED_SETTINGS = {
    "theme",
    "email_notifications",
    "dashboard_layout",
    "language",
    "emailNotifications",
    "attendanceReminder",
    "lowAttendanceAlert",
    "loginAlerts",
    "autoSaveAttendance",
    "allowDuplicateAttendance",
    "minimumAttendance",
    "sessionTimeout",
    "emailReports",
}



@router.get("/me")
def get_settings(current_user: dict = Depends(get_current_user)):
    try:
        saved = settings_collection.find_one({"user_id": current_user["_id"]})
        if not saved:
            return {
                "theme": "light",
                "email_notifications": True,
                "dashboard_layout": "default",
                "language": "en",
            }
        saved.pop("_id", None)
        saved.pop("user_id", None)
        return saved
    except PyMongoError:
        raise HTTPException(status_code=503, detail="Could not retrieve settings.")


@router.put("/me")
def update_settings(
    data: dict = Body(...),
    current_user: dict = Depends(get_current_user),
):
    updates = {key: value for key, value in data.items() if key in ALLOWED_SETTINGS}
    if not updates:
        raise HTTPException(status_code=422, detail="No supported settings were provided.")

    if "theme" in updates and updates["theme"] not in ("light", "dark", "system"):
        raise HTTPException(status_code=422, detail="Theme must be light, dark, or system.")

    if "email_notifications" in updates and not isinstance(updates["email_notifications"], bool):
        raise HTTPException(status_code=422, detail="email_notifications must be true or false.")

    updates["updated_at"] = datetime.now(timezone.utc)

    try:
        settings_collection.update_one(
            {"user_id": current_user["_id"]},
            {
                "$set": updates,
                "$setOnInsert": {
                    "user_id": current_user["_id"],
                    "created_at": datetime.now(timezone.utc),
                },
            },
            upsert=True,
        )
        return {"message": "Settings saved successfully."}
    except PyMongoError:
        raise HTTPException(status_code=503, detail="Could not save settings.")