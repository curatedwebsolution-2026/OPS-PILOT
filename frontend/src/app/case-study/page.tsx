"use client";

import { 
  Sparkles, 
  ShieldCheck, 
  GitFork, 
  BookOpen, 
  Cpu, 
  CheckSquare, 
  Server, 
  BarChart3, 
  Lock,
  Layers,
  ArrowRight
} from "lucide-react";

export default function CaseStudyPage() {
  return (
    <div className="space-y-10 py-4 max-w-5xl mx-auto">
      
      {/* Flagship Banner Header */}
      <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/80 via-slate-900 to-slate-950 p-8 shadow-2xl space-y-4">
        <div className="inline-flex items-center space-x-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Engineering Reference Implementation & Technical Case Study</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          OPS PILOT: Architectural Deep Dive
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          How we architected a real, multi-tenant AI Business Operations Platform combining node-based workflow orchestration, pgvector RAG, safe LLM function calling, human-in-the-loop safety gates, and immutable audit logging.
        </p>
      </div>

      {/* Problem Statement & Architecture Vision */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-2">
          <Layers className="h-5 w-5 text-blue-400" />
          <span>1. Core Problem & Product Vision</span>
        </h2>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Modern enterprise workflows require AI to interact with real business systems (billing gateways, customer databases, support ticketing desks). However, naive LLM integrations introduce critical risks: unconstrained function execution, prompt injection vulnerabilities, hallucinated financial credits, and tenant data leaks.
          </p>
          <p>
            <strong>OPS PILOT</strong> solves this by introducing a production-grade multi-tier architecture:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-200">
            <li><strong>Deterministic Node Workflow Engine:</strong> Evaluates incoming triggers through strict state-machine transitions.</li>
            <li><strong>Isolated RAG Knowledge Base:</strong> Scopes vector search queries strictly by organization tenant ID (`org_id`).</li>
            <li><strong>Human-in-the-Loop (HITL) Gates:</strong> Automatically halts high-risk tool invocations (e.g. monetary refunds) until approved by an operator.</li>
            <li><strong>Immutable Audit Trail:</strong> Records cryptographic event logs for every decision, model call, and tool execution.</li>
          </ul>
        </div>
      </section>

      {/* Engineering Design Patterns & Stack */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-2">
          <Server className="h-5 w-5 text-emerald-400" />
          <span>2. Technology Stack & Decoupled Architecture</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-2">
            <h3 className="text-sm font-bold text-blue-400">Frontend Layer</h3>
            <p className="text-xs text-slate-400">
              Next.js 14 App Router, TypeScript, Tailwind CSS, React Flow graph engine, TanStack React Query, Zod form validation.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-2">
            <h3 className="text-sm font-bold text-emerald-400">Backend API & Engine</h3>
            <p className="text-xs text-slate-400">
              Python FastAPI async framework, Pydantic v2 schemas, Async SQLAlchemy 2.0 ORM, Celery worker queue, Redis cache.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-2">
            <h3 className="text-sm font-bold text-purple-400">Database & Vector Storage</h3>
            <p className="text-xs text-slate-400">
              PostgreSQL 16 with <code className="text-purple-300">pgvector</code> extension for vector similarity search, with SQLite fallback support.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-2">
            <h3 className="text-sm font-bold text-amber-400">AI Provider Abstraction</h3>
            <p className="text-xs text-slate-400">
              Multi-LLM interface supporting Google Gemini, OpenAI, Anthropic, and a zero-dependency offline <code className="text-amber-300">MockLLMProvider</code>.
            </p>
          </div>
        </div>
      </section>

      {/* Safety & Multi-Tenant Security */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-2">
          <Lock className="h-5 w-5 text-red-400" />
          <span>3. Security Posture & Tenant Isolation</span>
        </h2>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 text-xs text-slate-300 leading-relaxed">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="font-bold text-white block">Strict Tenant Scoping:</span>
              <p>Every SQL query and vector search joins on <code className="text-blue-400">org_id</code> derived from JWT token verification.</p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-white block">Zero Code Eval Policy:</span>
              <p>No model output is ever passed to <code className="text-red-400">eval()</code> or executable shell runtime. All tool calls map to schema-validated functions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Load Test & Observability */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-2">
          <BarChart3 className="h-5 w-5 text-purple-400" />
          <span>4. Observability & Performance Benchmarks</span>
        </h2>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            OPS PILOT includes a built-in Prometheus <code className="text-purple-400">/metrics</code> endpoint and custom Grafana dashboard configuration.
          </p>
          <p>
            Load testing is implemented via <code className="text-emerald-400">k6</code> scripts in <code className="text-slate-200">tests/load/k6-workflow-test.js</code>, verifying throughput under concurrent virtual user stress.
          </p>
        </div>
      </section>

    </div>
  );
}
