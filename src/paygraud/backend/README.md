<div align="center">

# PayGuard Backend

### Real-time payment scam interception engine

[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-red?logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tests](https://img.shields.io/badge/tests-34%20passing-brightgreen)](#testing)

</div>

---

## What is this?

The PayGuard backend is the decision engine of the platform. Every payment is scored by a **multi-model AI ensemble** orchestrated in a LangGraph graph, and the resulting risk decision is enforced through a **payment saga state machine** before any (simulated) money moves. It also ingests **SMS and QR signals** from the mobile client — phishing links, spoofed senders and UPI fraud payloads become permanent risk records.

## Features

- **Multi-model AI orchestration** — OpenAI, Anthropic, Groq, OpenRouter and a local Ollama model behind a weighted aggregator, with a rule-engine fallback when no network model answers.
- **LangGraph risk pipeline** — `local_model → cloud_models → aggregator` with early exit on low risk; traces available per payment.
- **Payment saga state machine** — `pending → analyzing → awaiting_confirmation → confirmed → completed`, with `blocked / canceled / failed` as compensations:
  - 🟢 **LOW** → auto-approve
  - 🟡 **MEDIUM** → hold for human confirmation
  - 🟠 **HIGH** → verification required
  - 🔴 **CRITICAL** → auto-block *before* `authorize` is called
- **Signal ingestion** — `POST /signals` accepts SMS / QR payloads; UPI strings are parsed for `pa`/`pn`/`am`, scored, and rejected payees can be persisted as blacklisted recipients.
- **Real-time WebSockets** — alert + payment-status frames pushed to authenticated clients.
- **Async-first** — SQLAlchemy 2.0 + `asyncpg` throughout; Celery wiring available (defaults to inline analysis).

## Architecture

Layered monolith — thin routers, business services, agent/graph layer, data layer:

```text
src/paygraud/backend/
├── app/
│   ├── api/v1/        # auth, payments, recipients, alerts, gateway, signals, websockets, debug
│   ├── agents/        # LangGraph orchestrator + pipeline nodes
│   ├── models_ai/     # OpenAI, Anthropic, Groq, Ollama, rule engine, router (fallback chain)
│   ├── services/      # payment_saga, payment_service, signal/recipient/alert/auth/audit
│   │   └── gateway/   # BaseGateway interface + PaymentSimulator (fake rails)
│   ├── models/        # async SQLAlchemy 2.0 models
│   ├── schemas/       # Pydantic v2 schemas
│   ├── core/          # exceptions (uniform error body), security
│   ├── db/            # async session + declarative base
│   ├── config.py      # pydantic-settings (.env)
│   └── main.py        # FastAPI entry (docs /docs, health /health, CORS)
├── alembic/           # migrations (generation needs a live Postgres)
├── tests/             # 34 pytest tests — DB-free
├── scripts/           # seed_demo_scenarios.py
├── Dockerfile
├── docker-compose.yml # postgres:16 (5433) + redis:7 (6379)
└── pyproject.toml, uv.lock
```

> [!IMPORTANT]
> The payment gateway is **simulated** (`PaymentSimulator`) — this build moves no real money.

## Getting started

Prerequisites: **Python 3.12+** and [uv](https://docs.astral.sh/uv/), **Docker**.

```powershell
# 1. Install dependencies (creates .venv)
uv sync --group dev

# 2. Secrets
Copy-Item .env.example .env   # DATABASE_URL, REDIS_URL, AI keys

# 3. Local infra
docker compose up -d          # Postgres on 5433, Redis on 6379

# 4. Migrations
uv run alembic upgrade head

# 5. Optional demo data
uv run python scripts/seed_demo_scenarios.py

# 6. Run the API
uv run uvicorn app.main:app --reload --port 8001
#   /docs   Swagger UI
#   /health health probe
```

Environment variables (see `.env.example`):

| Variable | Purpose | Default |
| --- | --- | --- |
| `DATABASE_URL` | Async Postgres DSN (`postgresql+asyncpg://…`) | required |
| `REDIS_URL` | Redis DSN | `redis://localhost:6379/0` |
| `SECRET_KEY` | JWT signing secret | required |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GROQ_API_KEY` | Cloud model keys | optional (rule engine covers) |

## API

Base URL: `/api/v1` — interactive docs at `/docs`.

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v1/payments` | Initiate a payment saga (analyze → auto/confirm/block) |
| `GET /api/v1/payments/{id}` | Payment + risk report |
| `POST /api/v1/payments/{id}/confirm` / `block` | Human-in-the-loop decisions on held transfers |
| `POST /api/v1/signals` | Ingest SMS / QR signal, get verdict (`channel: sms|qr`) |
| `POST /api/v1/recipients` | Add beneficiary (optional `risk_hint` blacklists flagged payees) |
| `GET /api/v1/ws?token=<jwt>` | WebSocket — alert + payment-status stream |

## Testing

```powershell
uv run pytest -q        # 34 passed — no DB/network needed (injected fakes)
```

Run targeted subsets: `uv run pytest tests/test_signal_ingest.py -v`.

## Contributing

See the repo-level [AGENTS.md](../../../AGENTS.md). Rule of thumb: branch (`backend`) mirrors this directory, commits stay **≤100 LOC net**, migrations require a live Postgres, and **no sync SQLAlchemy** patterns.

## License

[MIT](../../../LICENSE)