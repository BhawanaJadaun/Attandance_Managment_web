```python
from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pymongo.errors import (
    DuplicateKeyError,
    PyMongoError,
)
from starlette.exceptions import HTTPException as StarletteHTTPException


async def http_exception_handler(
    request: Request,
    exc: StarletteHTTPException,
):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": str(exc.detail),
        },
        headers=exc.headers,
    )


async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
):
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "message": "Request validation failed",
            "errors": [
                {
                    "field": ".".join(
                        str(part) for part in error["loc"]
                    ),
                    "message": error["msg"],
                }
                for error in exc.errors()
            ],
        },
    )


async def duplicate_key_handler(
    request: Request,
    exc: DuplicateKeyError,
):
    return JSONResponse(
        status_code=409,
        content={
            "success": False,
            "message": "A record with this unique value already exists",
        },
    )


async def database_exception_handler(
    request: Request,
    exc: PyMongoError,
):
    return JSONResponse(
        status_code=503,
        content={
            "success": False,
            "message": "Database operation failed. Please try again.",
        },
    )


async def unexpected_exception_handler(
    request: Request,
    exc: Exception,
):
    # Log the full exception on the server, never expose it to clients.
    import logging

    logging.getLogger("attendance_api").exception(
        "Unhandled API exception"
    )

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "An unexpected server error occurred",
        },
    )
```
