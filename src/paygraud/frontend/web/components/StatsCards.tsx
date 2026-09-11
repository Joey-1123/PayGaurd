"use client";

import { AlertTriangle, CheckCircle2, ShieldAlert, Timer } from "lucide-react";

import type { Payment } from "@/lib/types";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="card p-4">
      <p className="font-mono text-2xl font-bold tracking-tight text-ink">{value}</p>
      <p className="label mt-1">{label}</p>
    </div>
  );
}

export default function StatsCards({ payments }: { payments: Payment[] }) {
  const completed = payments.filter((p) => p.status === "completed" || p.status === "COMPLETED").length;
  const awaiting = payments.filter((p) => p.status.includes("awaiting")).length;
  const blocked = payments.filter((p) => p.status.includes("block")).length;
  const highest = payments
    .filter((p) => p.risk_score != null)
    .sort((a, b) => (b.risk_score ?? 0) - (a.risk_score ?? 0))[0];

  const riskColor = highest == null || (highest.risk_score ?? 0) < 60
    ? "text-safe"
    : (highest.risk_score ?? 0) < 85
      ? "text-warn"
      : "text-danger";

  const icons = {
    completed: <CheckCircle2 size={16} className="text-safe" />,
    awaiting: <Timer size={16} className="text-warn" />,
    blocked: <AlertTriangle size={16} className="text-danger" />,
  };

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <p className="label">Shield verdict</p>{icons.completed}
        </div>
        {highest ? (
          <p className={`mt-2 font-mono text-xl font-bold ${riskColor}`}>
            {highest.risk_score?.toFixed(1)}
          </p>
        ) : (
          <p className="mt-2 font-mono text-xl font-bold text-ink">—</p>
        )}
        <p className="text-[11px] text-faint">{highest ? "max risk score" : "run a scenario"}</p>
      </div>
      <Stat value={String(completed)} label="Completed" />
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <p className="label">Needs review</p>{icons.awaiting}
        </div>
        <p className="mt-2 font-mono text-xl font-bold text-ink">{awaiting}</p>
        <p className="text-[11px] text-faint">awaiting confirmation</p>
      </div>
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <p className="label">Blocked</p>{icons.blocked}
        </div>
        <p className="mt-2 flex items-center gap-2 font-mono text-xl font-bold text-danger">
          {blocked}<ShieldAlert size={18} />
        </p>
        <p className="text-[11px] text-faint">stopped before authorize</p>
      </div>
    </div>
  );
}