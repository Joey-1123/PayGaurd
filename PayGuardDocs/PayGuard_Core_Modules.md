# PayGuard - Core Modules, Classes, and Functions

This document outlines the strict, domain-specific naming conventions for the internal classes, types, and functions used in the PayGuard application.

## 1. Core Data Models (`types/payGuardModels.ts`)

```typescript
// Replaces generic "user.ts"
export interface PayGuardIdentity {
  pgId: string;
  fullName: string;
  emailAddress: string;
  bioAuthEnabled: boolean;
  trustScore: number;
  createdAt: string;
}

// Replaces generic "payment.ts"
export interface PayGuardSecureTransfer {
  transferId: string;
  beneficiaryId: string;
  beneficiaryName: string;
  amount: number;
  currencyCode: string;
  transferStatus: 'COMPLETED' | 'PENDING_ANALYSIS' | 'BLOCKED_BY_SHIELD' | 'FLAGGED';
  riskAssessmentScore: number; // 0 to 100
  initiatedAt: string;
}

// Replaces generic "alert.ts"
export interface PayGuardThreatAlert {
  alertId: string;
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  threatCategory: 'FRAUD_RING_DETECTED' | 'UNUSUAL_LOCATION' | 'VELOCITY_SPIKE';
  description: string;
  requiresAction: boolean;
  issuedAt: string;
}
```

## 2. API & Network Services (`services/`)

### `PayGuardNetworkClient.ts` (Replaces `api.ts`)
```typescript
class PayGuardNetworkClient {
  private static instance: AxiosInstance;

  static async initiateSecureTransfer(intent: SecurePaymentIntent): Promise<PayGuardSecureTransfer> {
    // Implementation
  }

  static async fetchThreatTelemetry(): Promise<PayGuardThreatAlert[]> {
    // Implementation
  }
}
```

### `PayGuardThreatStream.ts` (Replaces `socket.ts`)
```typescript
class PayGuardThreatStream {
  static connectToShieldEngine() {
    // Initializes socket.io connection to threat-stream.payguard.app
  }

  static listenForLiveRiskUpdates(callback: (riskData: RiskAssessmentResult) => void) {
    // Listens for 'RISK_SCORE_UPDATED' events
  }
}
```

### `PayGuardBioAuthEngine.ts` (Replaces `biometrics.ts`)
```typescript
export const verifyWithPayGuardBioAuth = async (transferAmount: number): Promise<boolean> => {
    // Invokes expo-local-authentication
    // Custom prompt: "PayGuard requires FaceID to secure this $${transferAmount} transfer."
}
```

## 3. Zustand Stores (`store/`)

### `payGuardSessionStore.ts`
```typescript
export const usePayGuardSession = create<PayGuardSessionState>((set) => ({
  activeIdentity: null,
  isAuthenticated: false,
  authenticateIdentity: (identity: PayGuardIdentity) => set({ activeIdentity: identity, isAuthenticated: true }),
  purgeSession: () => set({ activeIdentity: null, isAuthenticated: false }),
}));
```

### `payGuardThreatStore.ts`
```typescript
export const usePayGuardThreats = create<PayGuardThreatState>((set) => ({
  activeAlerts: [],
  currentRiskScore: 0,
  dismissThreat: (alertId: string) => // logic to remove alert
  blockThreatSource: (alertId: string) => // logic to add to blocklist
}));
```

## 4. Utility Functions (`utils/`)

### `payGuardFormatters.ts`
```typescript
export const formatPayGuardCurrency = (amount: number, currency: string): string => { ... }
export const maskBeneficiaryAccount = (accountNumber: string): string => { ... }
```

### `payGuardRiskEvaluator.ts` (Replaces `validators.ts`)
```typescript
export const calculateLocalRiskHeuristics = (transfer: Partial<PayGuardSecureTransfer>): number => {
    // Evaluates amount vs typical user behavior on the client side before sending to backend
}

export const getThreatColorBadge = (score: number): string => {
    if (score > 80) return 'PAYGUARD_RED_CRITICAL';
    if (score > 50) return 'PAYGUARD_ORANGE_WARN';
    return 'PAYGUARD_GREEN_SAFE';
}
```
