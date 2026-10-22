
from datetime import datetime, timezone

from app.database import (
    attendance_collection,
    notifications_collection,
    professors_collection,
    settings_collection,
    students_collection,
    users_collection,
)

DEFAULT_PREFERENCES = {
    "attendanceReminder": True,
    "lowAttendanceAlert": True,
    "loginAlerts": True,
    "emailNotifications": True,
}


def get_user_settings(user_id: str) -> dict:
    return settings_collection.find_one({"user_id": user_id}) or {}


def preference_enabled(user_id: str, key: str) -> bool:
    saved = get_user_settings(user_id)
    return saved.get(key, DEFAULT_PREFERENCES.get(key, True)) is True


def create_notification(
    user_id: str,
    title: str,
    message: str,
    category: str,
    preference_key: str,
    dedupe_key: str | None = None,
) -> bool:
    if not preference_enabled(user_id, preference_key):
        return False

    notification = {
        "user_id": user_id,
        "title": title,
        "message": message,
        "category": category,
        "preference_key": preference_key,
        "is_read": False,
        "created_at": datetime.now(timezone.utc),
    }

    if dedupe_key:
        notification["dedupe_key"] = dedupe_key
        result = notifications_collection.update_one(
            {"dedupe_key": dedupe_key},
            {"$setOnInsert": notification},
            upsert=True,
        )
        return result.upserted_id is not None

    notifications_collection.insert_one(notification)
    return True



def find_student_user(registration_number: str):
    reg = registration_number.strip().upper()

    student = students_collection.find_one({
        "registration_number": reg
    })

    if not student:
        return None

    email = str(student.get("email") or "").strip().lower()

    # Match the student's email case-insensitively.
    if email:
        user = users_collection.find_one({
            "email": {
                "$regex": f"^{__import__('re').escape(email)}$",
                "$options": "i",
            },
            "role": "student",
        })
        if user:
            return user

    # Fallback for accounts linked by registration number.
    return users_collection.find_one({
        "registration_number": reg,
        "role": "student",
    })


    # Also support accounts that store registration_number.
    return users_collection.find_one({
        "registration_number": reg,
        "role": "student",
    })


def find_professor_user(professor_id: str | None):
    if not professor_id:
        return None

    # Support professor_id stored directly on the login account.
    user = users_collection.find_one({
        "professor_id": professor_id,
        "role": "professor",
    })
    if user:
        return user

    # Otherwise connect the professor record to its login by email.
    professor = professors_collection.find_one({
        "professor_id": professor_id,
    })
    if not professor:
        return None

    email = str(professor.get("email") or "").strip().lower()
    if not email:
        return None

    return users_collection.find_one({
        "email": email,
        "role": "professor",
    })


def notify_attendance_recorded(
    registration_number: str,
    lecture_code: str,
    present: bool,
    attendance_id: str,
    event_type: str = "recorded",
):
    reg = registration_number.strip().upper()
    status_text = "Present" if present else "Absent"
    now = datetime.now(timezone.utc)

    student = students_collection.find_one({
        "registration_number": reg,
    })
    if not student:
        return

    # Recipient list: student, every admin, and the lecture professor.
    recipients = []

    student_user = find_student_user(reg)
    if student_user:
        recipients.append((
            student_user,
            "Your attendance was updated"
            if event_type == "updated"
            else "Attendance recorded",
            f"Your attendance for lecture {lecture_code} "
            f"has been recorded as {status_text}.",
        ))

    admins = users_collection.find({
        "role": {"$regex": "^admin$", "$options": "i"},
    })
    for admin in admins:
        recipients.append((
            admin,
            "Attendance record updated"
            if event_type == "updated"
            else "Attendance recorded",
            f"Attendance for {student.get('full_name', reg)} "
            f"({reg}) in lecture {lecture_code} is {status_text}.",
        ))

    lecture = None
    # The attendance record contains the professor_id.
    attendance = attendance_collection.find_one({
        "_id": __import__("bson").ObjectId(attendance_id)
    }) if len(attendance_id) == 24 else None

    if attendance:
        professor_id = attendance.get("professor_id")
    else:
        professor_id = None

    if professor_id:
        professor_user = find_professor_user(str(professor_id))
        if professor_user:
            recipients.append((
                professor_user,
                "Attendance record updated"
                if event_type == "updated"
                else "Attendance recorded for your lecture",
                f"Attendance for {student.get('full_name', reg)} "
                f"({reg}) in lecture {lecture_code} is {status_text}.",
            ))

    # Use a recipient-specific dedupe key so one user's notification
    # cannot prevent another user from receiving theirs.
    for user, title, message in recipients:
        user_id = str(user["_id"])
        create_notification(
            user_id=user_id,
            title=title,
            message=message,
            category="attendance",
            preference_key="attendanceReminder",
            dedupe_key=(
                f"attendance:{attendance_id}:{event_type}:{user_id}"
            ),
        )

    # Calculate and send low-attendance alerts.
    total = attendance_collection.count_documents({
        "registration_number": reg,
    })
    if not total:
        return

    attended = attendance_collection.count_documents({
        "registration_number": reg,
        "present": True,
    })
    percentage = attended / total * 100

    student_user = find_student_user(reg)
    student_user_id = str(student_user["_id"]) if student_user else None
    minimum = 75

    if student_user_id:
        saved = get_user_settings(student_user_id)
        try:
            minimum = float(saved.get("minimumAttendance", 75))
        except (TypeError, ValueError):
            minimum = 75

    if percentage >= minimum:
        return

    alert_recipients = []
    if student_user:
        alert_recipients.append(student_user)

    alert_recipients.extend(users_collection.find({
        "role": {"$regex": "^admin$", "$options": "i"},
    }))

    if professor_id:
        professor_user = find_professor_user(str(professor_id))
        if professor_user:
            alert_recipients.append(professor_user)

    for user in alert_recipients:
        user_id = str(user["_id"])
        create_notification(
            user_id=user_id,
            title="Low attendance alert",
            message=(
                f"Attendance for {student.get('full_name', reg)} "
                f"({reg}) is {percentage:.1f}%. "
                f"Minimum required attendance is {minimum:.1f}%."
            ),
            category="low_attendance",
            preference_key="lowAttendanceAlert",
            dedupe_key=(
                f"low-attendance:{reg}:{now.date().isoformat()}:{user_id}"
            ),
        )
