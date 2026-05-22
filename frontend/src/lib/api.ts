import type {
  DashboardMetrics,
  DiscoveryFilters,
  Startup,
} from "./types";

/**
 * Backend API client.
 *
 * Configure VITE_API_BASE_URL to point at the FastAPI/Node service that
 * orchestrates scrapers, Ollama analysis, and Supabase persistence.
 * All endpoints return JSON. Errors are surfaced as thrown Error.
 */
const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ??
  "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || body.error || detail;
    } catch {
      // ignore
    }
    throw new Error(`API ${res.status}: ${detail}`);
  }
  return (await res.json()) as T;
}

export const api = {
  listStartups: (filters: DiscoveryFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== "" && v !== null) params.set(k, String(v));
    });
    const qs = params.toString();
    return request<Startup[]>(`/startups${qs ? `?${qs}` : ""}`);
  },
  getStartup: (id: string) => request<Startup>(`/startups/${id}`),
  getMetrics: () => request<DashboardMetrics>(`/metrics`),
  discover: (filters: DiscoveryFilters) =>
    request<{ job_id: string; queued: number }>(`/discover`, {
      method: "POST",
      body: JSON.stringify(filters),
    }),
  uploadCsv: async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API_BASE}/upload-csv`, {
      method: "POST",
      body: fd,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
    return (await res.json()) as { inserted: number };
  },
  analyzeStartup: (id: string) =>
    request<Startup>(`/startups/${id}/analyze`, { method: "POST" }),
};

export const SOURCES = [
  "Entrackr",
  "VCCircle",
  "Y Combinator",
  "Product Hunt",
  "Manual CSV Upload",
] as const;

export const GEOGRAPHIES = [
  "India",
  "United States",
  "United Kingdom",
  "Singapore",
  "UAE",
  "Global",
] as const;

export const SECTORS = [
  "Fintech",
  "Insurtech",
  "Wealthtech",
  "Lendingtech",
  "Regtech",
  "Proptech",
  "Cybersecurity",
  "Enterprise SaaS",
  "AI/ML Infrastructure",
] as const;

export const SUBSECTORS: Record<string, string[]> = {
  Fintech: ["Payments", "Neobanking", "BNPL", "Cross-border"],
  Insurtech: ["Health", "Motor", "Life", "SME", "Claims AI"],
  Wealthtech: ["Robo-advisory", "Mutual Funds", "Trading", "Portfolio"],
  Lendingtech: ["SME Lending", "Consumer", "Co-lending", "Underwriting"],
  Regtech: ["KYC/AML", "Fraud", "Compliance", "Reporting"],
  Proptech: ["Home Loans", "Valuation", "Marketplaces"],
  Cybersecurity: ["IAM", "Cloud Security", "Data Protection"],
  "Enterprise SaaS": ["CRM", "Workflow", "Analytics"],
  "AI/ML Infrastructure": ["LLM Ops", "Vector DB", "Agents"],
};

export const PRIORITIES = ["Critical", "High", "Medium", "Low"] as const;
