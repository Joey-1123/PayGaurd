# PayGuard Backend

Agentic guardian for real-time payment scam interception — FastAPI monolith.

## Stack

- FastAPI + SQLAlchemy 2.0 (async) + asyncpg on PostgreSQL 16
- Redis 7 (cache, login rate limiting, pub/sub bridge for alerts)
- Celery 5 (offline risk analysis + cross-process alert broadcast)
- Alembic migrations, pytest + httpx, Pydantic v2
- Multi-model AI: OpenAI + Anthropic + local Ollama, weighted aggregation with
  a fallback chain to the deterministic rule engine

## Layout (layered)

`app/api/v1` thin routers → `app/services` business logic (payment saga,
risk reporting, auth) → `app/models` SQLAlchemy + `app/agents`/`app/models_ai`.
External systems (payment gateway, AI models) sit behind interfaces
(`base_gateway.py`, `base.py`) so tests inject fakes with no DB/network.

Payment lifecycle is a saga: `pending → analyzing →
(awaiting_confirmation → confirmed →) completed`, with block/cancel/failed as
compensations. CRITICAL payments are blocked before `authorize` is ever called.

## Run

```sh
uv sync --group dev
docker compose up -d db redis     # infra (see note below)
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```

Docs: http://localhost:8000/docs · Health: http://localhost:8000/health

> Note: on this dev machine the local `postgresql-x64-18` service owns host
> port 5432, so the actual DB runs in a `pg-payguard` container on port 5433.
> Point `DATABASE_URL` at whatever Postgres is reachable in your environment.

## Worker

Offline analysis + alert broadcast:

```sh
uv run celery -A app.worker.celery worker -l info --pool=solo
```

Set `ASYNC_ANALYSIS=true` to make `POST /payments/{id}/analyze` enqueue the
saga to the worker instead of running it inline.

## Tests

```sh
uv run pytest -q
```

The suite is DB-free: gateway and AI models are fakes, the saga/orchestrator/
rule engine run on in-memory inputs, and the API smoke tests use httpx against
the ASGI app.

## Seed demo scenarios

```sh
uv run python -m scripts.seed_demo_scenarios
```

Creates one user and four payments covering the demo narrative: LOW
(auto-approve), MEDIUM (confirmation required), HIGH (2FA verification) and
CRITICAL (blocked before authorize).

## SMS interception (real-world scam detection)

`POST /api/v1/signals/sms` ingests real inbound messages captured on the
phone, scores them for phishing/impersonation/payment-scam signals, and
routes: LOW → ignore, MEDIUM → alert, HIGH/CRITICAL → reject (quarantine
+ push via WebSocket).

Legit OTPs from known bank shortcodes with no link or payment request are
auto-classified as LOW (no alert).

**Legit shortcode allowlist** lives in
`app/services/ingest/extractor.py` → `KNOWN_LEGIT_SHORTCODES`; add new
bank shortcodes there as needed.

**Known-legit domain list** for link scoring lives in
`app/models_ai/signal_scorer.py` → `KNOWN_LEGIT_DOMAINS`.