"use client";

import { useMemo, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { X } from "lucide-react";

import "@xyflow/react/dist/style.css";

import type { PipelineEdge, PipelineNode, PipelineNodeRun, TraceEvent } from "@/lib/types";

interface Props {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  live: Record<string, PipelineNodeRun>;
  settled: boolean;
  lastTrace?: TraceEvent[];
}

const STATUS_COLOR: Record<string, string> = {
  ok: "#00FF66",
  warn: "#FFB800",
  danger: "#FF2A2A",
  pending: "#8E8E93",
  skipped: "#3A3A3A",
};

type Vis = {
  status: string;
  score: number | null;
  latencyMs: number;
  summary: string;
  live: boolean;
};

type FlowData = Vis & { id: string; label: string; pretty: string; selected: boolean };
type FlowNode = Node<FlowData>;

function guessStatus(summary: string, score: number | null): string {
  if (score != null) return score <= 30 ? "ok" : score <= 60 ? "warn" : "danger";
  const s = summary.toLowerCase();
  if (s.includes("critical") || s.includes("block")) return "danger";
  if (s.includes("high") || s.includes("verify")) return "warn";
  return "ok";
}

function PipelineNodeCard({ data }: NodeProps<FlowNode>) {
  const color = data.status === "skipped" ? STATUS_COLOR.skipped : STATUS_COLOR[data.status] ?? "#8E8E93";
  const dim = data.status === "skipped";

  return (
    <div
      className="w-44 rounded-card border bg-[#0E0E0E] px-3 py-2"
      style={{
        borderColor: data.selected ? color : "rgba(255,255,255,0.12)",
        boxShadow: data.selected ? `0 0 0 1px ${color}` : dim ? "none" : `0 0 18px ${color}22`,
        opacity: dim ? 0.4 : 1,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-mono text-[11px] text-ink">{data.label}</span>
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: dim ? "#3A3A3A" : color }} />
      </div>
      <div className="mt-1 flex items-center justify-between text-[10px] text-soft">
        <span className="rounded-full px-1.5 capitalize" style={{ color }}>{data.status}</span>
        <span className="font-mono">{data.score != null ? data.score.toFixed(1) : "—"}</span>
      </div>
      <p className="mt-1 line-clamp-2 text-[10px] text-faint">{data.summary}</p>
    </div>
  );
}

export default function PipelineGraph({ nodes, edges, live, settled, lastTrace }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const nodeTypes = useMemo(() => ({ pipeline: PipelineNodeCard }), []);

  const { flowNodes, flowEdges, selectedData } = useMemo(() => {
    const kept = nodes.filter((n) => !n.id.startsWith("__"));
    const keptIds = new Set(kept.map((n) => n.id));
    const keptEdges = edges.filter((e) => keptIds.has(e.source) && keptIds.has(e.target));

    const liveKeys = Object.keys(live);
    const vis: Record<string, Vis> = {};
    for (const id of liveKeys) {
      const r = live[id];
      vis[id] = { status: r.status, score: r.score, latencyMs: r.latencyMs, summary: r.summary, live: true };
    }
    if (liveKeys.length === 0 && lastTrace?.length) {
      for (const t of lastTrace) {
        vis[t.node] = {
          status: guessStatus(t.summary, t.score),
          score: t.score,
          latencyMs: t.latency_ms,
          summary: t.summary,
          live: false,
        };
      }
    }

    const depth: Record<string, number> = {};
    for (const n of kept) depth[n.id] = 0;
    for (let pass = 0; pass < kept.length; pass++) {
      let changed = false;
      for (const e of keptEdges) {
        const candidate = (depth[e.source] ?? 0) + 1;
        if (candidate > (depth[e.target] ?? 0)) {
          depth[e.target] = candidate;
          changed = true;
        }
      }
      if (!changed) break;
    }
    const columns: Record<number, string[]> = {};
    for (const n of kept) (columns[depth[n.id] ?? 0] ??= []).push(n.id);
    const position: Record<string, { x: number; y: number }> = {};
    for (const [col, ids] of Object.entries(columns)) {
      ids.forEach((id, index) => {
        position[id] = { x: 48 + Number(col) * 240, y: 24 + index * 120 };
      });
    }

    const flowNodes: FlowNode[] = kept.map((n) => {
      const v = vis[n.id];
      const status = v?.status ?? (!settled ? "pending" : "skipped");
      return {
        id: n.id,
        type: "pipeline",
        position: position[n.id] ?? { x: 0, y: 0 },
        data: {
          id: n.id,
          label: n.id,
          pretty: n.label.replace(/_/g, " "),
          status,
          score: v?.score ?? null,
          latencyMs: v?.latencyMs ?? 0,
          summary: v?.summary ?? n.label.replace(/_/g, " "),
          live: v?.live ?? false,
          selected: selectedId === n.id,
        },
      };
    });

    const flowEdges: Edge[] = keptEdges.map((e, index) => {
      const liveTarget = vis[e.target]?.live;
      return {
        id: `edge-${index}`,
        source: e.source,
        target: e.target,
        animated: Boolean(liveTarget),
        style: liveTarget
          ? { stroke: "#00FF66", strokeOpacity: 0.4 }
          : { stroke: "#3A3A3A", strokeOpacity: vis[e.target] ? 0.9 : 0.25 },
      };
    });

    return {
      flowNodes,
      flowEdges,
      selectedData: selectedId ? (vis[selectedId] ?? null) : null,
    };
  }, [nodes, edges, live, settled, lastTrace, selectedId]);

  const selectedLabel = flowNodes.find((n) => n.id === selectedId)?.data.pretty ?? selectedId;

  return (
    <div className="relative overflow-hidden rounded-card border border-line bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="label">Pipeline graph</span>
          <span className="chip text-faint">live</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-faint">
          {(["ok", "warn", "danger", "pending", "skipped"] as const).map((s) => (
            <span key={s} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLOR[s] }} />
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="relative">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          onNodeClick={(_event, node) => setSelectedId(node.id)}
          onPaneClick={() => setSelectedId(null)}
          colorMode="dark"
          className="h-[380px]"
          fitView
          minZoom={0.4}
          maxZoom={1.6}
          nodesDraggable={false}
        >
          <Background color="#222222" gap={28} />
          <MiniMap pannable zoomable className="!bg-base" />
          <Controls showInteractive={false} />
        </ReactFlow>

        {selectedData && (
          <div className="absolute right-3 top-3 z-10 w-64 rounded-card border border-line bg-[#0A0A0A]/95 p-3 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-ink">{selectedLabel}</span>
              <button
                onClick={() => setSelectedId(null)}
                className="text-faint transition hover:text-ink"
                aria-label="Close node details"
              >
                <X size={14} />
              </button>
            </div>
            <div className="mt-2 space-y-1.5 text-xs text-soft">
              <div className="flex justify-between">
                <span>Status</span>
                <span className="font-mono capitalize" style={{ color: STATUS_COLOR[selectedData.status] ?? "#FFF" }}>
                  {selectedData.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Score</span>
                <span className="font-mono text-ink">{selectedData.score != null ? selectedData.score.toFixed(1) : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Latency</span>
                <span className="font-mono text-ink">{selectedData.latencyMs}ms</span>
              </div>
              <p className="pt-1 text-[11px] leading-relaxed text-faint">{selectedData.summary}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}