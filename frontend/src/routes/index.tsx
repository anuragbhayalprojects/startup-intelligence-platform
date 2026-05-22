import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { DiscoveryFilters } from "@/components/discovery-filters";
import { MetricsCards } from "@/components/metrics-cards";
import { StartupTable } from "@/components/startup-table";
import { SectorAnalytics, SourceAnalytics } from "@/components/analytics-charts";
import { api } from "@/lib/api";
import type { DiscoveryFilters as Filters } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — ICICI Startup Intelligence" },
      {
        name: "description",
        content:
          "Discover BFSI-relevant startups with AI scoring, ICICI entity mapping, and source analytics.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [filters, setFilters] = useState<Filters>({ count: 25 });

  const startupsQ = useQuery({
    queryKey: ["startups", filters],
    queryFn: () => api.listStartups(filters),
    retry: false,
  });

  const metricsQ = useQuery({
    queryKey: ["metrics"],
    queryFn: () => api.getMetrics(),
    retry: false,
  });

  const startups = startupsQ.data ?? [];
  const metrics = metricsQ.data;

  const refresh = () => {
    startupsQ.refetch();
    metricsQ.refetch();
  };

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Startup Intelligence Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Multi-source discovery · AI-driven BFSI relevance scoring · ICICI entity mapping
        </p>
      </div>

      <MetricsCards metrics={metrics} />

      <DiscoveryFilters value={filters} onChange={setFilters} onDiscover={refresh} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SourceAnalytics metrics={metrics} />
        <SectorAnalytics metrics={metrics} />
      </div>

      <StartupTable startups={startups} loading={startupsQ.isLoading} />

      {(startupsQ.error || metricsQ.error) && (
        <p className="text-xs text-muted-foreground">
          Backend not reachable yet — configure{" "}
          <code className="rounded bg-muted px-1">VITE_API_BASE_URL</code> to point at
          your scraping & analysis service.
        </p>
      )}
    </div>
  );
}
