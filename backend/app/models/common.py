from datetime import datetime, timezone
from pydantic import BaseModel, ConfigDict


def utc_now():
    return datetime.now(timezone.utc)


class MongoDocument(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        str_strip_whitespace=True,
        extra="ignore",
    )


def mongo_safe_dict(model: BaseModel, exclude_unset: bool = False):
    """Convert a Pydantic model into a MongoDB-friendly dictionary."""
    data = model.model_dump(
        by_alias=True,
        exclude_unset=exclude_unset,
        exclude_none=True,
    )
    data.pop("_id", None)
    return data