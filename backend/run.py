import uvicorn

from app.database import create_default_admin


if __name__ == "__main__":
    create_default_admin()

    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )