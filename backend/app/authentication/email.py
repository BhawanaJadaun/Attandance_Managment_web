
import os
import smtplib
from email.message import EmailMessage

from dotenv import load_dotenv

load_dotenv()


def send_otp_email(email: str, otp: str, purpose: str = "signup") -> bool:
    """Send an OTP using Gmail SMTP."""

    sender_email = os.getenv("GMAIL_ADDRESS")
    app_password = os.getenv("GMAIL_APP_PASSWORD")

    if not sender_email or not app_password:
        raise RuntimeError("Gmail SMTP credentials are missing.")

    subject = (
        "Verify your account"
        if purpose == "signup"
        else "Password reset OTP"
    )

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = sender_email
    message["To"] = email

    message.set_content(
        f"""Hello,

Your OTP is: {otp}

This code is valid for 5 minutes.
Do not share this code with anyone.

If you did not request this code, please ignore this email.

Regards,
Attendance Management System
"""
    )

    try:
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=20) as server:
            server.starttls()
            server.login(sender_email, app_password)
            server.send_message(message)

        return True

    except (smtplib.SMTPException, OSError) as exc:
        print(f"Email delivery failed: {type(exc).__name__}")
        return False