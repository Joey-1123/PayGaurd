import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog


async def log(
    db: AsyncSession,
    action: str,
    user_id: uuid.UUID | None = None,
    payment_id: uuid.UUID | None = None,
    entity_type: str | None = None,
    entity_id: uuid.UUID | None = None,
    changes: dict | None = None,
    actor: str | None = None,
    source: str | None = None,
    details: str | None = None,
) -> None:
    db.add(
        AuditLog(
            user_id=user_id,
            payment_id=payment_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            changes=changes,
            actor=actor,
            source=source,
            details=details,
            created_at=datetime.now(timezone.utc),
        )
    )