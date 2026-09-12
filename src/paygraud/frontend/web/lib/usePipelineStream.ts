import { useDashboardStore } from "@/store/dashboardStore";
import { usePaymentAlerts } from "@/lib/useAlerts";
import type { PipelineNodeRun } from "@/lib/types";

export function usePipelineStream(onOther: (type: string, data: unknown) => void): void {
  usePaymentAlerts((type, data) => {
    if (type === "pipeline_node") {
      const frame = data as PipelineNodeRun;
      if (frame?.paymentId) useDashboardStore.getState().pushNodeRun(frame);
      return;
    }
    onOther(type, data);
  });
}