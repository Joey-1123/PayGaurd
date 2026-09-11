# PayGuard - Frontend Architecture

## 1. Architectural Pattern
PayGuard follows a modular, feature-first frontend architecture using React Native and Expo Router. The application relies heavily on Zustand for global state management and custom React hooks to isolate business logic (like risk evaluation and cryptographic verification) from the UI components.

## 2. Directory Structure (PayGuard Specific)

```
mobile/
├── app/
│   ├── _layout.tsx                             # PayGuardRootLayout
│   ├── (auth)/
│   │   ├── _layout.tsx                         # PayGuardAuthStack
│   │   ├── pg-login.tsx                        # Login credentials screen
│   │   └── pg-register.tsx                     # Account creation screen
│   ├── (tabs)/
│   │   ├── _layout.tsx                         # PayGuardMainTabs
│   │   ├── pg-dashboard.tsx                    # Home / Dashboard
│   │   ├── pg-ledger.tsx                       # Payment history / Ledger
│   │   ├── pg-threat-center.tsx                # Security alerts
│   │   └── pg-preferences.tsx                  # Settings & Config
│   └── secure-transfer/
│       ├── pg-initiate.tsx                     # New payment initiation
│       └── [transactionId].tsx                 # Specific transaction details
│
├── components/
│   ├── core/                                   # Highly reusable UI elements
│   │   ├── PayGuardButton.tsx
│   │   ├── PayGuardShieldCard.tsx
│   │   ├── PayGuardSecureInput.tsx
│   │   └── PayGuardAvatar.tsx
│   ├── transfer/                               # Payment specific components
│   │   ├── PayGuardTransactionLedgerItem.tsx
│   │   ├── PayGuardTransferForm.tsx
│   │   ├── CurrencyAmountDial.tsx
│   │   └── BeneficiarySelector.tsx
│   ├── threat-intelligence/                    # Security/Risk components
│   │   ├── PayGuardRiskMeter.tsx               # Circular risk score progress
│   │   ├── ThreatAlertCard.tsx
│   │   ├── SecurityShieldBanner.tsx
│   │   └── BioAuthVerificationModal.tsx
│   └── dashboard/                              # Home screen specific
│       ├── PayGuardTelemetryGrid.tsx           # Stats grid
│       └── RecentActivityFeed.tsx
│
├── hooks/
│   ├── usePayGuardSession.ts                   # Auth logic
│   ├── usePayGuardLedger.ts                    # Transactions logic
│   ├── useThreatIntelligence.ts                # Alerts logic
│   ├── usePayGuardThreatStream.ts              # WebSocket logic
│   └── usePayGuardBioAuth.ts                   # Biometrics logic
```

## 3. State Management (Zustand)
PayGuard uses decentralized Zustand stores categorized by domain:
*   **`payGuardSessionStore.ts`**: Manages JWTs, user profiles, and session timeouts.
*   **`payGuardLedgerStore.ts`**: Caches recent transactions, handles optimistic UI updates for payments.
*   **`threatIntelligenceStore.ts`**: Maintains the list of active security alerts and the overall account risk score.

## 4. Real-Time Data Flow
PayGuard requires real-time risk assessment. When a user is typing a recipient's name in `pg-initiate.tsx`, a debounced function calls `PayGuardRiskEngine.evaluate()` via WebSocket (`usePayGuardThreatStream`), updating the `PayGuardRiskMeter` component dynamically without blocking the main JS thread.

## 5. Navigation & Security Guards
Expo Router is utilized. The `(auth)` stack is completely detached from the `(tabs)` stack.
A root-level `PayGuardShieldProvider` wraps the application. If `usePayGuardSession` detects an expired token or a critical account lock, it immediately forces a redirect to the `pg-login` screen, purging sensitive data from memory.
