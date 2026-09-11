import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, decode_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import UserCreate


async def register(db: AsyncSession, data: UserCreate) -> User:
    existing = await db.scalar(select(User).where(User.email == data.email))
    if existing:
        raise ValueError("Email already registered")
    user = User(
        email=str(data.email),
        full_name=data.full_name,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def login(db: AsyncSession, email: str, password: str) -> User:
    user = await db.scalar(select(User).where(User.email == str(email)))
    if user is None or not verify_password(password, user.password_hash):
        raise ValueError("Invalid credentials")
    if not user.is_active:
        raise ValueError("Account disabled")
    return user


def issue_token(user: User) -> str:
    return create_access_token(subject=str(user.id))


def refresh_payload(token: str) -> dict:
    return decode_access_token(token)