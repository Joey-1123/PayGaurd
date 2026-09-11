# PROJECT PLAN — Agentic Guardian for Real-Time Payment Scam Interception

## 1. Project Overview

| Field | Details |
|-------|---------|
| **Problem** | PS09 — Digital payment scams (suspicious requests, impersonation, unusual recipients, urgency-based social engineering, fraud patterns) |
| **Solution** | Agentic payment-security assistant that analyzes payment requests, evaluates risk, verifies recipients, and intervenes BEFORE the transaction completes |
| **Event** | Hackathon Live Demo |
| **Team Size** | 3-5 developers |

## 2. Scope

### In Scope
- Payment simulation interface (web + mobile)
- Multi-model risk analysis (OpenAI + Anthropic + Local)
- Recipient verification workflow
- Risk scoring & categorization (LOW/MEDIUM/HIGH/CRITICAL)
- Pause/block mechanism before transaction completion
- Explainable security alerts
- Transaction audit history
- 4 demo scenarios (normal, new recipient, suspicious, high-risk)

### Out of Scope (For Hackathon)
- Real payment gateway integration (Stripe/Razorpay/banking rails)
- Production deployment/hardening
- Multi-tenant production hosting
- Regulatory compliance (PCI-DSS)

## 3. Tech Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| **Frontend (Web)** | Next.js 14, TypeScript, Tailwind, shadcn/ui, Zustand | Fast SSR/SSG, hackathon-friendly, rich UI ecosystem |
| **Backend** | FastAPI, Python 3.11, SQLAlchemy, Pydantic v2 | Async, great AI/ML ecosystem | 
| **Mobile** | React Native + Expo SDK 50, React Navigation | Cross-platform, quick setup |
| **Database** | PostgreSQL 16 (+ Redis for cache/WS) | Robust relational + audit-appropriate |
| **AI Models** | OpenAI GPT-4, Anthropic Claude, Local (Ollama/ML) | Multi-model architecture: reasoning + safety + speed |
| **Async Tasks** | Celery + Redis | Background risk analysis, notifications |
| **Real-time** | WebSocket (FastAPI) | Live alerts & status updates |
| **Auth** | JWT (web + mobile share same backend) | Simple, stateless |

## 4. Architecture at a Glance

```
[ Next.js Web App ]  [ React Native Expo App ]
        │                     │
        └──────────┬──────────┘
                   ▼
           [ FastAPI Backend ] ────▶ [ Multi-Model Orchestrator ]
                   │                          │  OpenAI / Claude / Local
                   ▼                          ▼
        [ PostgreSQL + Redis ]        [ Risk → Decision Matrix ]
                   │                          │
                   ▼                          ▼
        [ Simulated Gateway ] <───── [ LOW=approve / MEDIUM=confirm / HIGH=verify / CRITICAL=block ]
```

## 5. Milestones & Timeline (12 Hours)

### M1 — Foundation (Hours 0-2)
| Task | Owner | Output |
|------|-------|--------|
| Repo setup + monorepo structure | Backend dev | Git repo, all 3 apps scaffolded |
| Docker Compose (Postgres + Redis) | Backend dev | `docker-compose.yml` running |
| Backend: FastAPI skeleton + config | Backend dev | `/health` endpoint works |
| Database models + Alembic migration | Backend dev | Tables created |
| JWT auth (register/login/me) | Backend dev | Auth flow tested via curl |

**Gate:** Backend boots, DB migrates, auth returns JWT.

### M2 — Multi-Model Engine (Hours 2-4)
| Task | Owner | Output |
|------|-------|--------|
| Model wrappers (OpenAI, Anthropic, Local) | AI dev | 3 classes implementing base interface |
| Orchestrator with routing + fallback | AI dev | `analyze_payment()` returns RiskAssessment |
| Local model (Ollama) setup | AI dev | Local screening works offline |
| Risk score aggregation + decision matrix | AI dev | LOW/MEDIUM/HIGH/CRITICAL mapping |
| Feature extraction pipeline | AI dev | Amount/recipient/timing/pattern features |
| Model results persisted | AI dev | `model_results` rows saved |

**Gate:** `POST /analyze` returns risk score + explanation for a test payment.

### M3 — Web Frontend (Hours 4-6)
| Task | Owner | Output |
|------|-------|--------|
| Next.js scaffold + Tailwind + shadcn/ui | Frontend dev | Design system ready |
| Login/Register pages | Frontend dev | Auth flow connected |
| Dashboard (stats, recent transactions) | Frontend dev | Overview page |
| New payment form + risk panel | Frontend dev | Real-time risk display |
| Confirmation modal + security warnings | Frontend dev | Human-in-loop step |
| Alerts page + audit history table | Frontend dev | Explainability visible |

**Gate:** Web app can create a payment, see risk score, confirm/block.

### M4 — Simulated Gateway + Demo Seed (Hours 6-7)
| Task | Owner | Output |
|------|-------|--------|
| PaymentSimulator service (authorize/capture/cancel) | Backend dev | Fake money flow works |
| Gateway endpoints under `/api/v1/gateway/*` | Backend dev | Demo ledger visible |
| `seed_demo_scenarios.py` script | Backend dev | Demo user + 4 recipients |
| Payment service gating (block before authorize) | Backend dev | CRITICAL never reaches gateway |

**Gate:** 4 scenarios produce 4 distinct behaviors end-to-end.

