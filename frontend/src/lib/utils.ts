import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(date);
}

export function getRiskColor(risk: string): string {
  switch (risk.toLowerCase()) {
    case "critical":
      return "bg-red-500/10 text-red-600 border-red-200";
    case "high":
      return "bg-amber-500/10 text-amber-600 border-amber-200";
    case "medium":
      return "bg-blue-500/10 text-blue-600 border-blue-200";
    default:
      return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
  }
}
