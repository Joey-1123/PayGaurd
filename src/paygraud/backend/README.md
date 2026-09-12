<div align="center">
  <h1>🛡️ PayGuard Backend</h1>
  <p><strong>Agentic Guardian for Real-Time Payment Scam Interception</strong></p>
  <p>
    <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=FastAPI&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Python-3.13-3776AB?style=flat&logo=python&logoColor=white" alt="Python" />
    <img src="https://img.shields.io/badge/SQLAlchemy-2.0-red?style=flat&logo=sqlalchemy&logoColor=white" alt="SQLAlchemy" />
    <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  </p>
</div>

---

## 📖 Overview

The PayGuard Backend is the core intelligence engine that processes real-time payments, runs them through a multi-model AI risk analysis pipeline (LangGraph), and orchestrates the payment saga. It leverages FastAPI for high-performance async APIs, SQLAlchemy 2.0 with PostgreSQL 16 for robust data persistence, and a multi-tiered AI approach (Local models → Cloud models → Aggregator) to intercept scams before money moves.

## ✨ Features

- **Multi-Model AI Orchestration:** Utilizes OpenAI, Anthropic, Groq, OpenRouter, and local Ollama models with a rule engine fallback.
- **LangGraph Risk Pipeline:** `local_model` node → `cloud_models` node → `aggregator` node (short-circuits on LOW risk scores).
- **Payment Saga State Machine:** Robust state management (`pending` → `analyzing` → `awaiting_confirmation` → `confirmed` → `completed` / `blocked` / `failed`).
- **Dynamic Risk Categorization:**
  - 🟢 **LOW**: Auto-approve
  - 🟡 **MEDIUM**: Hold for confirmation
  - 🟠 **HIGH**: Verification required
  - 🔴 **CRITICAL**: Auto-block
- **Real-Time WebSockets:** Push alerts and payment status updates instantly to clients.
- **Asynchronous Processing:** Built-in support for Celery task queuing (toggleable).

## 🏗️ Architecture

The backend follows a layered monolith architecture:
- **API Layer (`/api/v1`)**: Thin routers handling HTTP/WebSocket requests.
- **Service Layer**: Business logic, orchestrating the payment saga and risk reporting.
- **Agent Layer (`agents/`)**: Multi-model orchestration using LangGraph.
- **Data Layer (`models/`)**: Async SQLAlchemy 2.0 models mapped to PostgreSQL.

*Note: The payment gateway is simulated (`PaymentSimulator`) - no real money rails are used in this hackathon build.*

## 📋 Prerequisites

- **Python 3.13**
- **uv** (Package Manager)
- **Docker & Docker Compose** (for PostgreSQL 16 & Redis 7)

## 🛠️ Installation

1. Clone the repository and navigate to the backend directory:
   ```bash
   cd src/paygraud/backend
   ```
2. Sync dependencies and setup the virtual environment using `uv`:
   ```bash
   uv sync --group dev
   ```

## 🚀 Running

1. **Start Infrastructure (Postgres & Redis):**
   ```bash
   docker-compose up -d
   ```
   *(Ensure Postgres is running on port 5433 and Redis on 6379)*

2. **Run Migrations (requires live Postgres):**
   ```bash
   uv run alembic upgrade head
   ```

3. **Start the FastAPI Server:**
   ```bash
   uv run uvicorn app.main:app --reload
   ```

## ⚙️ Environment Variables

Create a `.env` file in the `backend` root. Key configurations:

- `DATABASE_URL`: Connection string for Postgres (e.g., `postgresql+asyncpg://user:pass@localhost:5433/db`)
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`: API keys for cloud models.
- `ASYNC_ANALYSIS`: Defaults to `false` (inline). Set to `true` to use Celery workers.

## 📂 Project Structure

```text
src/paygraud/backend/
├── app/
│   ├── api/v1/        # Routers: auth, payments, recipients, alerts, gateway, signals, websockets, debug
│   ├── services/      # Business logic, saga, risk reporting
│   ├── agents/        # LangGraph orchestrator
│   ├── models_ai/     # Model integrations (OpenAI, Anthropic, Ollama, routers)
│   ├── models/        # SQLAlchemy 2.0 ORM models
│   ├── schemas/       # Pydantic v2 validation schemas
│   ├── core/          # Security, config, exceptions
│   └── main.py        # Application entry point
├── alembic/           # DB Migrations
├── tests/             # Pytest suite
└── docker-compose.yml # Local DB/Redis infrastructure
```

## 🔌 API Reference

- **Base URL:** `/api/v1`
- **Swagger Docs:** `GET /docs`
- **Health Check:** `GET /health`
- **WebSocket Alerts:** `ws://<host>/api/v1/ws/{user_id}`

### Key Endpoints:
- `POST /api/v1/payments`: Initiate a new payment saga.
- `GET /api/v1/payments/{id}`: Check payment status.
- `POST /api/v1/signals`: Ingest external risk signals.

## 🧪 Testing

The backend includes 32 tests (31 pass without DB, 1 auto-skips when Postgres is unavailable).

To run the test suite:
```bash
uv run pytest
```

## 🤝 Contributing

1. Check out the appropriate branch (`backend`).
2. Adhere to the **Max 100 LOC per commit** rule.
3. No sync SQLAlchemy patterns; use `asyncpg`.
4. Run `uv run pytest` before submitting changes.

## 📄 License

This project is licensed under the MIT License.