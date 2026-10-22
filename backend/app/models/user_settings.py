from pydantic import Field
from app.models.common import MongoDocument, utc_now


class UserSettingsModel(MongoDocument):
    user_id: str
    theme: str = "light"
    email_notifications: bool = True
    attendance_alerts: bool = True
    language: str = "en"
    created_at: object = Field(default_factory=utc_now)
    updated_at: object = Field(default_factory=utc_now)