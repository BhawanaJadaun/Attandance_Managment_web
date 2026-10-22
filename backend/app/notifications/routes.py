from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pymongo.errors import PyMongoError

from app.core.dependencies import get_current_user, serialize_document
from app.database import notifications_collection
from app.notifications.service import preference_enabled

router = APIRouter()


@router.get("/")
def list_notifications(
    current_user: dict = Depends(get_current_user),
):
    try:
        user_id = str(current_user["_id"])

        records = notifications_collection.find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(50)

        notifications = []

        for record in records:
            preference_key = record.get("preference_key")

            if preference_key and not preference_enabled(
                user_id, preference_key
            ):
                continue

            notifications.append(serialize_document(record))

        return {
            "notifications": notifications,
            "unread_count": sum(
                1 for item in notifications
                if not item.get("is_read", False)
            ),
        }

    except PyMongoError:
        raise HTTPException(
            status_code=503,
            detail="Could not retrieve notifications.",
        )


@router.patch("/{notification_id}/read")
def mark_notification_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
):
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid notification ID.",
        )

    try:
        result = notifications_collection.update_one(
            {
                "_id": ObjectId(notification_id),
                "user_id": str(current_user["_id"]),
            },
            {"$set": {"is_read": True}},
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Notification not found.",
            )

        return {"message": "Notification marked as read."}

    except HTTPException:
        raise
    except PyMongoError:
        raise HTTPException(
            status_code=503,
            detail="Could not update notification.",
        )


@router.patch("/read-all")
def mark_all_notifications_read(
    current_user: dict = Depends(get_current_user),
):
    try:
        notifications_collection.update_many(
            {
                "user_id": str(current_user["_id"]),
                "is_read": False,
            },
            {"$set": {"is_read": True}},
        )

        return {"message": "Notifications marked as read."}

    except PyMongoError:
        raise HTTPException(
            status_code=503,
            detail="Could not update notifications.",
        )