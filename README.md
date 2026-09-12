<div align="center">

# 🛡️ PayGuard

### Agentic Guardian for Real-Time Payment Scam Interception

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Python](https://img.shields.io/badge/Python-3.13-blue?logo=python)](./src/paygraud/backend)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](./src/paygraud/backend)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](./src/paygraud/frontend/web)
[![Expo](https://img.shields.io/badge/Expo-SDK%2057-000020?logo=expo)](./src/paygraud/mobile)
[![React Native](https://img.shields.io/badge/React%20Native-0.86-61DAFB?logo=react)](./src/paygraud/mobile)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)](./src/paygraud/mobile)

*Stop payment scams before they happen — powered by a multi-model AI orchestrator, real-time SMS analysis, and an agentic LangGraph pipeline.*

</div>

---

## 🌟 What is PayGuard?

PayGuard is a full-stack, hackathon-born payment security platform that intercepts financial scams in real time. Every payment you initiate is scored by a **multi-model AI pipeline** (OpenAI + Anthropic + Groq + Ollama) before a single rupee moves. Suspicious SMS messages, phishing links, and UPI fraud attempts are caught at the device level before the user can act on them.

`
  [Mobile App / Web Dashboard]
          │  initiate transfer / scan SMS
          ▼
  [FastAPI Backend]
          │  create payment → run LangGraph pipeline
          ▼
  [AI Orchestrator]  local → cloud → aggregator
          │  risk score 0–100 → LOW / MEDIUM / HIGH / CRITICAL
          ▼
  [Payment Gateway Simulator]
          │  auto-approve / hold / block
          ▼
  [WebSocket] ──── real-time alert to mobile + web
`

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **Multi-Model AI** | OpenAI, Anthropic, Groq, OpenRouter, Ollama — weighted ensemble with fallback rule engine |
| 🔗 **LangGraph Pipeline** | Compiled, traceable agentic graph: local model → cloud escalation → score aggregation |
| 🔒 **Payment Saga** | State-machine-enforced lifecycle: pending → analyzing → confirmed/blocked |
| 📱 **SMS Interception** | Device-level SMS scanning — phishing links, spoofed senders, UPI traps detected instantly |
| ⚡ **Real-Time Alerts** | WebSocket push to mobile + web the moment a threat is detected |
| 👆 **Biometric Auth** | Face ID / fingerprint via expo-local-authentication |
| 🛡️ **Risk Bands** | LOW → auto-approve, MEDIUM → user confirmation, HIGH → verification, CRITICAL → auto-block |
| 📊 **Risk Reports** | Per-payment multi-model breakdown with flags, confidence scores, explanations |

---

## 🏗️ Architecture

`
Pay_Graurdrail/                       ← monorepo root
├── src/paygraud/
│   ├── backend/                      ← FastAPI (Python 3.13, uv)
│   │   ├── app/
│   │   │   ├── api/v1/               ← auth, payments, alerts, signals, gateway, ws
│   │   │   ├── agents/               ← LangGraph orchestrator + pipeline nodes
│   │   │   ├── models_ai/            ← OpenAI, Anthropic, Groq, Ollama, rule engine
│   │   │   ├── services/             ← payment_saga, payment_service, signal_service
│   │   │   ├── models/               ← SQLAlchemy 2.0 ORM models
│   │   │   └── schemas/              ← Pydantic v2 request/response schemas
│   │   ├── tests/                    ← 32 pytest tests (DB-free)
│   │   └── docker-compose.yml        ← postgres:16 (port 5433) + redis:7
│   │
│   ├── frontend/web/                 ← Next.js 14 admin dashboard
│   │   └── app/                     ← App Router pages
│   │
│   └── mobile/                      ← Expo / React Native app
│       ├── app/(auth)/              ← Welcome, Login, Register
│       ├── app/(tabs)/              ← Dashboard, Ledger, Threat Center, Preferences
│       ├── app/secure-transfer/     ← Initiate, Detail, SMS Capture
│       ├── services/                ← PayGuardNetworkClient, BioAuthEngine, ThreatStream
│       ├── store/                   ← Zustand: session, ledger, threat intelligence
│       └── types/                   ← payGuardModels.ts (backend-aligned DTOs)
│
├── docs/                            ← Project plan, diagrams
├── data/                            ← Datasets and seed data
├── screenshot/                      ← Demo screenshots
├── .agents/skills/payguard-docs/    ← Custom Antigravity doc-writing skill
├── AGENTS.md                        ← Repo rules for AI coding agents
└── requirements.txt                 ← Root-level pinned dependencies
`

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|---|---|
| Python | 3.13+ |
| uv | latest (pip install uv) |
| Node.js | 20+ |
| npm | 10+ |
| Docker Desktop | latest (for Postgres + Redis) |
| Expo Go app | (for mobile device preview) |

---

### 1 — Backend

`powershell
cd src\paygraud\backend

# Install deps
uv sync --group dev

# Start infra (Postgres on 5433, Redis on 6379)
docker-compose up -d

# Apply migrations
uv run alembic upgrade head

# (Optional) seed demo data
uv run python scripts/seed_demo_scenarios.py

# Start API server
uv run uvicorn app.main:app --reload
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
# Health: http://localhost:8000/health
`

**Required .env keys** (copy from .env.example):

`env
DATABASE_URL=postgresql+asyncpg://payguard:payguard@localhost:5433/payguard
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=change-me-to-a-random-string
OPENAI_API_KEY=          # optional — rule engine works without it
ANTHROPIC_API_KEY=       # optional
GROQ_API_KEY=            # optional
`

---

### 2 — Mobile App

`powershell
cd src\paygraud\mobile
npm install

# Android
npm run android

# iOS
npm run ios

# Web (browser preview)
npm run web
`

Set API_BASE_URL in constants/apiConfig.ts to your backend URL (use ngrok for device testing).

---

### 3 — Web Dashboard

`powershell
cd src\paygraud\frontend\web
npm install
npm run dev
# Dashboard: http://localhost:3000
`

Set NEXT_PUBLIC_API_URL in .env.local:
`env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
`

---

## 🧪 Tests

`powershell
cd src\paygraud\backend
uv run pytest tests/ -v
# 31 passed, 1 skipped (DB-dependent test auto-skips when Postgres is off)
`

---

## 📦 Sub-Project READMEs

| Sub-project | README | Tech |
|---|---|---|
| 🐍 Backend API | [src/paygraud/backend/README.md](./src/paygraud/backend/README.md) | FastAPI, Python 3.13, LangGraph |
| 🌐 Web Dashboard | [src/paygraud/frontend/web/README.md](./src/paygraud/frontend/web/README.md) | Next.js 14, React 18, Tailwind |
| 📱 Mobile App | [src/paygraud/mobile/README.md](./src/paygraud/mobile/README.md) | Expo 57, React Native 0.86 |

---

## 🗺️ Roadmap

- [x] Multi-model AI orchestrator (LangGraph)
- [x] Payment saga state machine
- [x] SMS phishing detection
- [x] Real-time WebSocket alerts
- [x] Biometric authentication
- [x] Full test suite (32 tests)
- [ ] LangSmith tracing integration
- [ ] Production Celery async analysis
- [ ] Push notifications (Expo)
- [ ] ML-based anomaly detection (velocity patterns)

---

## 🤝 Contributing

1. Fork and create a branch off ackend, rontend_web, or mobile
2. Keep commits ≤ 100 LOC net diff (target ~50 LOC) — see [AGENTS.md](./AGENTS.md)
3. All backend PRs land in src/paygraud/backend/, mobile in src/paygraud/mobile/
4. Run uv run pytest before pushing backend changes

---

## 📄 License

MIT — see [LICENSE](./LICENSE)

---

<div align="center">
<sub>Built with ❤️ during a hackathon · Powered by FastAPI, LangGraph, Expo, and multi-model AI</sub>
</div>
