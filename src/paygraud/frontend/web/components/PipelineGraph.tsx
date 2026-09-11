"use client";

import { useEffect, useRef, useState } from "react";
import type { TraceEvent } from "@/lib/types";

interface Props {
  mermaid: string;
  trace?: TraceEvent[];
}

function nodeStatuses(trace: TraceEvent[]): Record<string, string> {
  const lookup: Record<string, string> = {};
  for (const event of trace) {
    if (event.node.includes("start") || event.node.includes("end")) continue;
    const level = event.summary?.includes("critical") ? "danger"
      : event.summary?.includes("high") ? "danger"
      : event.summary?.includes("medium") ? "warn"
      : event.summary?.includes("low") || event.summary?.includes("HUMAN_VERIFY") || event.summary?.includes("HUMAN_CONFIRM") ? "ok"
      : event.summary?.includes("skip") ? "skip"
      : "pending";
    lookup[event.node] = level;
  }
  return lookup;
}

function buildRenderableMermaid(source: string, statuses: Record<string, string>): string {
  const lines: string[] = [];
  for (const line of source.split("\n")) lines.push(line);
  lines.push("");
  lines.push("classDef pgn-ok fill:#00FF66,color:#000");
  lines.push("classDef pgn-warn fill:#FFB800,color:#000");
  lines.push("classDef pgn-danger fill:#FF2A2A,color:#fff");
  lines.push("classDef pgn-skip fill:#222,color:#888");
  lines.push("classDef pgn-pending fill:#111,color:#555");
  for (const [nodeId, status] of Object.entries(statuses)) {
    lines.push(`class ${nodeId} pgn-${status}`);
  }
  return lines.join("\n");
}

function LoadFallback() {
  return <p className="label py-8 text-center">Graph renders client-side only</p>;
}

export default function PipelineGraph({ mermaid, trace }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    (async () => {
      const mermaidLib = (await import("mermaid")).default;
      mermaidLib.initialize({
        startOnLoad: false,
        theme: "dark",
        themeVariables: {
          primaryColor: "#0E0E0E",
          lineColor: "#333",
          textColor: "#FFF",
          fontFamily: "system-ui, sans-serif",
        },
      });

      const statuses = trace ? nodeStatuses(trace) : {};
      const src = buildRenderableMermaid(mermaid, statuses);
      if (cancelled) return;
      containerRef.current!.innerHTML = "";

      try {
        const { svg } = await mermaidLib.render("pg-graph", src);
        containerRef.current!.innerHTML = svg;
      } catch (err) {
        if (!cancelled) setError(String(err));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mermaid, trace]);

  return (
    <div className="relative overflow-hidden rounded-card border border-line bg-card">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="label">Pipeline graph</span>
      </div>

      {error && <p className="p-4 text-xs text-danger">{error}</p>}

      <div className="p-4">
        {mermaid
          ? <div ref={containerRef} className="overflow-x-auto" />
          : <LoadFallback />}
      </div>
    </div>
  );
}