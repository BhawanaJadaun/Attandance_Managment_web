
from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import InvalidTokenError
import jwt

from app.config import settings
from app.database import users_collection

bearer_scheme = HTTPBearer(auto_error=False)


def serialize_document(document: dict) -> dict:
    """Convert MongoDB ObjectId values into JSON-safe strings."""
    if not document:
        return {}

    result = dict(document)
    result["_id"] = str(result["_id"])

    for key, value in result.items():
        if isinstance(value, ObjectId):
            result[key] = str(value)

    return result


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """Validate the bearer token and return the active database user."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

        subject = payload.get("sub")
        email = payload.get("email")

        if not subject and not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token does not identify a user.",
            )

        user = None

        # Support tokens whose subject is a MongoDB user ID.
        if subject and ObjectId.is_valid(str(subject)):
            user = users_collection.find_one({"_id": ObjectId(str(subject))})

        # Also support existing tokens whose subject is an email address.
        if user is None:
            candidate_email = email or subject
            if candidate_email and "@" in str(candidate_email):
                user = users_collection.find_one(
                    {"email": str(candidate_email).lower()}
                )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account not found.",
            )

        if user.get("is_active", True) is False:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account is inactive.",
            )

        return serialize_document(user)

    except HTTPException:
        raise
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service is temporarily unavailable.",
        )


def require_roles(*allowed_roles: str):
    """Dependency factory for role-based access control."""
    def role_checker(current_user: dict = Depends(get_current_user)):
        role = str(current_user.get("role", "")).lower()

        if role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action.",
            )

        return current_user

    return role_checker