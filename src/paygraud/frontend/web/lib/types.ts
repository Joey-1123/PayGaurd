export interface Payment {
  id: string;
  recipient_id: string | null;
  amount: number;
  currency: string;
  description: string | null;
  status: string;
  risk_score: number | null;
  risk_level: string | null;
  confidence: number | null;
  recommendation: string | null;
  human_confirmed: boolean;
  gateway_reference: string | null;
  created_at: string;
}

export interface Alert {
  id: string;
  payment_id: string | null;
  alert_type: string;
  severity: string;
  risk_score: number;
  title: string | null;
  description: string | null;
  status: string;
  created_at: string;
}

export interface TraceEvent {
  node: string;
  status: string;
  latency_ms: number;
  score: number | null;
  summary: string;
}

export interface PipelineNodeRun {
  paymentId: string;
  node: string;
  status: string;
  score: number | null;
  latencyMs: number;
  summary: string;
}

export interface PipelineNode {
  id: string;
  label: string;
}

export interface PipelineEdge {
  source: string;
  target: string;
}

export interface PipelineSnapshot {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  mermaid: string;
  last_run: { payment_id: string; trace: TraceEvent[] } | null;
}

export interface Scenario {
  id: string;
  name: string;
  recipientName: string;
  amount: number;
  description: string;
  note: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "salary",
    name: "John Carter — Salary",
    recipientName: "John Carter",
    amount: 8000,
    description: "Salary transfer",
    note: "Verified beneficiary, recurring",
  },
  {
    id: "booking",
    name: "Blue Lotus Events",
    recipientName: "Blue Lotus Events",
    amount: 25000,
    description: "Booking deposit",
    note: "New unverified beneficiary",
  },
  {
    id: "twofa",
    name: "Customer Care 2FA",
    recipientName: "Customer Care 2FA",
    amount: 1800,
    description: "Card verification fee",
    note: "Impersonation + urgency cues",
  },
  {
    id: "invoice",
    name: "Invoice Desk",
    recipientName: "Invoice Desk",
    amount: 200000,
    description: "Pending invoice settlement",
    note: "Critical amount to unknown",
  },
];