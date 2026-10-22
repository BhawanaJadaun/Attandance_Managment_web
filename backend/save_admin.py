
from datetime import datetime, timezone

from pymongo.collation import Collation

from app.database import users_collection
from app.authentication.security import hash_password


def main():
    print("=== Create Admin Account ===")
    print("Database:", users_collection.database.name)
    print("Collection:", users_collection.name)

    try:
        users_collection.database.command("ping")
        print("MongoDB connection successful.")
    except Exception as error:
        print("MongoDB connection failed:", error)
        return

    email = input("Enter admin email: ").strip().lower()
    full_name = input("Enter admin name: ").strip()
    password = input("Enter admin password: ")
    confirm_password = input("Confirm admin password: ")

    if not email or not full_name or not password:
        print("Email, name, and password are required.")
        return

    if len(password) < 8:
        print("Password must be at least 8 characters.")
        return

    if password != confirm_password:
        print("Passwords do not match.")
        return

    existing_user = users_collection.find_one(
        {"email": email},
        collation=Collation(locale="en", strength=2),
    )

    if existing_user:
        print("An account already exists with this email.")
        print("Existing role:", existing_user.get("role", "unknown"))
        print("No changes made.")
        return

    now = datetime.now(timezone.utc)

    admin = {
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

    result = users_collection.insert_one(admin)

    saved_admin = users_collection.find_one({"_id": result.inserted_id})

    if saved_admin and saved_admin.get("role") == "admin":
        print("\nAdmin account saved and verified successfully!")
        print("Name:", saved_admin.get("full_name"))
        print("Email:", saved_admin.get("email"))
        print("Role:", saved_admin.get("role"))
        print("Database:", users_collection.database.name)
        print("Collection:", users_collection.name)
    else:
        print("Admin account verification failed.")


if __name__ == "__main__":
    main()