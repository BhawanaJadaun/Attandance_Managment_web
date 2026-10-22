
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.authentication.routes import router as auth_router
from app.config import settings
from app.database import check_database_connection

from app.dashboard.routes import router as dashboard_router
from app.students.routes import router as students_router
from app.professors.routes import router as professors_router
from app.subjects.routes import router as subjects_router
from app.lectures.routes import router as lectures_router
from app.attendance.routes import router as attendance_router
from app.reports.routes import router as reports_router
from app.profile.routes import router as profile_router
from app.settings.routes import router as settings_router
from app.notifications.routes import router as notifications_router

app = FastAPI(
    title="Attendance Management System API",
    description="Attendance APIs with FastAPI and MongoDB",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Keep your existing OTP authentication routes.
app.include_router(auth_router)

app.include_router(dashboard_router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(students_router, prefix="/api/students", tags=["Students"])
app.include_router(professors_router, prefix="/api/professors", tags=["Professors"])
app.include_router(subjects_router, prefix="/api/subjects", tags=["Subjects"])
app.include_router(lectures_router, prefix="/api/lectures", tags=["Lectures"])
app.include_router(attendance_router, prefix="/api/attendance", tags=["Attendance"])
app.include_router(reports_router, prefix="/api/reports", tags=["Reports"])
app.include_router(profile_router, prefix="/api/profile", tags=["Profile"])
app.include_router(settings_router, prefix="/api/settings", tags=["Settings"])
app.include_router(notifications_router, prefix="/api/notifications", tags=["Notifications"])


@app.get("/")
def root():
    return {"message": "Attendance Management API is running"}


@app.get("/health")
def health_check():
    connected = check_database_connection()
    return {
        "status": "healthy" if connected else "degraded",
        "database": "connected" if connected else "disconnected",
    }


@app.exception_handler(Exception)
async def unexpected_exception_handler(request: Request, exc: Exception):
    # Log details on the server; do not expose internal errors to API clients.
    print(f"Unhandled API error at {request.url.path}: {type(exc).__name__}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred."},
    )