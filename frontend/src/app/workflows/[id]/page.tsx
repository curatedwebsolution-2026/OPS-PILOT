"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Save, ArrowLeft, PlayCircle, Clock } from "lucide-react";
import { api } from "../../../lib/api";
import { Workflow } from "../../../types";

export default function WorkflowDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWf() {
      try {
        const wf = await api.getWorkflow(id);
        setWorkflow(wf);

        if (wf.graph_json?.nodes) {
          const rfNodes: Node[] = wf.graph_json.nodes.map((n: any, idx: number) => ({
            id: n.id || `node-${idx}`,
            type: idx === 0 ? "input" : idx === wf.graph_json.nodes.length - 1 ? "output" : "default",
            data: { label: `${idx + 1}. ${n.data?.label || n.type}` },
            position: { x: 250, y: (idx + 1) * 90 }
          }));

          const rfEdges: Edge[] = wf.graph_json.edges?.length > 0 
            ? wf.graph_json.edges 
            : rfNodes.slice(0, -1).map((n, i) => ({
                id: `e-${i}`,
                source: n.id,
                target: rfNodes[i + 1].id
              }));

          setNodes(rfNodes);
          setEdges(rfEdges);
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadWf();
  }, [id, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading Workflow Canvas...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push("/workflows")}
            className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">{workflow?.title}</h1>
            <p className="text-xs text-slate-400">Version {workflow?.version} • Interactive Graph View</p>
          </div>
        </div>
      </div>

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
