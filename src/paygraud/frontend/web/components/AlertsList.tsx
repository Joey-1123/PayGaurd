"use client";

import { Siren } from "lucide-react";

import type { Alert } from "@/lib/types";

function SeverityChip({ severity }: { severity: string }) {
  const color = severity.includes("CRIT") || severity.includes("HIGH")
    ? "danger"
    : severity.includes("MED")
      ? "warn"
      : "pending";
  return <span className={`chip border-${color} text-${color}`}>{severity}</span>;
}

export default function AlertsList({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) {
    return (
      <div className="card p-6 text-center">
        <Siren size={20} className="mx-auto text-faint" />
        <p className="mt-2 text-sm text-soft">No live alerts yet</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <Siren size={13} className="text-danger" />
        <span className="label">Active alerts</span>
      </div>
      <div className="max-h-[420px] overflow-y-auto">
        <ul className="divide-y divide-line">
          {alerts.map((alert) => (
            <li key={alert.id} className="px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm text-ink">{alert.title ?? "Alert"}</p>
                <SeverityChip severity={alert.severity} />
              </div>
              {alert.description && (
                <p className="mt-1 line-clamp-2 text-xs text-soft">{alert.description}</p>
              )}
              <p className="mt-1 text-[11px] text-faint">
                {alert.alert_type} · score {alert.risk_score.toFixed(1)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}