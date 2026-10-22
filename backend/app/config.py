import os

from dotenv import load_dotenv

load_dotenv()


class Settings:

    MONGODB_URL = os.getenv(
        "MONGODB_URL",
        "mongodb://localhost:27017"
    )

    MONGODB_DATABASE = os.getenv(
        "MONGODB_DATABASE",
        "attendance_management"
    )

    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "change-this-secret-key"
    )

    ALGORITHM = os.getenv(
        "ALGORITHM",
        "HS256"
    )

    ACCESS_TOKEN_EXPIRE_MINUTES = int(
        os.getenv(
            "ACCESS_TOKEN_EXPIRE_MINUTES",
            "60"
        )
    )

    OTP_SECRET = os.getenv(
        "OTP_SECRET",
        "attendance-project-otp-secret"
    )

    OTP_EXPIRE_MINUTES = int(
        os.getenv(
            "OTP_EXPIRE_MINUTES",
            "5"
        )
    )

    FRONTEND_URL = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173"
    )

    # ADMIN ACCOUNT
    ADMIN_NAME = os.getenv(
        "ADMIN_NAME",
        "System Admin"
    )

    ADMIN_PHONE = os.getenv(
        "ADMIN_PHONE",
        "9876543210"
    )

    ADMIN_EMAIL = os.getenv(
        "ADMIN_EMAIL",
        "admin@example.com"
    )

    ADMIN_PASSWORD = os.getenv(
        "ADMIN_PASSWORD",
        "Admin@12345"
    )


settings = Settings()