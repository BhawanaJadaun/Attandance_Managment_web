
from datetime import datetime, timedelta

from app.authentication.models import (
    otp_document,
    user_document,
)
from app.authentication.otp import (
    generate_otp,
    hash_otp,
)
from app.authentication.security import hash_password
from app.config import settings
from app.database import (
    users_collection,
    otp_collection,
)


# =========================================================
# CREATE USER
# =========================================================

def create_user(
    full_name: str,
    email: str,
    role: str,
    password: str,
    phone: str | None = None,
):
    normalized_email = email.strip().lower()

    document = user_document(
        full_name=full_name.strip(),
        phone=phone,
        email=normalized_email,
        password_hash=hash_password(password),
        role=role,
    )

    result = users_collection.insert_one(document)
    return result.inserted_id


# =========================================================
# CREATE SIGNUP OTP
# =========================================================

def create_signup_otp(user_id):
    otp = generate_otp()

    expires_at = datetime.utcnow() + timedelta(
        minutes=settings.OTP_EXPIRE_MINUTES
    )

    document = otp_document(
        user_id=user_id,
        otp_hash=hash_otp(otp),
        purpose="signup",
        expires_at=expires_at,
    )

    otp_collection.insert_one(document)
    return otp


# =========================================================
# CREATE PASSWORD RESET OTP
# =========================================================

def create_reset_otp(user_id):
    otp = generate_otp()

    expires_at = datetime.utcnow() + timedelta(
        minutes=settings.OTP_EXPIRE_MINUTES
    )

    document = otp_document(
        user_id=user_id,
        otp_hash=hash_otp(otp),
        purpose="reset_password",
        expires_at=expires_at,
    )

    otp_collection.insert_one(document)
    return otp