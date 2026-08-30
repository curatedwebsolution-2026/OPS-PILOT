"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PlayCircle, Clock, CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert } from "lucide-react";
import { api } from "../../lib/api";
import { formatDate, getRiskColor } from "../../lib/utils";

export default function ExecutionsPage() {
  const { data: executions, isLoading } = useQuery({
    queryKey: ["executions"],
    queryFn: () => api.listExecutions(),
    refetchInterval: 5000,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading Execution Ledger...</div>;
  }

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <PlayCircle className="h-6 w-6 text-blue-400" />
            <span>Workflow Executions</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Real-time execution log, step-by-step timeline nodes, risk evaluations, and execution durations.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3.5">Execution ID</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Risk Level</th>
              <th className="px-6 py-3.5">Duration</th>
              <th className="px-6 py-3.5">Started At</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-200">
            {executions?.map((exec) => (
              <tr key={exec.id} className="hover:bg-slate-850/50 transition-colors">
                <td className="px-6 py-4 font-mono text-slate-300">
                  {exec.id.substring(0, 8)}...
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                    exec.status === "completed"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : exec.status === "pending_approval"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : exec.status === "failed" || exec.status === "rejected"
                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                      : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  }`}>
                    <span>{exec.status.replace("_", " ")}</span>
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${getRiskColor(exec.risk_level)}`}>
                    {exec.risk_level}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-slate-400">
                  {exec.execution_time_ms ? `${exec.execution_time_ms} ms` : "In Progress"}
                </td>
                <td className="px-6 py-4 text-slate-400">
                  {formatDate(exec.started_at)}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/executions/${exec.id}`}
                    className="inline-flex items-center space-x-1 font-semibold text-blue-400 hover:underline"
                  >
                    <span>View Timeline</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
