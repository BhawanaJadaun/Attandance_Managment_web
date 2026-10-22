
from datetime import datetime, timezone
from getpass import getpass

from pymongo.collation import Collation

from app.database import users_collection
from app.authentication.security import hash_password


def main():
    email = input("Enter admin email: ").strip().lower()

    if not email:
        print("Email is required.")
        return

    existing_user = users_collection.find_one(
        {"email": email},
        collation=Collation(locale="en", strength=2),
    )

    if not existing_user:
        print("No admin account found for this email.")
        return

    if existing_user.get("role") != "admin":
        print("This email does not belong to an admin account.")
        return

    password = getpass("Enter new admin password: ")
    confirm_password = getpass("Confirm new admin password: ")

    if not password:
        print("Password cannot be empty.")
        return

    if len(password) < 8:
        print("Password must contain at least 8 characters.")
        return

    if password != confirm_password:
        print("Passwords do not match.")
        return

    users_collection.update_one(
        {"_id": existing_user["_id"]},
        {
            "$set": {
                "password_hash": hash_password(password),
                "is_verified": True,
                "is_active": True,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    print("Admin password updated successfully.")
    print("You can now log in with this email and new password.")


if __name__ == "__main__":
    main()