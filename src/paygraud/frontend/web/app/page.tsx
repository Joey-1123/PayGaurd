"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import { useDashboardStore } from "@/store/dashboardStore";
import { usePaymentAlerts } from "@/lib/useAlerts";
import { fetchPipeline } from "@/lib/api";

import StatsCards from "@/components/StatsCards";
import PipelineGraph from "@/components/PipelineGraph";
import ScenarioRunner from "@/components/ScenarioRunner";
import PaymentsTable from "@/components/PaymentsTable";
import AlertsList from "@/components/AlertsList";

export default function DashboardPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { payments, alerts, pipeline, refresh, setPipeline } = useDashboardStore();

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }
    (async () => {
      setPipeline(await fetchPipeline());
      await refresh();
    })();
  }, [token]);

  usePaymentAlerts((type) => {
    if (type === "alert_new" || type === "payment_status_changed") {
      refresh();
    }
  });

  if (!token) return null;

  return (
    <div className="mx-auto max-w-[1320px] space-y-6 px-4 py-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">PayGuard</h1>
          <p className="label mt-0.5">Fraud detection dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-soft">{user}</span>
          <button
            onClick={() => { logout(); router.replace("/login"); }}
            className="btn-ghost gap-1 text-xs"
          >
            <LogOut size={14} />Sign out
          </button>
        </div>
      </header>

      <StatsCards payments={payments} />

      <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
        <div className="space-y-6">
          <PipelineGraph
            mermaid={pipeline?.mermaid ?? ""}
            trace={pipeline?.last_run?.trace}
          />
          <PaymentsTable payments={payments} />
        </div>
        <div className="space-y-6">
          <ScenarioRunner />
          <AlertsList alerts={alerts} />
        </div>
      </div>
    </div>
  );
}