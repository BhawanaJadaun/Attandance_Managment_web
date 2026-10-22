import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pymongo.errors import DuplicateKeyError

from app.authentication.email import send_otp_email
from app.authentication.schemas import (
    SignupRequest,
    VerifyOtpRequest,
    ResendOtpRequest,
    StudentLoginRequest,
    ProfessorLoginRequest,
    AdminLoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from app.authentication.security import (
    verify_password,
    hash_password,
    create_access_token,
)
from app.authentication.otp import verify_otp_hash
from app.authentication.service import (
    create_user,
    create_signup_otp,
    create_reset_otp,
)
from app.database import users_collection, otp_collection ,  professors_collection


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


# =========================================================
# DATETIME HELPERS
# =========================================================

def utc_now() -> datetime:
    """Return the current timezone-aware UTC datetime."""
    return datetime.now(timezone.utc)


def as_utc(value: datetime) -> datetime:
    """Interpret naive MongoDB datetimes as UTC."""
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


# =========================================================
# EMAIL OTP DELIVERY
# =========================================================

def deliver_otp_or_raise(
    email: str,
    otp: str,
    purpose: str = "signup",
) -> None:
    try:
        sent = send_otp_email(email, otp, purpose)
    except Exception as exc:
        print(f"OTP email error: {type(exc).__name__}")
        sent = False

    if not sent:
        raise HTTPException(
            status_code=502,
            detail=(
                "Unable to send OTP email. "
                "Check email configuration and try again."
            ),
        )


# =========================================================
# COMMON HELPERS
# =========================================================

def normalize_email(email: str) -> str:
    return email.strip().lower()


def find_user_by_email(email: str):
    return users_collection.find_one(
        {"email": normalize_email(email)}
    )


def get_pending_otp(user_id, purpose: str):
    return otp_collection.find_one(
        {
            "user_id": user_id,
            "purpose": purpose,
            "verified": False,
        },
        sort=[("created_at", -1)],
    )


def check_otp_record(otp_record: dict) -> None:
    """Validate OTP expiry and attempt limits."""

    expires_at = otp_record.get("expires_at")

    if not isinstance(expires_at, datetime):
        raise HTTPException(
            status_code=400,
            detail=(
                "OTP expiry information is missing or invalid. "
                "Please request a new OTP."
            ),
        )

    if as_utc(expires_at) <= utc_now():
        raise HTTPException(
            status_code=400,
            detail="OTP expired. Please request a new OTP.",
        )

    if otp_record.get("attempt_count", 0) >= 5:
        raise HTTPException(
            status_code=400,
            detail=(
                "Maximum OTP attempts exceeded. "
                "Please request a new OTP."
            ),
        )


def invalidate_otp(otp_record: dict) -> None:
    """Mark an OTP as used so it cannot be reused."""

    otp_collection.update_one(
        {"_id": otp_record["_id"]},
        {
            "$set": {
                "verified": True,
                "consumed_at": utc_now(),
            }
        },
    )


def verify_submitted_otp(
    otp_record: dict,
    submitted_otp: str,
) -> None:
    """Check an OTP and count unsuccessful attempts."""

    check_otp_record(otp_record)

    otp_hash = otp_record.get("otp_hash", "")

    if not otp_hash or not verify_otp_hash(
        submitted_otp,
        otp_hash,
    ):
        otp_collection.update_one(
            {
                "_id": otp_record["_id"],
                "verified": False,
            },
            {"$inc": {"attempt_count": 1}},
        )

        raise HTTPException(
            status_code=400,
            detail="Invalid OTP.",
        )


# =========================================================
# STUDENT SIGNUP
# Public signup always creates a student account.
# =========================================================

@router.post("/signup")
def signup(data: SignupRequest):
    email = normalize_email(str(data.email))

    if find_user_by_email(email):
        raise HTTPException(
            status_code=409,
            detail="Email already registered.",
        )

    try:
        user_id = create_user(
            full_name=data.full_name.strip(),
            email=email,
            role="student",
            password=data.password,
            phone=None,
        )
    except DuplicateKeyError:
        raise HTTPException(
            status_code=409,
            detail="Email already registered.",
        )

    otp = create_signup_otp(user_id)

    try:
        deliver_otp_or_raise(email, otp, "signup")
    except HTTPException:
        record = get_pending_otp(user_id, "signup")
        if record:
            invalidate_otp(record)
        raise

    return {
        "message": "Signup successful. OTP sent to your email.",
        "email": email,
        "user_id": str(user_id),
    }


# =========================================================
# VERIFY SIGNUP EMAIL OTP
# =========================================================

@router.post("/verify-otp")
def verify_signup_otp(data: VerifyOtpRequest):
    email = normalize_email(str(data.email))
    user = find_user_by_email(email)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    if user.get("role") != "student":
        raise HTTPException(
            status_code=400,
            detail=(
                "This endpoint is for student signup verification."
            ),
        )

    if user.get("is_verified", False):
        return {
            "message": "Email already verified. Please log in."
        }

    otp_record = get_pending_otp(user["_id"], "signup")

    if not otp_record:
        raise HTTPException(
            status_code=400,
            detail="OTP not found. Please request a new OTP.",
        )

    verify_submitted_otp(otp_record, data.otp)

    users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "is_verified": True,
                "updated_at": utc_now(),
            }
        },
    )

    invalidate_otp(otp_record)

    return {
        "message": "Email verified successfully. Please log in."
    }


