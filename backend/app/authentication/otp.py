import hashlib
import hmac
import secrets

from app.config import settings


def generate_otp() -> str:
    return str(
        secrets.randbelow(900000) + 100000
    )


def hash_otp(otp: str) -> str:
    return hmac.new(
        settings.OTP_SECRET.encode(),
        otp.encode(),
        hashlib.sha256,
    ).hexdigest()


def verify_otp_hash(
    entered_otp: str,
    stored_hash: str,
) -> bool:
    entered_hash = hash_otp(
        entered_otp
    )

    return hmac.compare_digest(
        entered_hash,
        stored_hash,
    )