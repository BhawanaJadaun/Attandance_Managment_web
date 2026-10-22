
from pydantic import BaseModel


class UserSettingsUpdate(BaseModel):
    theme: str | None = None
    notifications_enabled: bool | None = None
    default_page_size: int | None = None


class UserSettingsResponse(BaseModel):
    theme: str = "light"
    notifications_enabled: bool = True
    default_page_size: int = 10