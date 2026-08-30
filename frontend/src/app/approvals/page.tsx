"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckSquare, ShieldAlert, CheckCircle2, XCircle, BookOpen, AlertTriangle, Sparkles } from "lucide-react";
import { api } from "../../lib/api";
import { getRiskColor, formatDate } from "../../lib/utils";

export default function ApprovalsPage() {
  const [commentMap, setCommentMap] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data: approvals, isLoading, refetch } = useQuery({
    queryKey: ["approvals"],
    queryFn: () => api.listApprovals("pending"),
    refetchInterval: 3000,
  });

  const handleDecision = async (approvalId: string, approved: boolean) => {
    setProcessingId(approvalId);
    try {
      const comment = commentMap[approvalId] || "";
      await api.resolveApproval(approvalId, approved, comment);
      refetch();
    } catch (err: any) {
      alert(`Decision error: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading Human Approval Queue...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
              <CheckSquare className="h-6 w-6 text-amber-400" />
              <span>Human Approval Queue</span>
            </h1>
            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/20">
              HITL Safety Gate
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            High-risk tool actions (e.g. monetary refunds, account alterations) require mandatory human review and explicit authorization.
          </p>
        </div>
      </div>

      {/* Approval Cards List */}
      {approvals?.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
          <h3 className="mt-3 text-sm font-bold text-white">Approval Queue is Clear</h3>
          <p className="mt-1 text-xs text-slate-400">No high-risk actions pending human authorization.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {approvals?.map((app) => (
            <div
              key={app.id}
              className="rounded-xl border border-amber-500/30 bg-slate-900/90 p-6 shadow-xl space-y-5"
            >
              {/* Card Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`rounded border px-2.5 py-0.5 text-[10px] font-bold uppercase ${getRiskColor(app.risk_level)}`}>
                      {app.risk_level} RISK
                    </span>
                    <span className="text-xs font-semibold text-white">Proposed Tool: <code>{app.proposed_action}</code></span>
                  </div>
                  <span className="mt-1 text-[11px] text-slate-500 block">Requested at {formatDate(app.created_at)}</span>
                </div>

                <div className="text-xs text-slate-400">
                  Execution Ref: <code className="text-blue-400">{app.execution_id.substring(0, 8)}</code>
                </div>
              </div>

              {/* AI Recommendation & Reason */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg bg-slate-950 p-4 border border-slate-800">
                  <h4 className="text-xs font-semibold text-blue-400 flex items-center space-x-1.5 mb-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>AI Agent Recommendation</span>
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed">{app.ai_recommendation}</p>
                </div>

                <div className="rounded-lg bg-slate-950 p-4 border border-slate-800">
                  <h4 className="text-xs font-semibold text-amber-400 flex items-center space-x-1.5 mb-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Risk Evaluation Reason</span>
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed">{app.reason}</p>
                </div>
              </div>

              {/* RAG Evidence Chunks */}
              {app.retrieved_evidence && app.retrieved_evidence.length > 0 && (
                <div className="rounded-lg bg-slate-950/60 p-4 border border-slate-800/80 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-blue-400" />
                    <span>Retrieved Knowledge Evidence (RAG Context)</span>
                  </h4>
                  <div className="space-y-1.5">
                    {app.retrieved_evidence.map((ev, idx) => (
                      <div key={idx} className="text-xs bg-slate-900 p-2.5 rounded border border-slate-800 text-slate-300">
                        <span className="font-semibold text-blue-300 block mb-0.5">[{ev.document_title}]</span>
                        <p className="italic">{ev.text_content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Form */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
                <input
                  type="text"
                  placeholder="Optional review comment or justification..."
                  value={commentMap[app.id] || ""}
                  onChange={(e) => setCommentMap({ ...commentMap, [app.id]: e.target.value })}
                  className="w-full sm:w-2/3 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => handleDecision(app.id, false)}
                    disabled={processingId === app.id}
                    className="flex items-center space-x-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleDecision(app.id, true)}
                    disabled={processingId === app.id}
                    className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{processingId === app.id ? "Executing..." : "Approve & Execute Tool"}</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
