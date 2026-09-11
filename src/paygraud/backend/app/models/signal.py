import uuid

from sqlalchemy import Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class InboundSignal(Base, TimestampMixin):
    """A real-world message (SMS/notification) captured on a device and scored for scams."""

    __tablename__ = "inbound_signals"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=True
    )
    channel: Mapped[str] = mapped_column(String(20), default="sms")
    sender: Mapped[str] = mapped_column(String(100), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    extracted_link: Mapped[str | None] = mapped_column(String(500))
    link_domain: Mapped[str | None] = mapped_column(String(200))
    payee_name: Mapped[str | None] = mapped_column(String(150))
    amount: Mapped[float | None] = mapped_column(Float)
    flags: Mapped[list | None] = mapped_column(JSONB)
    risk_score: Mapped[float | None] = mapped_column(Float)
    risk_level: Mapped[str | None] = mapped_column(String(20))
    action: Mapped[str | None] = mapped_column(String(20))
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)