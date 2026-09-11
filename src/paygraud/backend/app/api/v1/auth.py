from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from app.api.deps import get_current_user
from app.core.exceptions import business_error
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import Token, UserCreate, UserOut
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
    try:
        user = await auth_service.login(db, form.username, form.password)
    except ValueError as exc:
        raise business_error("INVALID_CREDENTIALS", str(exc), status.HTTP_401_UNAUTHORIZED) from exc
    return {"access_token": auth_service.issue_token(user)}


@router.get("/me", response_model=UserOut)
async def me(user: Annotated[User, Depends(get_current_user)]) -> User:
    return user