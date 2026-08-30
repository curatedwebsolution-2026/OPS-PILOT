"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, Search, Filter } from "lucide-react";
import { api } from "../../lib/api";
import { formatDate } from "../../lib/utils";

export default function AuditLogsPage() {
  const [filterEvent, setFilterEvent] = useState("");

  const { data: logs, isLoading } = useQuery({
    queryKey: ["audit-logs", filterEvent],
    queryFn: () => api.listAuditLogs(filterEvent || undefined),
    refetchInterval: 5000,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading Immutable Audit Trail...</div>;
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            <span>Immutable Audit Log Ledger</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Immutable system audit trail tracking authentication, workflow creation, AI reasoning decisions, human approvals, and tool executions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={filterEvent}
            onChange={(e) => setFilterEvent(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="">All Events</option>
            <option value="auth.login">Auth Login</option>
            <option value="workflow.create">Workflow Create</option>
            <option value="execution.start">Execution Start</option>
            <option value="approval.requested">Approval Requested</option>
            <option value="approval.approved">Approval Approved</option>
            <option value="tool.execute">Tool Execute</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3.5">Timestamp</th>
              <th className="px-6 py-3.5">Event Type</th>
              <th className="px-6 py-3.5">Target</th>
              <th className="px-6 py-3.5">Action Details</th>
              <th className="px-6 py-3.5">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-200 font-mono text-[11px]">
            {logs?.map((log) => (
              <tr key={log.id} className="hover:bg-slate-850/50 transition-colors">
                <td className="px-6 py-3.5 text-slate-400">
                  {formatDate(log.timestamp)}
                </td>
                <td className="px-6 py-3.5 font-semibold text-blue-400">
                  {log.event_type}
                </td>
                <td className="px-6 py-3.5 text-slate-400">
                  {log.target_type ? `${log.target_type}:${log.target_id?.substring(0, 6)}` : "-"}
                </td>
                <td className="px-6 py-3.5 text-slate-300 max-w-md truncate">
                  {JSON.stringify(log.action_details)}
                </td>
                <td className="px-6 py-3.5 text-slate-500">
                  {log.ip_address || "127.0.0.1"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
