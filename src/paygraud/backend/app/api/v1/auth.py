from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from app.api.deps import get_current_user
from app.config import get_settings
from app.core.exceptions import business_error
from app.core.redis import is_rate_limited
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import RefreshRequest, Token, UserCreate, UserOut
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(data: UserCreate, db: Annotated[AsyncSession, Depends(get_db)]) -> User:
    try:
        return await auth_service.register(db, data)
    except ValueError as exc:
        raise business_error("EMAIL_TAKEN", str(exc), status.HTTP_409_CONFLICT) from exc


@router.post("/login", response_model=Token)
async def login(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    settings = get_settings()
    if await is_rate_limited(f"login:{form.username.lower()}", settings.login_rate_limit):
        raise business_error("TOO_MANY_ATTEMPTS", "Too many login attempts, try again later", status.HTTP_429_TOO_MANY_REQUESTS)
    try:
        user = await auth_service.login(db, form.username, form.password)
    except ValueError as exc:
        raise business_error("INVALID_CREDENTIALS", str(exc), status.HTTP_401_UNAUTHORIZED) from exc
    return {"access_token": auth_service.issue_token(user)}


@router.post("/refresh", response_model=Token)
async def refresh_token(data: RefreshRequest) -> dict:
    try:
        access_token = auth_service.refresh_token(data.refresh_token)
    except ValueError as exc:
        raise business_error("INVALID_TOKEN", str(exc), status.HTTP_401_UNAUTHORIZED) from exc
    return {"access_token": access_token}


@router.get("/me", response_model=UserOut)
async def me(user: Annotated[User, Depends(get_current_user)]) -> User:
    return user