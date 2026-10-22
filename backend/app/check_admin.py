from app.database import users_collection


admins = list(
    users_collection.find(
        {"role": "admin"},
        {
            "_id": 1,
            "full_name": 1,
            "email": 1,
            "phone": 1,
            "role": 1,
            "is_verified": 1,
            "is_active": 1,
            "password_hash": 1,
        },
    )
)

print("\n========== ADMIN USERS ==========")

if not admins:
    print("NO ADMIN FOUND")
else:
    for admin in admins:
        print("ID:", admin.get("_id"))
        print("Name:", admin.get("full_name"))
        print("Email:", admin.get("email"))
        print("Phone:", admin.get("phone"))
        print("Role:", admin.get("role"))
        print("Verified:", admin.get("is_verified"))
        print("Active:", admin.get("is_active"))
        print(
            "Password hash exists:",
            bool(admin.get("password_hash"))
        )
        print("--------------------------------")

print("=================================\n")