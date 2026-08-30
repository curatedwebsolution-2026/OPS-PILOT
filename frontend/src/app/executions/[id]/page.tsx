"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Cpu, Code2, ChevronDown, ChevronRight } from "lucide-react";
import { api } from "../../../lib/api";
import { WorkflowExecution } from "../../../types";
import { formatDate, getRiskColor } from "../../../lib/utils";

export default function ExecutionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [execution, setExecution] = useState<WorkflowExecution | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadDetail() {
      try {
        const data = await api.getExecution(id);
        setExecution(data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  const toggleNodeExpand = (nodeId: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading Execution Timeline...</div>;
  }

  if (!execution) {
    return <div className="p-8 text-center text-xs text-red-400">Execution not found.</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push("/executions")}
            className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white">Execution Timeline</h1>
              <span className="font-mono text-xs text-slate-400">({execution.id})</span>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">
              Started at {formatDate(execution.started_at)} • Total duration: <strong>{execution.execution_time_ms} ms</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className={`rounded border px-2.5 py-1 text-xs font-bold uppercase ${getRiskColor(execution.risk_level)}`}>
            Risk: {execution.risk_level}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
            execution.status === "completed"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : execution.status === "pending_approval"
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}>
            {execution.status.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Execution Timeline Stepper */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-6">
        <h2 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
          <Clock className="h-4 w-4 text-blue-400" />
          <span>Real-time Node Execution Trace</span>
        </h2>

        <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
          {execution.timeline_nodes?.map((node, index) => {
            const isExpanded = expandedNodes[node.id];
            const offsetSec = (index + 1).toString().padStart(2, "0");

            return (
              <div key={node.id} className="relative group">
                {/* Timeline Dot */}
                <div className={`absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-slate-950 ${
                  node.status === "completed"
                    ? "bg-emerald-500"
                    : node.status === "pending_approval"
                    ? "bg-amber-500 ring-4 ring-amber-500/20"
                    : node.status === "failed"
                    ? "bg-red-500"
                    : "bg-blue-500 animate-pulse"
                }`} />

                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 hover:border-slate-700 transition-colors">
                  
                  {/* Node Header Bar */}
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleNodeExpand(node.id)}>
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-xs text-blue-400 font-semibold">00:{offsetSec}</span>
                      <span className="text-xs font-bold text-slate-100">{node.node_label}</span>
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                        {node.node_type}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-[11px] font-mono text-slate-500">{node.duration_ms} ms</span>
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        node.status === "completed" ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"
                      }`}>
                        {node.status}
                      </span>
                      {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded JSON Inspector */}
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3 text-xs">
                      {node.input_data && (
                        <div>
                          <span className="font-semibold text-slate-400">Input Data:</span>
                          <pre className="mt-1 rounded bg-slate-900 p-2.5 font-mono text-[11px] text-slate-300 overflow-x-auto">
                            {JSON.stringify(node.input_data, null, 2)}
                          </pre>
                        </div>
                      )}

                      {node.output_data && (
                        <div>
                          <span className="font-semibold text-slate-400">Output Data:</span>
                          <pre className="mt-1 rounded bg-slate-900 p-2.5 font-mono text-[11px] text-blue-300 overflow-x-auto">
                            {JSON.stringify(node.output_data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
