from datetime import datetime, timezone

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse


class AppError(HTTPException):
    """Standard API error. Renders as {"error": {...}}."""

    def __init__(self, code: str, message: str, http_status: int, details: dict | None = None):
        self.code = code
        self.details = details
        payload = _error_payload(code, http_status, message, details)
        super().__init__(status_code=http_status, detail=payload)


def business_error(
    code: str, message: str, http_status: int = 400, details: dict | None = None
) -> AppError:
    return AppError(code=code, message=message, http_status=http_status, details=details)


def _error_payload(code: str, status: int, message: str, details: dict | None = None) -> dict:
    return {
        "error": {
            "code": code,
            "message": message,
            "details": details or {},
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    }


def register_error_handlers(app) -> None:
    @app.exception_handler(AppError)
    async def handle_app_error(_: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(status_code=exc.status_code, content=exc.detail)

    @app.exception_handler(HTTPException)
    async def handle_http_error(_: Request, exc: HTTPException) -> JSONResponse:
        detail = exc.detail if isinstance(exc.detail, str) else "Request failed"
        payload = _error_payload("HTTP_ERROR", exc.status_code, detail)
        return JSONResponse(status_code=exc.status_code, content=payload)