<div align="center">

# 🛡️ PayGuard

### Agentic real-time payment scam interception

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Python](https://img.shields.io/badge/Python-3.12+-blue?logo=python&logoColor=white)](./src/paygraud/backend)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](./src/paygraud/backend)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)](./src/paygraud/frontend/web)
[![Expo](https://img.shields.io/badge/Expo-57-black?logo=expo&logoColor=white)](./src/paygraud/mobile)
[![React Native](https://img.shields.io/badge/React%20Native-0.86-61DAFB?logo=react&logoColor=white)](./src/paygraud/mobile)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](./src/paygraud/mobile)
[![Tests](https://img.shields.io/badge/tests-34%20passing-brightgreen)](#testing)

*Every payment is scored by a multi-model AI ensemble — OpenAI, Anthropic, Groq and local models — before a single rupee moves.*

</div>

---

## What is PayGuard?

PayGuard is an open-source, hackathon-born **payment security and fraud interception platform**. It sits between a user's device and the payment rail, scoring every transfer with a **multi-model AI pipeline** and enforcing the decision with a **payment saga state machine**:

- **SMS / QR / UPI scam detection** at the device level — phishing links, spoofed senders and fake UPI billing QRs are caught before the user acts.
- **Risk bands drive the outcome** — LOW auto-approves, MEDIUM holds for human confirmation, HIGH escalates, CRITICAL blocks *before* `authorize` is ever called.
- **Real-time enforcement** — verdicts arrive over WebSocket on both the mobile app and the analyst web dashboard.

> [!IMPORTANT]
> This is a hackathon build. The payment gateway is a simulated provider (`PaymentSimulator`) — **no real money moves through this codebase**.

---

## Key Features

| Feature | What it does |
| --- | --- |
| **Multi-model AI ensemble** | OpenAI, Anthropic, Groq, OpenRouter and local Ollama models, weighted + aggregated, with a rule-engine fallback when no model is reachable. |
| **Agentic risk pipeline** | A compiled, traceable LangGraph graph: `local model → cloud escalation → aggregator`, short-circuiting on decisive scores. |
| **Payment saga state machine** | `pending → analyzing → awaiting_confirmation → confirmed → completed`, with `blocked / canceled / failed` compensations. |
| **Human-in-the-loop consent** | Held transfers surface Approve / Block on the mobile ledger and the web dashboard. |
| **Device-level SMS interception** | Clipboard auto-ingest in Expo Go plus a native Android SMS receiver (`PayGuardSms` module) for dev builds. |
| **QR / UPI scam feeds** | Scanner payloads flow through the real signal pipeline — rejected payees are blacklisted as critical recipients. |
| **Real-time alerts** | WebSocket pushes alert + ledger events to mobile and web the instant a threat is detected. |
| **Biometric auth** | Face ID / fingerprint via `expo-local-authentication`. |

## Architecture

```
src/paygraud/                     ← monorepo (each app ships its own branch)
├── backend/                      ← FastAPI monolith (Python 3.12+, uv, async SQLAlchemy 2.0)
│   ├── app/api/v1/               ← auth, payments, recipients, alerts, signals, gateway, ws
│   ├── app/agents/               ← LangGraph orchestrator
│   ├── app/models_ai/            ← OpenAI, Anthropic, Groq, Ollama, rule engine + router
│   ├── app/services/             ← payment_saga, payment_service, signal/recipient/alert services
│   ├── app/models/ + schemas/    ← async SQLAlchemy 2.0 + Pydantic v2
│   ├── tests/                    ← 34 pytest tests (DB-free)
│   └── docker-compose.yml        ← postgres:16 (5433) + redis:7 (6379)
├── frontend/web/                 ← Next.js 14 analyst dashboard (App Router)
├── mobile/                       ← Expo 57 / React Native 0.86 app
│   ├── app/(tabs)/               ← Dashboard, Ledger, Threat Center, Preferences
│   ├── app/secure-transfer/      ← Initiate, Detail, Signal Lab, Case Study
│   ├── app/money/                ← Add Funds, Receive
│   ├── modules/payguard-sms/     ← native Android SMS bridge (dev builds)
│   ├── store/                    ← Zustand (session, ledger, threat intelligence)
│   └── types/                    ← payGuardModels.ts (backend-aligned DTOs)
├── docs/                         ← project_plan.md, diagrams
├── data/                         ← demo datasets/artifacts
└── screenshot/                   ← demo screenshots
```

## Quick Start

Prerequisites: **Python 3.12+**, [uv](https://docs.astral.sh/uv/), **Node.js 20+**, **Docker Desktop** (Postgres + Redis), Expo Go on a phone.

### 1. Backend (API + AI engine)

```powershell
cd src\paygraud\backend

# 1. Install dependencies (creates .venv)
uv sync --group dev

# 2. Copy secrets template
Copy-Item .env.example .env      # then edit DATABASE_URL / AI keys

# 3. Start Postgres + Redis
docker compose up -d

# 4. Apply migrations
uv run alembic upgrade head

# 5. (Optional) seed demo transfers + demo user
uv run python scripts/seed_demo_scenarios.py

# 6. Run the API  →  http://localhost:8001
uv run uvicorn app.main:app --reload --port 8001
#   Docs:     http://localhost:8001/docs
#   Health:   http://localhost:8001/health
```

> [!NOTE]
> Migration generation (`alembic revision --autogenerate`) needs a live Postgres. The default DB runs on `localhost:5433` from `docker compose`.

### 2. Mobile app (Expo / React Native)

```powershell
cd src\paygraud\mobile
npm install
npx expo start            # scan the QR in Expo Go
```

- **Emulator**: works out of the box — the app defaults to `http://localhost:8001`.
- **Physical device**: point the app at your machine over a public tunnel and restart Expo:

```powershell
ngrok http 8001
$env:EXPO_PUBLIC_NGROK_URL="https://your-tunnel.ngrok-free.app"
npx expo start
```

> [!NOTE]
> The CORS policy already allows `https://*.ngrok-free.app`. The app derives both the REST base and the WebSocket URL from `EXPO_PUBLIC_NGROK_URL` (`constants/apiConfig.ts`).

### 3. Web dashboard (analyst UI)

```powershell
cd src\paygraud\frontend\web
npm install
# src\paygraud\frontend\web\.env.local
#   NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1
npm run dev               # → http://localhost:3000
```

## Demo / Case studies

The mobile app ships a **guided behind-the-scenes case study** (`secure-transfer/pg-case-study`) that replays two real attack paths end to end:

1. **Phishing SMS** — copy the spoofed `VM-HDFCBK` "KYC blocked" message into Signal Lab and watch the real scorer flag it.
2. **Fake UPI invoice QR** — scan the `Invoice Desk LLC` payload in Threat Center; it is rejected, the payee is blacklisted, and a payment attempt is blocked by the saga.

Sign in with the demo account: `demo@payguard.io` / `Payguard@123`.

## Testing

```powershell
cd src\paygraud\backend
uv run pytest -q          # 34 passed (DB-free: extractor, scorer, saga, gateway, orchestrator)
```

## Project map

| Sub-project | Docs | Stack |
| --- | --- | --- |
| Backend API | [`src/paygraud/backend/README.md`](./src/paygraud/backend/README.md) | FastAPI, Python 3.12+, LangGraph, PostgreSQL |
| Web dashboard | [`src/paygraud/frontend/web/README.md`](./src/paygraud/frontend/web/README.md) | Next.js 14, React 18, Tailwind |
| Mobile app | [`src/paygraud/mobile/README.md`](./src/paygraud/mobile/README.md) | Expo SDK 57, React Native 0.86 |
| Project plan | [`docs/project_plan.md`](./docs/project_plan.md) | Milestones, demo scenarios, next actions |

See [AGENTS.md](./AGENTS.md) for repository rules for AI coding agents (branch → directory mapping, ≤100-LOC commits, `local/` is never committed).

## Roadmap

- [x] Multi-model AI risk orchestrator (LangGraph)
- [x] Payment saga state machine with human-in-the-loop consent
- [x] SMS / QR / UPI fraud detection through the real signal pipeline
- [x] Real-time WebSocket alerts (mobile + web) with device notifications
- [x] Biometric authentication
- [x] 34-test backend suite (DB-free)
- [ ] Remote push notifications (expo-notifications foreground → full background)
- [ ] Celery async analysis in production
- [ ] ML anomaly detection (velocity / behavioural patterns)

---

<div align="center">

Built for a hackathon — powered by FastAPI, LangGraph, Expo and multi-model AI.

MIT licensed · see [LICENSE](./LICENSE)

</div>