import "./globals.css";
import QueryProvider from "../components/QueryProvider";
import Navigation from "../components/Navigation";

export const metadata = {
  title: "OPS PILOT - AI-Powered Business Operations & Workflow Automation Platform",
  description: "Enterprise reference implementation showcasing multi-tenant AI workflow orchestration, safe tool execution, pgvector RAG, and human-in-the-loop approvals.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <QueryProvider>
          <Navigation />
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}
