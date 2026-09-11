"use client";

import { RefreshCw } from "lucide-react";

import type { Payment } from "@/lib/types";

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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}