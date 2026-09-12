# PayGuard 🛡️

**Agentic Guardian for Real-Time Payment Scam Interception**

[![Mobile](https://img.shields.io/badge/Mobile-Expo%20SDK%2057-blue.svg)](#) [![React Native](https://img.shields.io/badge/React%20Native-0.86.3-61DAFB.svg)](#) [![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6.svg)](#) [![License](https://img.shields.io/badge/License-MIT-green.svg)](#)

## 📖 Overview

The PayGuard mobile app is built with **Expo SDK 57**, **React Native 0.86.3**, and **TypeScript 6**. It serves as the primary user interface for initiating secure transfers, managing beneficiaries, and receiving real-time threat intelligence alerts.

## ✨ Features

- **Real-Time Threat Alerts:** Live WebSocket integration (`PayGuardThreatStream`) for instant scam interception.
- **AI-Powered Transfer Risk Analysis:** Evaluates transactions dynamically before authorization.
- **Biometric Authentication:** Secure local authentication via `PayGuardBioAuthEngine` (powered by `expo-local-authentication`).
- **SMS Interception & Scoring:** Dedicated `pg-signal-capture` screen for scanning and scoring SMS threats.
- **Payment Ledger & Beneficiary Management:** Comprehensive transaction history and recipient controls.

## 🏗️ Architecture

- **Framework:** Expo SDK 57 & React Native 0.86.3.
- **Routing:** `expo-router` for file-based navigation.
- **State Management:** Zustand 5. Stores include:
  - `payGuardSessionStore`: User session and authentication state.
  - `payGuardLedgerStore`: Transaction history and active transfers.
  - `threatIntelligenceStore`: Real-time threat data and alerts.
- **Networking:** Axios HTTP client wrapper (`PayGuardNetworkClient`) for all backend communications.
- **Type Safety:** Contracts mapped in `types/payGuardModels.ts`, perfectly aligned with FastAPI backend schemas.
- **Theming:** Centralized design tokens located in `constants/payGuardTheme.ts`.

## ✅ Prerequisites

- Node.js (v18+)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator (Windows/Mac)
- **ngrok** — required for physical device testing (routes device traffic to your local backend)

## 🚀 Installation

1. Navigate to the mobile directory:
   ```bash
   cd src/paygraud/mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## 🏃 Running

Start the Expo development server:

```bash
# Run for Android
npm run android

# Run for iOS
npm run ios

# Run for Web
npm run web
```

## 🌐 Connecting to the Backend (ngrok)

Physical devices **cannot reach `localhost`** — ngrok tunnels the FastAPI backend to a public HTTPS URL that both your phone and the WebSocket stream can access.

### Emulator / Simulator (no ngrok needed)

The app defaults to `http://localhost:8001` which works out-of-the-box with most emulators:

```ts
// constants/apiConfig.ts — default (no env var set)
const DEFAULT_BACKEND_URL = 'http://localhost:8001';
```

### Physical Device (ngrok required)

**1. Start ngrok on your backend port:**
```powershell
ngrok http 8000
# or with a static free domain:
ngrok http --domain=your-domain.ngrok-free.dev 8000
```

**2. Copy the forwarding URL** (e.g. `https://relative-reopen-subduing.ngrok-free.dev`)

**3. Set the env var before starting Expo:**
```powershell
# PowerShell
$env:EXPO_PUBLIC_NGROK_URL="https://your-domain.ngrok-free.dev"
npm run android   # or ios / web
```

The app derives both REST and WebSocket URLs from a single env var:
```ts
// REST  → https://your-domain.ngrok-free.dev/api/v1
export const API_BASE_URL = `${NGROK_BACKEND_URL}/api/v1`;

// WS    → wss://your-domain.ngrok-free.dev/api/v1/ws
export const WS_STREAM_URL = `${NGROK_BACKEND_URL.replace(/^http/, 'ws')}/api/v1/ws`;
```

> **Why ngrok and not a LAN IP?** ngrok provides HTTPS (required for biometric auth APIs on iOS/Android) and avoids CORS/network policy issues on real devices. The backend CORS config already whitelists `*.ngrok-free.app` and `*.ngrok-free.dev`.

### Demo Credentials

A shared demo account is baked into `constants/apiConfig.ts` for hackathon demo runs:
```ts
export const DEMO_CREDENTIALS = {
  emailAddress: 'demo@payguard.io',
  password: 'Payguard@123',
};
```


## 📂 Project Structure

```text
mobile/
├── app/                        # expo-router file-based routes
│   ├── (auth)/                 # Authentication group
│   │   ├── pg-welcome.tsx      # Onboarding / splash
│   │   ├── pg-login.tsx        # Login (biometric + credentials)
│   │   └── pg-register.tsx     # New user registration
│   ├── (tabs)/                 # Bottom-tab navigation
│   │   ├── pg-dashboard.tsx    # Telemetry & risk overview
│   │   ├── pg-ledger.tsx       # Transaction history
│   │   ├── pg-threat-center.tsx# Live alerts & threat feed
│   │   └── pg-preferences.tsx  # Settings & beneficiaries
│   └── secure-transfer/        # Transfer flows
│       ├── pg-initiate.tsx     # Start transfer + AI analysis
│       ├── [transactionId].tsx  # Transfer detail & status
│       └── pg-signal-capture.tsx # SMS scanner & scorer
├── assets/                     # Icons, splash, images
├── constants/
│   ├── apiConfig.ts            # EXPO_PUBLIC_NGROK_URL → API_BASE_URL + WS_STREAM_URL
│   └── payGuardTheme.ts        # Brand colors & design tokens
├── services/
│   ├── PayGuardNetworkClient.ts # Axios HTTP client (auth, payments, alerts, signals)
│   ├── PayGuardBioAuthEngine.ts # Biometric auth (expo-local-authentication)
│   └── PayGuardThreatStream.ts  # WebSocket client (real-time alerts via ngrok tunnel)
├── store/
│   ├── payGuardSessionStore.ts  # Auth identity & JWT
│   ├── payGuardLedgerStore.ts   # Payment ledger
│   └── threatIntelligenceStore.ts # Live threat state
├── types/
│   └── payGuardModels.ts       # TypeScript contracts aligned with FastAPI schemas
└── scripts/                    # Expo utility scripts
```

> **`@expo/ngrok`** is listed as a dev dependency — Expo uses it internally for `expo start --tunnel` mode, giving you an alternative to standalone ngrok CLI.


## 📱 Screen Reference

### Auth Group `(auth)`
- `pg-welcome`: Entry screen and onboarding.
- `pg-login`: User login via biometrics or fallback credentials.
- `pg-register`: New user registration.

### Tabs `(tabs)`
- `pg-dashboard`: Quick overview of balances and recent activity.
- `pg-ledger`: Detailed transaction history.
- `pg-threat-center`: Threat intelligence and active alerts.
- `pg-preferences`: Settings, theme, and beneficiary management.

### Secure Transfer `(secure-transfer)`
- `pg-initiate`: Start a new transfer with pre-authorization checks.
- `[transactionId]`: Transaction detail and status tracking.
- `pg-signal-capture`: SMS interception scanner.

## 🤝 Contributing

Contributions must adhere to the rules in `AGENTS.md`. Work for this package should land exclusively on the `mobile` branch. Keep commits focused (<100 LOC).

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](../../LICENSE) file for details.
