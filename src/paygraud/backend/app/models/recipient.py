import uuid

from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class Recipient(Base, TimestampMixin):
    __tablename__ = "recipients"
    __table_args__ = (UniqueConstraint("user_id", "account_number", name="uq_recipient_user_account"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    account_number: Mapped[str] = mapped_column(String(50), nullable=False)
    bank_name: Mapped[str | None] = mapped_column(String(100))
    ifsc_code: Mapped[str | None] = mapped_column(String(20))
    phone: Mapped[str | None] = mapped_column(String(20))
    email: Mapped[str | None] = mapped_column(String(255))
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    verification_level: Mapped[str] = mapped_column(String(20), default="unverified")
    risk_score: Mapped[float] = mapped_column(Float, default=50.0)
    risk_category: Mapped[str] = mapped_column(String(20), default="unknown")
    previous_transaction_count: Mapped[int] = mapped_column(Integer, default=0)
    repeat_verification_count: Mapped[int] = mapped_column(Integer, default=0)