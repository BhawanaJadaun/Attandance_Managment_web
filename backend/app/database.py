import os
from datetime import datetime, timezone
from pymongo import MongoClient, ASCENDING
from pymongo.errors import PyMongoError, DuplicateKeyError
from app.config import settings


# ==========================================
# MONGODB CONNECTION
# ==========================================

client = MongoClient(
    settings.MONGODB_URL,
    serverSelectionTimeoutMS=30000,
    connectTimeoutMS=15000,
    socketTimeoutMS=20000,
    retryWrites=True,
)

db = client[settings.MONGODB_DATABASE]


# ==========================================
# DATABASE COLLECTIONS
# ==========================================

users_collection = db["users"]
students_collection = db["students"]
professors_collection = db["professors"]
subjects_collection = db["subjects"]
lectures_collection = db["lectures"]
attendance_collection = db["attendance"]
settings_collection = db["user_settings"]
otp_verifications_collection = db["otp_verifications"]

# Backward-compatible alias for authentication/service.py
otp_collection = otp_verifications_collection
# NOTIFICATION
notifications_collection = db["notifications"]


# ==========================================
# DATABASE INDEXES
# ==========================================

def create_database_indexes():
    """Create indexes required by the attendance system."""

    # Students: registration number must be unique.
    students_collection.create_index(
        [("registration_number", ASCENDING)],
        unique=True,
        name="unique_student_registration",
    )

    # Professors: professor ID must be unique when provided.
    professors_collection.create_index(
        [("professor_id", ASCENDING)],
        unique=True,
        sparse=True,
        name="unique_professor_id",
    )

    # Subjects: subject code must be unique.
    subjects_collection.create_index(
        [("subject_code", ASCENDING)],
        unique=True,
        name="unique_subject_code",
    )

    # Lectures: lecture code must be unique.
    lectures_collection.create_index(
        [("lecture_code", ASCENDING)],
        unique=True,
        name="unique_lecture_code",
    )

    # Attendance: one record per student per lecture.
    attendance_collection.create_index(
        [
            ("lecture_code", ASCENDING),
            ("registration_number", ASCENDING),
        ],
        unique=True,
        name="unique_lecture_student_attendance",
    )

    # Users: email must be unique when provided.
    users_collection.create_index(
    [("email", ASCENDING)],
    unique=True,
    name="unique_user_email",
    collation={"locale": "en", "strength": 2},
)
    # Notifications: retrieve each user's newest notifications efficiently.
notifications_collection.create_index(
    [("user_id", ASCENDING), ("created_at", -1)],
    name="notifications_user_created",
)

# Prevent duplicate notification events when a dedupe key is supplied.
notifications_collection.create_index(
    [("dedupe_key", ASCENDING)],
    unique=True,
    sparse=True,
    name="unique_notification_dedupe_key",
)

# ==========================================
# DATABASE CONNECTION CHECK
# ==========================================

def check_database_connection() -> bool:
    """
    Check whether MongoDB is reachable.

    Returns:
        True if connected, otherwise False.
    """
    try:
        client.admin.command("ping")
        return True
    except PyMongoError as exc:
        print(f"MongoDB connection check failed: {exc}")
        return False


# ==========================================
# DATABASE INITIALIZATION
# ==========================================


def create_default_admin():
    """
    Verify MongoDB, initialize indexes, and create the initial
    admin account only when it does not already exist.

    Credentials are supplied through environment variables.
    Existing accounts and passwords are never overwritten.
    """
    try:
        client.admin.command("ping")
        create_database_indexes()

        # Import locally to avoid unnecessary module import cycles.
        from app.authentication.security import hash_password

        email = os.getenv("INITIAL_ADMIN_EMAIL", "").strip().lower()
        password = os.getenv("INITIAL_ADMIN_PASSWORD", "")
        full_name = os.getenv("INITIAL_ADMIN_NAME", "System Administrator").strip()

        if not email or not password:
            print(
                "MongoDB connected successfully! "
                f"Database: {settings.MONGODB_DATABASE}"
            )
            print(
                "Initial admin not created: set "
                "INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD."
            )
            return

        existing_user = users_collection.find_one({"email": email})

        if existing_user:
            if existing_user.get("role") != "admin":
                print(
                    "Admin initialization skipped: an account with "
                    "this email already exists with a different role."
                )
            else:
                print("Admin account already exists. No changes made.")
            return

        now = datetime.now(timezone.utc)

        admin_user = {
            "full_name": full_name,
            "email": email,
            "role": "admin",
            "password_hash": hash_password(password),
            "is_verified": True,
            "is_active": True,
            "phone": None,
            "created_at": now,
            "updated_at": now,
        }

        users_collection.insert_one(admin_user)

        print("Initial admin account created successfully.")
        print(f"Admin email: {email}")
        print("Admin password: not displayed.")

    except DuplicateKeyError:
        print(
            "Admin account already exists or a duplicate email "
            "was detected. Check the users collection."
        )
    except PyMongoError as exc:
        print(f"MongoDB initialization error: {exc}")
        raise RuntimeError(
            "MongoDB initialization failed. Check your database settings."
        ) from exc

# ==========================================
# CONNECTION CLEANUP
# ==========================================

def close_database_connection():
    """Close the MongoDB client when the application stops."""
    client.close()