# AGENTS.md

## Repo status
Planning phase — no application code yet. Tracked files: `project_plan.md`, `.gitignore`. Planning docs live in `local/` (all `*.md` + PDF) and are **gitignored**.

## Commits (hard rules)
- **Max 100 LOC per commit** (net diff). Target ~50 LOC. If a change exceeds this, split it into multiple logical commits.
- Commit messages: one concise summary line + short body explaining what and why.
- Only commit when explicitly asked. Never commit anything from `local/`.
- Repo-level auth: `Joey-1123 <shubhampanchal9168@gmail.com>`. Author must stay `Joey-1123` — do not change git config.

## Reference docs
- `local/BACKEND.md` — backend plan (FastAPI, SQLAlchemy 2.0, PostgreSQL 16, Redis, Celery)
- `local/FRONTEND.md`, `local/MOBILE.md`, `local/MULTI_MODEL.md`, `local/DATABASES.md`, `local/ARCHITECTURE.md`
- `project_plan.md` — milestones, demo scenarios, next actions

## Stack (planned)
- Backend: `backend/` — FastAPI app under `app/` (api, agents, models_ai, models, schemas, services)
- Multi-model AI: OpenAI + Anthropic + Local (Ollama) routed by orchestrator with fallback
- Payment gateway is simulated (`PaymentSimulator`) — no real money rails
- WebSocket for real-time alerts; ngrok for demo device access (CORS must allow `https://*.ngrok-free.app`)

## Environment
- Windows / PowerShell (5.1). No `&&` chaining — use `;` and `if ($?)`.
- No test/lint tooling wired up yet; add pytest smoke tests with the scaffold.