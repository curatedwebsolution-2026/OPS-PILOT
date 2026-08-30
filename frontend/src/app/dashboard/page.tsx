"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { 
  GitFork, 
  PlayCircle, 
  CheckSquare, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  Sparkles,
  ShieldCheck,
  Zap,
  BookOpen
} from "lucide-react";
import { api } from "../../lib/api";
import { formatDate } from "../../lib/utils";

export default function DashboardPage() {
  const [triggeringWf, setTriggeringWf] = useState<string | null>(null);
  const [triggerPayloadText, setTriggerPayloadText] = useState(
    '{\n  "request": "I was charged twice for my subscription. Transaction TXN-9941 for $49.00.",\n  "amount": 49.00,\n  "customer_email": "jane.doe@acme-corp.com"\n}'
  );
  const [executing, setExecuting] = useState(false);
  const [execMessage, setExecMessage] = useState("");

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.getDashboardStats(),
    refetchInterval: 5000,
  });

  const { data: workflows } = useQuery({
    queryKey: ["workflows"],
    queryFn: () => api.listWorkflows(),
  });

  const handleExecute = async (wfId: string) => {
    setExecuting(true);
    setExecMessage("");
    try {
      const payloadObj = JSON.parse(triggerPayloadText);
      const res = await api.executeWorkflow(wfId, payloadObj);
      setExecMessage(`Execution ${res.id.substring(0, 8)} started! Status: ${res.status.toUpperCase()}`);
      refetch();
    } catch (err: any) {
      setExecMessage(`Error: ${err.message}`);
    } finally {
      setExecuting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400 text-sm">
        Loading Operations Control Panel...
      </div>
    );
  }

  const successRate = stats && stats.executions_today > 0
    ? Math.round((stats.successful_executions / stats.executions_today) * 100)
    : 100;

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Operations Control Center</h1>
            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
              Live Engine
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Real-time monitoring of AI agents, RAG knowledge retrieval, human approval gates, and tool execution timeline.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/workflows/new"
            className="flex items-center space-x-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-500"
          >
            <GitFork className="h-4 w-4" />
            <span>Create Workflow</span>
          </Link>
          <Link
            href="/case-study"
            className="flex items-center space-x-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-400 hover:bg-blue-500/20"
          >
            <Sparkles className="h-4 w-4" />
            <span>CTO Case Study</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Total Workflows */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Workflows</span>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
              <GitFork className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{stats?.total_workflows || 0}</span>
            <span className="text-xs text-slate-400">({stats?.active_workflows || 0} active)</span>
          </div>
        </div>

        {/* Executions Today */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Executions Processed</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <PlayCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{stats?.executions_today || 0}</span>
            <span className="text-xs font-medium text-emerald-400">{successRate}% success rate</span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className={`rounded-xl border p-5 shadow-lg ${
          (stats?.pending_approvals || 0) > 0 
            ? "border-amber-500/40 bg-amber-500/5" 
            : "border-slate-800 bg-slate-900/60"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pending Approvals</span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
              <CheckSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-400">{stats?.pending_approvals || 0}</span>
            <Link href="/approvals" className="text-xs font-semibold text-amber-400 hover:underline flex items-center">
              <span>Review Queue</span>
              <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </Link>
          </div>
        </div>

        {/* Avg Execution Latency */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Avg Execution Time</span>
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-white">{stats?.avg_execution_time_ms || 240}</span>
            <span className="text-xs text-slate-400">ms / workflow</span>
          </div>
        </div>

      </div>

      {/* Workflow Library & Execution Trigger */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Active Workflows Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Zap className="h-4 w-4 text-blue-400" />
              <span>Configured AI Workflows</span>
            </h2>
            <Link href="/workflows" className="text-xs text-blue-400 hover:underline">
              View all ({workflows?.length || 0})
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {workflows?.map((wf) => (
              <div key={wf.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 flex flex-col justify-between hover:border-slate-700 transition-colors">
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-semibold text-white">{wf.title}</h3>
                    <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/20">
                      v{wf.version}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400 line-clamp-2">
                    {wf.description || "Automated AI operation graph."}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {wf.graph_json?.nodes?.length || 0} engine nodes
                  </span>
                  <button
                    onClick={() => setTriggeringWf(wf.id)}
                    className="flex items-center space-x-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    <span>Run Workflow</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Trigger Modal / Form */}
          {triggeringWf && (
            <div className="mt-4 rounded-xl border border-blue-500/30 bg-blue-950/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <PlayCircle className="h-4 w-4 text-blue-400" />
                  <span>Execute Workflow Sandbox Payload</span>
                </h3>
                <button
                  onClick={() => setTriggeringWf(null)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Trigger Payload (JSON)</label>
                <textarea
                  rows={4}
                  value={triggerPayloadText}
                  onChange={(e) => setTriggerPayloadText(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs font-mono text-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {execMessage && (
                <div className="rounded bg-slate-900 p-2.5 text-xs text-blue-400 border border-blue-500/30">
                  {execMessage}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleExecute(triggeringWf)}
                  disabled={executing}
                  className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  <PlayCircle className="h-4 w-4" />
                  <span>{executing ? "Processing Execution..." : "Execute Workflow Now"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Audit Activity Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Immutable Audit Trail</span>
            </h2>
            <Link href="/audit-logs" className="text-xs text-blue-400 hover:underline">
              View full ledger
            </Link>
          </div>

          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            {stats?.recent_activity?.slice(0, 6).map((log) => (
              <div key={log.id} className="flex items-start space-x-3 text-xs border-b border-slate-800/60 pb-2.5 last:border-0 last:pb-0">
                <div className="mt-0.5 rounded-full bg-slate-800 p-1 text-slate-400">
                  <ShieldCheck className="h-3 w-3 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 truncate">{log.event_type}</span>
                    <span className="text-[10px] text-slate-500">{formatDate(log.timestamp)}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-400 truncate">
                    {JSON.stringify(log.action_details)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
