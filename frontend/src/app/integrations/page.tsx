"use client";

import { useQuery } from "@tanstack/react-query";
import { Cpu, ShieldAlert, CheckCircle2 } from "lucide-react";
import { api } from "../../lib/api";
import { getRiskColor } from "../../lib/utils";

export default function IntegrationsPage() {
  const { data: tools, isLoading } = useQuery({
    queryKey: ["tools"],
    queryFn: () => api.listTools(),
  });

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading Tool Integrations Catalog...</div>;
  }

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <Cpu className="h-6 w-6 text-purple-400" />
            <span>Safe Tool Integration Catalog</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Registered tool capabilities available for AI agent function calling and workflow orchestration.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tools?.map((tool) => (
          <div key={tool.key} className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${getRiskColor(tool.risk_level)}`}>
                {tool.risk_level} RISK
              </span>
              <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                Simulation Sandbox
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">{tool.name}</h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">{tool.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
              Key: <code className="text-blue-400">{tool.key}</code>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
