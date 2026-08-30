"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Upload, Search, FileText, CheckCircle2, Sparkles } from "lucide-react";
import { api } from "../../lib/api";
import { formatDate } from "../../lib/utils";

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState("duplicate charge refund policy");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ["knowledge-documents"],
    queryFn: () => api.listDocuments(),
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setSearching(true);
    try {
      const res = await api.searchKnowledge(searchQuery, 4);
      setSearchResults(res);
    } catch (err: any) {
      alert(`Search error: ${err.message}`);
    } finally {
      setSearching(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    try {
      await api.uploadDocument(selectedFile);
      setSelectedFile(null);
      refetch();
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading Knowledge Base Documents...</div>;
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-blue-400" />
            <span>Knowledge Base & RAG Pipeline</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Document ingestion, recursive text chunking, dense vector embedding, and real-time pgvector similarity search.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Document Ingestion Panel */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Upload className="h-4 w-4 text-blue-400" />
            <span>Ingest New Policy Document</span>
          </h2>

          <form onSubmit={handleUpload} className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 shadow-lg">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Select File (PDF, TXT, MD, JSON)</label>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="w-full flex items-center justify-center space-x-2 rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              <span>{uploading ? "Ingesting & Chunking..." : "Ingest Document"}</span>
            </button>
          </form>

          {/* Documents List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ingested Documents ({documents?.length || 0})</h3>
            {documents?.map((doc) => (
              <div key={doc.id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-blue-400" />
                  <div>
                    <span className="font-semibold text-slate-200 block">{doc.title}</span>
                    <span className="text-[10px] text-slate-500">{doc.chunk_count} vector chunks</span>
                  </div>
                </div>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono uppercase text-slate-400">
                  {doc.file_type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Vector Semantic Search Sandbox */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Search className="h-4 w-4 text-emerald-400" />
            <span>Vector Similarity Search Sandbox</span>
          </h2>

          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter query to perform vector cosine similarity lookup..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="flex items-center space-x-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
              <span>{searching ? "Searching..." : "Vector Search"}</span>
            </button>
          </form>

          {/* Search Results Display */}
          <div className="space-y-4">
            {searchResults.map((res, idx) => (
              <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-2 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400">Source: {res.document_title}</span>
                  <span className="rounded bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                    Similarity Score: {(res.score * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded border border-slate-800">
                  {res.text_content}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
