# PayGuard — Agentic Payment Scam Interception

## Structure

```
src/paygraud/
  backend/     FastAPI + SQLAlchemy 2.0 + PostgreSQL + Redis
  frontend/    (coming soon)
  mobile/      (coming soon)
```

## Run (backend)

```bash
cd src/paygraud/backend
uv sync --group dev          # install deps
uv run uvicorn app.main:app --reload
# docs at /docs   |   health at /health
```

## Test

```bash
cd src/paygraud/backend
uv run pytest -q
```

## Demo account

| email | password |
|---|---|
| demo@payguard.io | Payguard@123 |

(Seeded via `uv run python -m scripts.seed_demo_scenarios` after `alembic upgrade head`.)
