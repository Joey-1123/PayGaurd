"use client";

import { Play } from "lucide-react";

import { SCENARIOS } from "@/lib/types";
import { useDashboardStore } from "@/store/dashboardStore";

export default function ScenarioRunner() {
  const { run, runScenario } = useDashboardStore();
  const busy = run.status !== "idle" && run.status !== "done" && run.status !== "error";

  return (
    <div className="space-y-3">
      <span className="label">Scenario runner</span>

      <div className="grid gap-3 sm:grid-cols-2">
        {SCENARIOS.map((scenario) => {
          const isRunning = busy && run.scenarioId === scenario.id;
          const isCompleted = run.status === "done" && run.scenarioId === scenario.id;

          return (
            <button
              key={scenario.id}
              onClick={() => runScenario(scenario.id, scenario.amount, scenario.description)}
              disabled={busy}
              className="flex flex-col gap-2 rounded-card border border-line bg-card p-4 text-left transition hover:border-ink/40 disabled:opacity-60"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">{scenario.name}</span>
                <span className={`chip ${isCompleted ? "border-safe bg-safe/10 text-safe" : "border-line"}`}>
                  ₹{scenario.amount.toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-xs text-soft">{scenario.note}</p>
              {isRunning && <p className="text-xs text-soft animate-pulse">Running…</p>}
              {isCompleted && <p className="text-xs text-safe">Done: {run.message}</p>}
              {!isRunning && !isCompleted && (
                <span className="mt-auto self-end text-faint">
                  <Play size={14} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {run.trace.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-card border border-line bg-card">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-line text-left text-faint">
                <th className="px-3 py-2">Node</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">Latency</th>
                <th className="px-3 py-2">Summary</th>
              </tr>
            </thead>
            <tbody>
              {run.trace.map((event, index) => (
                <tr key={index} className="border-b border-line last:border-0">
                  <td className="px-3 py-1.5 font-mono text-ink">{event.node}</td>
                  <td className="px-3 py-1.5 text-soft">{event.status}</td>
                  <td className="px-3 py-1.5 font-mono text-ink">
                    {event.score != null ? event.score.toFixed(1) : "—"}
                  </td>
                  <td className="px-3 py-1.5 text-soft">{event.latency_ms}ms</td>
                  <td className="px-3 py-1.5 text-soft">{event.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}