import { Building2, Flame, Gauge, Radio } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { DashboardMetrics } from "@/lib/types";

export function MetricsCards({ metrics }: { metrics?: DashboardMetrics }) {
  const items = [
    {
      label: "Total Startups",
      value: metrics?.total_startups ?? 0,
      icon: Building2,
      tint: "text-info",
    },
    {
      label: "High Priority",
      value: metrics?.high_priority_count ?? 0,
      icon: Flame,
      tint: "text-primary",
    },
    {
      label: "Avg BFSI Score",
      value: metrics ? `${metrics.avg_bfsi_score.toFixed(1)}` : "—",
      icon: Gauge,
      tint: "text-success",
    },
    {
      label: "Active Sources",
      value: metrics?.sources_active ?? 0,
      icon: Radio,
      tint: "text-warning",
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((it) => (
        <Card key={it.label} className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {it.label}
              </p>
              <p className="mt-2 font-display text-3xl font-bold tracking-tight">
                {it.value}
              </p>
            </div>
            <div className={`rounded-lg bg-muted p-2 ${it.tint}`}>
              <it.icon className="h-5 w-5" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
