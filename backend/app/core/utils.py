from bson import ObjectId
from datetime import datetime, date
from fastapi.encoders import jsonable_encoder


def serialize_document(document):
    if not document:
        return None

    result = dict(document)
    result["id"] = str(result.pop("_id"))

    return jsonable_encoder(
        result,
        custom_encoder={
            ObjectId: str,
            datetime: lambda value: value.isoformat(),
            date: lambda value: value.isoformat(),
        },
    )