<div align="center">

# PayGuard Mobile

### AI-shielded payments in your pocket

[![Expo](https://img.shields.io/badge/Expo%20SDK-57-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.86-61DAFB?logo=react&logoColor=white)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](#license)

</div>

---

## What is this?

PayGuard Mobile is the user-facing client of the PayGuard platform. It initiates transfers, scans **SMS and QR/UPI signals** through the backend AI engine, enforces **human-in-the-loop consent** on held payments, and surfaces **real-time threat alerts** over WebSocket. Built with Expo SDK 57 / React Native 0.86 and Zustand.

> [!NOTE]
> This is a hackathon build — the payment gateway is simulated, so no real money moves.

## Features

- **QR / UPI scam scanner** (`Threat Center`) — scanner payloads run through the real signal pipeline; rejected payees become **blacklisted critical recipients**, and a payment attempt on a fraudster is **blocked by the saga**.
- **Signal Lab (SMS)** — clipboard auto-ingest (Expo Go) plus a **native Android SMS receiver** (`modules/payguard-sms`) for dev builds; phishing links and spoofed senders are scored live.
- **Human-in-the-loop** — held transfers show a consent card (Approve / Block) on the transfer detail and a `PENDING` filter in the ledger.
- **Real-time alerts** — WebSocket stream updates the ledger and fires local device notifications for status changes.
- **Biometric auth** — Face ID / fingerprint with fallback credentials.

## Screens & structure

```text
app/                         # expo-router file-based routes
├── (auth)/                  # pg-login, pg-register, pg-welcome
├── (tabs)/                  # pg-dashboard, pg-ledger, pg-threat-center, pg-preferences
├── money/                   # pg-add, pg-receive
└── secure-transfer/         # pg-initiate, [transactionId], pg-signal-capture, pg-case-study
modules/payguard-sms/        # native Android SMS bridge (dev builds only)
services/                    # PayGuardNetworkClient, PayGuardThreatStream, payGuardLocalNotifier
store/                       # Zustand — payGuardSessionStore, payGuardLedgerStore, threatIntelligenceStore
types/payGuardModels.ts      # TS contracts aligned with the FastAPI schemas
constants/payGuardTheme.ts   # brand design tokens
hooks/usePayGuardThreatStream.ts   # WS → ledger + notifications lifecycle
```

## Getting started

Prerequisites: **Node.js 20+**, **npm**, and the **Expo Go** app (or a dev build for the SMS bridge).

```powershell
cd src\paygraud\mobile
npm install
npx expo start        # scan the QR with Expo Go
```

Run directly against a specific platform: `npm run android` · `npm run ios` · `npm run web`.

### Connecting to the backend

The app resolves both REST and WebSocket URLs from one source (`constants/apiConfig.ts`):

- **Default** (emulator-friendly): `http://localhost:8001`.
- **Physical device**: a device can't reach `localhost`, so point the app at a public tunnel:

```powershell
ngrok http 8001
$env:EXPO_PUBLIC_NGROK_URL="https://your-tunnel.ngrok-free.app"
npx expo start
```

The backend CORS policy already allows `https://*.ngrok-free.app`; HTTPS is also required for the biometric APIs.

### Demo account

`demo@payguard.io` / `Payguard@123` — used by the login/register demo buttons (single source of truth in `constants/apiConfig.ts`).

## Live case study

Open **`/secure-transfer/pg-case-study`** from Signal Lab or Threat Center for a guided replay of two attacks:

1. **Phishing SMS** — the spoofed `VM-HDFCBK` message, copied to the clipboard, then analyzed in Signal Lab.
2. **Fake UPI invoice QR** — the `Invoice Desk LLC` payload scanned in Threat Center → rejected, recipient blacklisted, attempt blocked.

## Real SMS interception (Tier B — dev build)

Expo Go cannot load native modules. To capture actual incoming SMS on Android, use a dev build:

```powershell
npx expo prebuild --platform android
npx expo run:android
```

Then open Signal Lab and send an SMS — the receiver triggers `onSmsReceived` and the screen auto-analyzes it. `expo-dev-client` is already a dependency.

> [!CAUTION]
> `READ_SMS` is a restricted Play Store permission. The module is PoC/demo scope only.

## Contributing

See the repo-level [AGENTS.md](../../../AGENTS.md) — work for this directory lands on the `mobile` branch, keep commits **≤100 LOC**, and run `npx tsc --noEmit` in this package before submitting.

## License

[MIT](../../../LICENSE)