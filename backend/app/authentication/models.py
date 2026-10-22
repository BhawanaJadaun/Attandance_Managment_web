
from datetime import datetime


# =========================================================
# USER DOCUMENT
# =========================================================

def user_document(
    full_name: str,
    email: str,
    password_hash: str,
    role: str,
    phone: str | None = None,
) -> dict:
    return {
        "full_name": full_name.strip(),
        "phone": phone,
        "email": email.strip().lower(),
        "password_hash": password_hash,
        "role": role,

        # Account status
        "is_verified": False,
        "is_active": True,

        # Timestamps
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }


# =========================================================
# OTP DOCUMENT
# =========================================================

def otp_document(
    user_id,
    otp_hash: str,
    purpose: str,
    expires_at: datetime,
) -> dict:
    return {
        "user_id": user_id,
        "otp_hash": otp_hash,
        "purpose": purpose,
        "expires_at": expires_at,

        # Security
        "attempt_count": 0,
        "verified": False,

        # Timestamp
        "created_at": datetime.utcnow(),
    }