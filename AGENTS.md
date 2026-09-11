# AGENTS.md

## Repo status
Hackathon build in progress on branch `backend`. Planning docs live in `local/` (all `*.md` + PDF) and are **gitignored**. Tracked root files: `AGENTS.md`, `README.md`, `.gitignore`, `LICENSE`; `docs/project_plan.md` is tracked. Branches: `main` (PR-protected), `backend`, `frontend_web`, `mobile`.

## Commits (hard rules)
- **Max 100 LOC per commit** (net diff). Target ~50 LOC. If a change exceeds this, split it into multiple logical commits.
- Commit messages: one concise summary line + short body explaining what and why.
- Only commit when explicitly asked. Never commit anything from `local/`.
- Repo-level auth: `Joey-1123 <shubhampanchal9168@gmail.com>`. Author must stay `Joey-1123` — do not change git config.

## Repo layout
- Target architecture (mirrors main): `src/paygraud/backend`, `src/paygraud/frontend/web`, `src/paygraud/mobile`, plus `docs/`, `screenshot/`, `data/`, `requirements.txt`, `README.md`, `LICENSE` at root.
- Branch → directory mapping: `backend` → `src/paygraud/backend`, `frontend_web` → `src/paygraud/frontend/web`, `mobile` → `src/paygraud/mobile`. PRs must land code in the matching directory.

## Backend build state
- `src/paygraud/backend/` uses **uv** as package manager + venv (`.venv`). Python 3.14 local.
- Bootstrap: `uv sync --group dev`. Run: `uv run uvicorn app.main:app --reload` (docs at `/docs`, health at `/health`).
- Migrations: `uv run alembic revision --autogenerate`, `uv run alembic upgrade head`. Migration generation needs a live Postgres.
- Env: `src/paygraud/backend/.env` for secrets (DB URL, OPENAI/ANTHROPIC keys). Config in `app/config.py` (pydantic-settings).
- Async SQLAlchemy 2.0 + `asyncpg`. Do NOT use sync engine patterns.
- DB is `postgres:16` via `docker-compose.yml` at `src/paygraud/backend/` (db + redis). Docker Desktop/WSL may need to be started first; local `postgresql-x64-18` also exists as a fallback.

## Reference docs
- `local/BACKEND.md` — backend plan (FastAPI, SQLAlchemy 2.0, PostgreSQL 16, Redis, Celery)
- `local/FRONTEND.md`, `local/MOBILE.md`, `local/MULTI_MODEL.md`, `local/DATABASES.md`, `local/ARCHITECTURE.md`
- `project_plan.md` — milestones, demo scenarios, next actions

## Key architecture decisions
- Layered FastAPI under `app/`: `api/` (thin routers) → `services/` (business logic) → `models/` (SQLAlchemy) + `agents/` + `models_ai/`.
- External systems behind interfaces (`base_gateway.py`, `base_model.py`) so tests can inject fakes — no DB/network needed for agent unit tests.
- Payment lifecycle is a saga: `pending → analyzing → (awaiting_confirmation → confirmed →) completed`, with block/cancel/failed as compensations. CRITICAL payments are blocked before `authorize` is ever called.
- Multi-model AI: OpenAI + Anthropic + Local (Ollama) routed by orchestrator with weighted aggregation + fallback chain.
- Payment gateway is simulated (`PaymentSimulator`) — no real money rails.
- WebSocket for real-time alerts; ngrok for demo device access (CORS allows `https://*.ngrok-free.app`).

## Environment
- Windows / PowerShell (5.1). No `&&` chaining — use `;` and `if ($?)`.
- No lint/type tooling wired yet; pytest smoke suite gets added with the scaffold (Phase 9).

## Full directory map
```
.
├── AGENTS.md                  # repo rules + this map (read first)
├── README.md                  # project overview
├── LICENSE                    # MIT
├── requirements.txt           # root-level pinned dependency list (backend deps)
├── .gitignore
├── data/                      # datasets/artifacts when needed (placeholder README)
├── docs/                      # project_plan.md (milestones, demo scenarios) + placeholder README
├── screenshot/                # demo screenshots (placeholder README)
├── local/                     # gitignored design docs (BACKEND.md, MOBILE.md, etc.) — never commit
└── src/paygraud/              # monorepo: one app per subdir, each on its own branch
    ├── backend/               # FastAPI monolith — branch: backend (uv, Python 3.14, asyncpg)
    │   ├── app/
    │   │   ├── api/v1/        # thin routers: payments, recipients, alerts, gateway, auth, websockets
    │   │   ├── services/      # business logic: payment_service, payment_saga, risk_reporting,
    │   │   │                  #   recipient/alert/auth/audit services, connection_manager
    │   │   │   └── gateway/   # base_gateway.py (interface) + payment_simulator.py (fake rails)
    │   │   ├── agents/        # orchestrator.py — multi-model agent orchestration
    │   │   ├── models_ai/     # openai_model, anthropic_model, local_model (ollama),
    │   │   │                  #   rule_engine, router (fallback chain); base.py interfaces
    │   │   ├── models/        # SQLAlchemy 2.0 models: payment, recipient, alert, user,
    │   │   │                  #   device, model_result, audit_log
    │   │   ├── schemas/       # Pydantic v2: payment, recipient, alert, auth, gateway
    │   │   ├── core/          # exceptions.py (standard error body), security.py
    │   │   ├── db/            # async session + declarative base
    │   │   ├── config.py      # pydantic-settings — reads .env (DB URL, AI keys)
    │   │   └── main.py        # FastAPI entry (docs /docs, health /health, CORS)
    │   ├── alembic/           # migrations (generation needs a live Postgres)
    │   ├── tests/             # pytest: payment_saga, orchestrator, gateway, api smoke (DB-free)
    │   ├── scripts/           # seed_demo_scenarios.py (4 demo scenarios)
    │   ├── Dockerfile
    │   ├── docker-compose.yml # postgres:16 + redis:7 (local infra)
    │   ├── alembic.ini
    │   └── pyproject.toml, uv.lock   # uv-managed deps (+ optional .env, gitignored)
    ├── frontend/web/          # placeholder — real work lands on branch frontend_web
    └── mobile/                # Expo/React Native app — branch: mobile (npm, TypeScript)
        ├── app/               # expo-router file-based routes:
        │   ├── (auth)/        #   pg-login, pg-register
        │   ├── (tabs)/        #   pg-dashboard, pg-ledger, pg-preferences, pg-threat-center
        │   └── secure-transfer/ #   pg-initiate, [transactionId]
        ├── store/             # zustand stores: payGuardSessionStore, payGuardLedgerStore, threatIntelligenceStore
        ├── types/             # payGuardModels.ts — contracts aligned with backend schemas
        ├── constants/         # payGuardTheme.ts — brand colors/design tokens
        ├── assets/            # app icons and images
        └── app.json, package.json, tsconfig.json, scripts/   # Expo project config
```
- Rule of thumb for any coding agent: identify the branch you are on, read `local/` design docs for context, then only edit files under YOUR branch's `src/paygraud/<app>/` directory.