# =========================================================
# RESEND SIGNUP OTP
# =========================================================

@router.post("/resend-otp")
def resend_signup_otp(data: ResendOtpRequest):
    email = normalize_email(str(data.email))
    user = find_user_by_email(email)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    if user.get("role") != "student":
        raise HTTPException(
            status_code=400,
            detail=(
                "This endpoint is for student signup verification."
            ),
        )

    if user.get("is_verified", False):
        raise HTTPException(
            status_code=400,
            detail="Account already verified. Please log in.",
        )

    latest = get_pending_otp(user["_id"], "signup")

    if latest:
        created_at = latest.get("created_at")

        if isinstance(created_at, datetime):
            elapsed = (
                utc_now() - as_utc(created_at)
            ).total_seconds()

            if elapsed < 60:
                wait_seconds = max(1, int(60 - elapsed))

                raise HTTPException(
                    status_code=429,
                    detail=(
                        f"Please wait {wait_seconds} seconds "
                        "before requesting another OTP."
                    ),
                )

        invalidate_otp(latest)

    otp = create_signup_otp(user["_id"])
    new_record = get_pending_otp(user["_id"], "signup")

    if not new_record:
        raise HTTPException(
            status_code=500,
            detail="Unable to create OTP.",
        )

    try:
        deliver_otp_or_raise(email, otp, "signup")
    except HTTPException:
        invalidate_otp(new_record)
        raise

    return {
        "message": "A new OTP has been sent to your email."
    }


# =========================================================
# STUDENT LOGIN
# =========================================================



@router.post("/student-login")
def student_login(data: StudentLoginRequest):
    email = normalize_email(str(data.email))

    user = users_collection.find_one({
        "email": email,
        "role": "student",
    })

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    if not verify_password(
        data.password,
        user.get("password_hash", "")
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    if not user.get("is_verified", False):
        raise HTTPException(
            status_code=403,
            detail="Please verify your email first."
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=403,
            detail="Account is inactive."
        )

    token = create_access_token({
        "sub": str(user["_id"]),
        "role": "student",
    })

    return {
        "message": "Student login successful.",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "full_name": user.get("full_name", ""),
            "email": user.get("email", ""),
            "phone": user.get("phone"),
            "role": "student",
        },
    }



# =========================================================
# PROFESSOR LOGIN
# =========================================================

