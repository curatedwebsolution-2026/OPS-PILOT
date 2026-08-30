"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { GitFork, Plus, PlayCircle, Clock, ShieldAlert, Cpu } from "lucide-react";
import { api } from "../../lib/api";
import { formatDate } from "../../lib/utils";

export default function WorkflowsPage() {
  const { data: workflows, isLoading } = useQuery({
    queryKey: ["workflows"],
    queryFn: () => api.listWorkflows(),
  });

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading AI Workflows catalog...</div>;
  }

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <GitFork className="h-6 w-6 text-blue-400" />
            <span>AI Workflow Operations</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Define, configure, and orchestrate graph-based operational workflows with integrated RAG, agent reasoning, and human safety gates.
          </p>
        </div>

        <Link
          href="/workflows/new"
          className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          <span>New Workflow</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {workflows?.map((wf) => (
          <div
            key={wf.id}
            className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
                  Version {wf.version}
                </span>
                <span className="flex items-center space-x-1 text-[11px] text-slate-500">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(wf.created_at)}</span>
                </span>
              </div>

              <h3 className="mt-3 text-base font-bold text-white">{wf.title}</h3>
              <p className="mt-2 text-xs text-slate-400 line-clamp-3">
                {wf.description || "No description provided."}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  Active
                </span>
                <span className="text-xs text-slate-500">
                  {wf.graph_json?.nodes?.length || 0} nodes
                </span>
              </div>

              <Link
                href={`/workflows/${wf.id}`}
                className="flex items-center space-x-1 text-xs font-semibold text-blue-400 hover:underline"
              >
                <span>Edit Canvas</span>
                <GitFork className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
