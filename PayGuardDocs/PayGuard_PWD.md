# PayGuard - Project Working Document (PWD)

## 1. Project Overview
This document outlines the operational, technical, and logistical specifications for the PayGuard mobile application project.

## 2. Technology Stack
*   **Framework:** React Native + Expo SDK 50+
*   **Language:** TypeScript 5+
*   **Navigation:** React Navigation 6 (via Expo Router)
*   **UI Library:** React Native Paper (Customized to PayGuard Theme)
*   **State Management:** Zustand
*   **Form Handling:** React Hook Form + Zod (Strict Schema Validation)
*   **Networking:** Axios (REST) + Socket.io Client (Real-time Threat Feeds)
*   **Storage:** AsyncStorage (Encrypted where applicable)
*   **Hardware Access:** `expo-local-authentication` (PayGuard BioAuth)
*   **Notifications:** `expo-notifications`

## 3. Environment Configuration
Environment variables strictly map to PayGuard backend microservices.

```env
# PayGuard Environment Configuration
PAYGUARD_API_GATEWAY_URL=https://api.payguard.app/v1
PAYGUARD_THREAT_WEBSOCKET_URL=wss://threat-stream.payguard.app/ws
PAYGUARD_ENVIRONMENT=production
PAYGUARD_TIMEOUT_MS=10000
```

## 4. Build & Deployment Pipelines

### 4.1. Development
```bash
# Start PayGuard Metro Bundler
npx expo start

# Run PayGuard on simulators
npx expo run:ios
npx expo run:android
```

### 4.2. Production / EAS Build
```bash
# Build Android APK/AAB
eas build -p android --profile payguard_production

# Build iOS IPA
eas build -p ios --profile payguard_production
```

## 5. Push Notification Schema
PayGuard uses categorized push notifications to ensure users are aware of security events.

*   `PAYGUARD_CRITICAL_THREAT`: "High-risk payment detected to [recipient]. Action required."
*   `PAYGUARD_TRANSACTION_BLOCKED`: "PayGuard intercepted and blocked a transfer of $[amount]."
*   `PAYGUARD_SECURITY_UPDATE`: "New security alert requires your attention."
*   `PAYGUARD_TRUST_VERIFIED`: "Recipient [name] has been added to your Trusted List."

## 6. Deep Linking Configuration (`app.json`)
```json
{
  "expo": {
    "name": "PayGuard",
    "slug": "payguard-app",
    "scheme": "payguard",
    "plugins": [
      [
        "expo-local-authentication",
        {
          "faceIDPermission": "PayGuard needs Face ID to securely authorize your high-risk transactions."
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

## 7. App Store & Release Data
*   **App Name:** PayGuard - Secure Payments
*   **Bundle Identifier:** `com.payguard.mobile`
*   **Version Control:** Git (Feature branching: `feature/pg-risk-ui`, `bugfix/pg-auth-flow`)
