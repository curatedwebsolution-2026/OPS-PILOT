import "./globals.css";
import QueryProvider from "../components/QueryProvider";
import Navigation from "../components/Navigation";
import { ThemeProvider } from "../components/ThemeProvider";

export const metadata = {
  title: "OPS PILOT - AI-Powered Business Operations & Workflow Automation Platform",
  description: "Enterprise reference implementation showcasing multi-tenant AI workflow orchestration, safe tool execution, pgvector RAG, and human-in-the-loop approvals.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ]
  },
  manifest: "/site.webmanifest"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storedTheme = localStorage.getItem('opspilot_theme');
                  var root = document.documentElement;
                  if (storedTheme === 'light') {
                    root.classList.remove('dark');
                    root.classList.add('light');
                  } else {
                    root.classList.add('dark');
                    root.classList.remove('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased transition-colors duration-200">
        <ThemeProvider>
          <QueryProvider>
            <Navigation />
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </main>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
