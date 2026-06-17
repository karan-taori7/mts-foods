import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from app.database import SessionLocal
from app.services.auth_service import create_user, get_user_by_email


def main():
    email = input("Admin email: ").strip()
    password = input("Admin password: ").strip()

    if len(password) < 6:
        print("Password must be at least 6 characters.")
        sys.exit(1)

    db = SessionLocal()
    try:
        if get_user_by_email(db, email):
            print(f"A user with {email} already exists.")
            return
        user = create_user(db, email, password, role="admin")
        print(f"Admin created — email: {user.email}, id: {user.id}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
