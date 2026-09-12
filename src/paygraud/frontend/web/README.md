<div align="center">

# PayGuard Web Dashboard

### Real-time fraud monitoring & payment interception for analysts

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](#license)

</div>

---

## What is this?

The PayGuard web dashboard is the analyst console for the [PayGuard backend](../../backend/README.md). It visualizes the **payment saga in real time** — risk scores from the multi-model AI ensemble, interception status, and the live alert stream — and lets analysts resolve **held (human-in-the-loop) payments** directly from the table.

## Features

- **Live threat table** — every payment with its risk band, blacklisted / held / cleared status, and one-click **Approve / Block** on `awaiting_confirmation` rows.
- **Real-time updates** — the table and alert feed refresh on WebSocket frames from the backend.
- **Saga visualization** — Mermaid lifecycle diagrams of payment states.
- **Agent transparency** — drill into per-model evaluations behind every decision.
- **Responsive analytics UI** — Tailwind CSS + Zustand state store.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router) + React 18 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| State | Zustand 5 |
| HTTP | Axios (`lib/api.ts`) |
| Diagrams | Mermaid |
| Icons | Lucide React |

## Getting started

Prerequisites: **Node.js 20+**, **npm 10+**.

```powershell
cd src\paygraud\frontend\web

# 1. Install dependencies
npm install

# 2. Point at the backend (see backend README)
#    src\paygraud\frontend\web\.env.local
#    NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1

# 3. Development server  →  http://localhost:3000
npm run dev

# 4. Production build / serve
npm run build
npm start
```

| Variable | Purpose | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend REST base | `http://localhost:8001/api/v1` |

## Project structure

```text
src/paygraud/frontend/web/
├── app/
│   ├── layout.tsx      # root layout
│   ├── page.tsx        # main dashboard view
│   └── login/          # authentication
├── components/         # UI components (PaymentsTable, charts, forms)
├── lib/                # axios instance, api.ts, formatters, types
├── store/              # Zustand stores (dashboard, alerts)
├── public/             # static assets
└── config/             # next.config.mjs, tailwind.config.ts, package.json
```

## Contributing

See the repo-level [AGENTS.md](../../../AGENTS.md). Work for this directory lands on the `frontend_web` branch; keep commits small, and run `npm run build` before submitting.

## License

[MIT](../../../LICENSE)