### M5 — Mobile App (Hours 7-9)
| Task | Owner | Output |
|------|-------|--------|
| Expo scaffold + navigation | Mobile dev | App boots on device/emulator |
| Login/Register screens | Mobile dev | Auth works |
| Dashboard + payments list | Mobile dev | Data from backend |
| New payment screen + risk display | Mobile dev | Risk panel shown |
| Alerts screen + push notifications | Mobile dev | Real-time alerts |
| Biometric confirm for high-risk | Mobile dev | FaceID/TouchID gate |

**Gate:** Mobile mirrors web for core flows.

### M6 — Real-time + Polish + Rehearsal (Hours 9-12)
| Task | Owner | Output |
|------|-------|--------|
| WebSocket alerts (live updates) | Backend + frontend | Live bell/notifications |
| Audit log completeness | Backend dev | Every action audited |
| UI polish (empty states, loading, errors) | All | Demo-grade visuals |
| Seed + smoke-test all 4 scenarios | All | Scripted demo works |
| ngrok tunnel smoke test (phone → backend) | Mobile + backend | Login + payment from physical device works |
| Rehearse demo flow + timing | Presenter | 5-7 min script |
| Prepare backup plan (offline fallback) | All | Local-model-only mode works if APIs fail |

**Gate:** Full demo passes 2 rehearsals without failures.

## 6. Deliverables

| Deliverable | File/Path | Status |
|-------------|-----------|--------|
| Problem spec | `ps09.md` | ✅ Done |
| Frontend plan | `FRONTEND.md` | ✅ Done |
| Backend plan | `BACKEND.md` | ✅ Done |
| Mobile plan | `MOBILE.md` | ✅ Done |
| Multi-model architecture | `MULTI_MODEL.md` | ✅ Done |
| Database schema | `DATABASES.md` | ✅ Done |
| System architecture + demo flow | `ARCHITECTURE.md` | ✅ Done |
| Project plan | `project_plan.md` | ✅ This file |
| Web app code | `frontend/` | ⏳ Build |
| Backend code | `backend/` | ⏳ Build |
| Mobile code | `mobile/` | ⏳ Build |
| Docker compose | `docker-compose.yml` | ⏳ Build |
| Final demo | Live presentation | ⏳ Rehearsal |

## 7. Key Design Decisions

1. **No real payment gateway** — a `PaymentSimulator` mimics authorize/capture; risk engine blocks BEFORE authorize.
2. **Multi-model, not single-model** — GPT-4 for reasoning, Claude for safety, local model for fast cheap screening; weighted aggregation + fallback chain.
3. **Human-in-the-loop** — MEDIUM asks confirmation, HIGH requires verification, CRITICAL blocks with manual-override-only.
4. **Explainability is a feature** — every risk decision persists flags + explanations to `risk_factors` and surfaces them in UI.
5. **Audit trail** — immutable `audit_logs` makes the demo show "safe autonomous decision-making" credibly.
6. **Offline-fallback demo mode** — if OpenAI/Anthropic APIs fail during demo, local-model + rule-based path takes over so the demo never dies.

## 8. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| LLM API rate limit / outage during demo | Medium | High | Local model fallback + cached mock responses |
| Ollama not installed on demo machine | Medium | Medium | Pre-bundle rule-based fallback scorer |
| Time overrun on mobile setup | Medium | Medium | Mobile mirrors web; web can demo alone |
| DB seeding conflicts | Low | Medium | Idempotent seed script (`get-or-create`) |
| Demo data shows wrong scenario behavior | Low | High | Seed distinct recipients per scenario; freeze their risk profile |
| ngrok tunnel down / URL changed at demo time | Medium | Medium | Bring 2 tunnels + static domain; store ngrok URL in `.env`, test 10 min before |

## 9. Demo Script (5-7 min)

```
[0:00] Intro — problem: payment scams happen in real time.
[0:30] Show the 4 scenarios in the seed data (recipients list).
[1:00] Scenario 1 — Pay ₹8,000 to "John Carter" (trusted) → INSTANT approve. "Why? 12 prior payments, verified."
[2:00] Scenario 2 — Pay ₹25,000 to "Blue Lotus" (new) → confirmation prompt + risk factors shown. Explain human-in-loop.
[3:00] Scenario 3 — Pay ₹1,800 to "Customer Care 2FA" → verification workflow, HIGH alert, explanation of urgency detection.
[4:30] Scenario 4 — Pay ₹2,00,000 to "Invoice Desk" → BLOCKED instantly, critical alert. "Authorize never called — funds protected."
[5:30] Show alerts page + audit history → prove explainability & audit trail.
[6:30] Close — architecture summary slide (multi-model, human-in-loop, audit).
```

## 10. Next Action Items

- [ ] Scaffold monorepo: `frontend/`, `backend/`, `mobile/` folders
- [ ] Write `docker-compose.yml` (Postgres + Redis)
- [ ] Backend: FastAPI skeleton + models + auth
- [ ] Set up OpenAI + Anthropic API keys + Ollama
- [ ] Build PaymentSimulator
- [ ] Write seed script and run it
- [ ] Scaffold Next.js + Expo apps
- [ ] Set up ngrok: tunnel backend (`ngrok http 8000`), add `https://*.ngrok-free.app` to CORS
- [ ] Store ngrok URL in mobile `.env` and smoke-test from a physical phone