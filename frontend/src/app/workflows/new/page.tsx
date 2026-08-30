"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ReactFlow, { 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Node,
  Edge
} from "reactflow";
import "reactflow/dist/style.css";
import { Save, ArrowLeft, Plus, PlayCircle, ShieldAlert, Cpu, CheckSquare, Zap, BookOpen } from "lucide-react";
import { api } from "../../../lib/api";

const initialNodes: Node[] = [
  { id: "n1", type: "input", data: { label: "1. Trigger (Customer Request)" }, position: { x: 250, y: 50 } },
  { id: "n2", data: { label: "2. Classify Intent & Priority" }, position: { x: 250, y: 150 } },
  { id: "n3", data: { label: "3. Extract Entities (Email, Amount)" }, position: { x: 250, y: 250 } },
  { id: "n4", data: { label: "4. Retrieve Knowledge (pgvector RAG)" }, position: { x: 250, y: 350 } },
  { id: "n5", data: { label: "5. AI Agent Reasoning" }, position: { x: 250, y: 450 } },
  { id: "n6", data: { label: "6. Monetary Condition Check" }, position: { x: 250, y: 550 } },
  { id: "n7", data: { label: "7. Human Approval Gate (High Risk)" }, position: { x: 250, y: 650 } },
  { id: "n8", data: { label: "8. Execute Refund Tool Simulation" }, position: { x: 250, y: 750 } },
  { id: "n9", type: "output", data: { label: "9. Workflow Completed" }, position: { x: 250, y: 850 } },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "n1", target: "n2" },
  { id: "e2-3", source: "n2", target: "n3" },
  { id: "e3-4", source: "n3", target: "n4" },
  { id: "e4-5", source: "n4", target: "n5" },
  { id: "e5-6", source: "n5", target: "n6" },
  { id: "e6-7", source: "n6", target: "n7" },
  { id: "e7-8", source: "n7", target: "n8" },
  { id: "e8-9", source: "n8", target: "n9" },
];

export default function NewWorkflowPage() {
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [title, setTitle] = useState("Custom Operations Workflow");
  const [description, setDescription] = useState("Automates operational tasks with AI reasoning and human approval gates.");
  const [saving, setSaving] = useState(false);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const graph_json = {
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.id === "n1" ? "trigger" : n.id === "n2" ? "classify" : n.id === "n3" ? "extract" : n.id === "n4" ? "retrieve_knowledge" : n.id === "n5" ? "ai_agent" : n.id === "n6" ? "condition" : n.id === "n7" ? "human_approval" : n.id === "n8" ? "tool_action" : "end",
          data: n.data
        })),
        edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target }))
      };
      await api.createWorkflow(title, description, graph_json);
      router.push("/workflows");
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Canvas Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push("/workflows")}
            className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent text-lg font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
            />
            <p className="text-xs text-slate-400">Interactive Node Graph Studio (React Flow Canvas)</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-500 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? "Saving Workflow..." : "Save Workflow"}</span>
        </button>
      </div>

      {/* React Flow Graph Editor Canvas */}
      <div className="h-[650px] w-full rounded-xl border border-slate-800 bg-slate-950 shadow-2xl relative overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Controls />
          <Background color="#334155" gap={16} />
        </ReactFlow>
      </div>

    </div>
  );
}