@router.post("/professor-login")
def professor_login(data: ProfessorLoginRequest):
    email = normalize_email(str(data.email))
    full_name = data.full_name.strip()

    # Find the professor added by the admin
    professor = professors_collection.find_one({
        "email": email,
        "full_name": full_name,
    })

    if not professor:
        raise HTTPException(
            status_code=401,
            detail="Professor name or email is incorrect.",
        )

    # Find an existing professor login account
    user = users_collection.find_one({
        "email": email,
        "role": "professor",
    })

    if user:
        saved_name = user.get("full_name", "").strip()

        if saved_name.casefold() != full_name.casefold():
            raise HTTPException(
                status_code=401,
                detail="Professor name or email is incorrect.",
            )

    # Create a linked login account if it doesn't exist
    if not user:
        now = utc_now()

        user_data = {
            "full_name": professor.get("full_name", full_name),
            "email": email,
            "role": "professor",
            "password_hash": hash_password(
                secrets.token_urlsafe(32)
            ),
            "is_verified": True,
            "is_active": True,
            "phone": professor.get("phone"),
            "professor_id": professor.get("professor_id"),
            "created_at": now,
            "updated_at": now,
        }

        try:
            result = users_collection.insert_one(user_data)
            user = users_collection.find_one({
                "_id": result.inserted_id
            })

        except DuplicateKeyError:
            # Handle a concurrent creation or duplicate email
            user = users_collection.find_one({
                "email": email,
                "role": "professor",
            })

    if not user:
        raise HTTPException(
            status_code=409,
            detail=(
                "Unable to create professor account. "
                "Check whether this email belongs to another account."
            ),
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=403,
            detail="Account is inactive.",
        )

    # Create the access token
    token = create_access_token({
        "sub": str(user["_id"]),
        "role": "professor",
    })

    return {
        "message": "Professor login successful.",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "full_name": user.get(
                "full_name",
                professor.get("full_name", ""),
            ),
            "phone": user.get(
                "phone",
                professor.get("phone"),
            ),
            "email": email,
            "role": "professor",
        },
    }


# =========================================================
# ADMIN LOGIN
# =========================================================


@router.post("/admin-login")
def admin_login(data: AdminLoginRequest):
    email = normalize_email(str(data.email))

    user = users_collection.find_one({
        "email": email,
        "role": "admin",
    })

    if not user:
        print("ADMIN DEBUG: Account not found for this email and role.")
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    password_matches = verify_password(
        data.password,
        user.get("password_hash", ""),
    )

    print("ADMIN DEBUG: Password matches:", password_matches)

    if not password_matches:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    if not user.get("is_verified", False):
        raise HTTPException(
            status_code=403,
            detail="Please verify your account first.",
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=403,
            detail="Account is inactive.",
        )

    token = create_access_token({
        "sub": str(user["_id"]),
        "role": "admin",
    })

    return {
        "message": "Admin login successful.",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "full_name": user.get("full_name", ""),
            "phone": user.get("phone"),
            "email": user.get("email", ""),
            "role": "admin",
        },
    }

# =========================================================
# FORGOT PASSWORD
# =========================================================

@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest):
    email = normalize_email(str(data.email))
    user = find_user_by_email(email)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="No account found with this email.",
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=403,
            detail="Account is inactive.",
        )

    otp = create_reset_otp(user["_id"])

    try:
        deliver_otp_or_raise(email, otp, "reset_password")
    except HTTPException:
        record = get_pending_otp(
            user["_id"],
            "reset_password",
        )
        if record:
            invalidate_otp(record)
        raise

    return {
        "message": "Password reset OTP sent to your email."
    }


# =========================================================
# RESET PASSWORD
# =========================================================


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest):
    email = normalize_email(str(data.email))
    user = find_user_by_email(email)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=403,
            detail="Account is inactive.",
        )

    otp_record = get_pending_otp(
        user["_id"],
        "reset_password",
    )

    if not otp_record:
        raise HTTPException(
            status_code=400,
            detail="Reset OTP not found. Request a new OTP.",
        )

    verify_submitted_otp(otp_record, data.otp)

    result = users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "password_hash": hash_password(data.new_password),
                "updated_at": utc_now(),
            }
        },
    )

    saved_user = users_collection.find_one(
        {"_id": user["_id"]}
    )

    password_saved_correctly = (
        saved_user is not None
        and verify_password(
            data.new_password,
            saved_user.get("password_hash", ""),
        )
    )

    print(
        "RESET DEBUG: Modified records:",
        result.modified_count,
    )
    print(
        "RESET DEBUG: New password verifies after saving:",
        password_saved_correctly,
    )

    invalidate_otp(otp_record)

    return {
        "message": "Password reset successfully. Please log in."
    }