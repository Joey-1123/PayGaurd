"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

import type { Payment } from "@/lib/types";
import { blockPayment, confirmPayment } from "@/lib/api";
import { useDashboardStore } from "@/store/dashboardStore";

function StatusChip({ payment }: { payment: Payment }) {
  const color = payment.status.includes("COMPLETED") || payment.status.includes("completed")
    ? "safe"
    : payment.status.includes("BLOCKED") || payment.status.includes("blocked")
      ? "danger"
      : payment.status.includes("awaiting") || payment.status.includes("pending")
        ? "warn"
        : "pending";
  return (
    <span className={`chip border-${color} text-${color}`}>
      <span className={`size-1.5 rounded-full bg-${color}`} />
      {payment.status}
    </span>
  );
}

function RiskText({ payment }: { payment: Payment }) {
  if (payment.risk_level == null) return <span className="text-faint">—</span>;
  const color = payment.risk_level === "critical"
    ? "danger"
    : payment.risk_level === "high"
      ? "danger"
      : payment.risk_level === "medium"
        ? "warn"
        : "safe";
  return <span className={`font-mono text-${color}`}>{payment.risk_level.toUpperCase()}</span>;
}

function ConsentActions({ payment }: { payment: Payment }) {
  const refresh = useDashboardStore((s) => s.refresh);
  const [busy, setBusy] = useState<"confirm" | "block" | null>(null);

  if (payment.status !== "awaiting_confirmation") return <span className="text-faint">—</span>;

  const decide = async (action: "confirm" | "block") => {
    setBusy(action);
    try {
      await (action === "confirm" ? confirmPayment(payment.id) : blockPayment(payment.id));
      await refresh();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex gap-1.5">
      <button
        className="btn-ghost border-safe/30 px-2 py-1 text-[10px] text-safe"
        disabled={!!busy}
        onClick={() => void decide("confirm")}
      >
        Approve
      </button>
      <button
        className="btn-ghost border-danger/30 px-2 py-1 text-[10px] text-danger"
        disabled={!!busy}
        onClick={() => void decide("block")}
      >
        Block
      </button>
    </div>
  );
}

export default function PaymentsTable({ payments }: { payments: Payment[] }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <span className="label">Recent payments</span>
        <RefreshCw size={13} className="text-faint" />
      </div>
      <div className="max-h-[420px] overflow-y-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-line text-left text-faint">
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Risk</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Consent</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b border-line last:border-0">
                <td className="px-4 py-2 font-mono text-ink">
                  ₹{payment.amount.toLocaleString("en-IN")}
                </td>
                <td className="max-w-[220px] truncate px-4 py-2 text-soft">
                  {payment.description ?? "—"}
                </td>
                <td className="px-4 py-2"><RiskText payment={payment} /></td>
                <td className="px-4 py-2"><StatusChip payment={payment} /></td>
                <td className="px-4 py-2"><ConsentActions payment={payment} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}