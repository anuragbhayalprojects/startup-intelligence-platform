import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import type { DashboardMetrics } from "@/lib/types";

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

export function SourceAnalytics({ metrics }: { metrics?: DashboardMetrics }) {
  const data = metrics?.by_source ?? [];
  return (
    <Card className="p-5">
      <h3 className="font-display text-base font-semibold">Source Analytics</h3>
      <p className="mb-4 text-xs text-muted-foreground">
        Discovery yield per source
      </p>
      <div className="h-64">
        {data.length === 0 ? (
          <Empty />
        ) : (
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="source" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

export function SectorAnalytics({ metrics }: { metrics?: DashboardMetrics }) {
  const data = metrics?.by_sector ?? [];
  return (
    <Card className="p-5">
      <h3 className="font-display text-base font-semibold">Sector Analytics</h3>
      <p className="mb-4 text-xs text-muted-foreground">
        Distribution across BFSI verticals
      </p>
      <div className="h-64">
        {data.length === 0 ? (
          <Empty />
        ) : (
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="sector"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

function Empty() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      No data — run discovery to populate analytics
    </div>
  );
}
