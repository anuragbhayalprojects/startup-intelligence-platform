import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  Globe,
  Sparkles,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Loader2,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/startups/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.id} — Startup Intelligence` },
      {
        name: "description",
        content: "AI-driven analysis, BFSI relevance, and ICICI entity fit for this startup.",
      },
    ],
  }),
  component: StartupDetail,
});

function StartupDetail() {
  const { id } = Route.useParams();
  const q = useQuery({
    queryKey: ["startup", id],
    queryFn: () => api.getStartup(id),
    retry: false,
  });

  const analyze = useMutation({
    mutationFn: () => api.analyzeStartup(id),
    onSuccess: () => {
      toast.success("AI analysis refreshed");
      q.refetch();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Loading startup…</div>;
  }
  if (q.error || !q.data) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to dashboard
        </Link>
        <Card className="mt-4 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Could not load startup. Backend API not reachable or startup not found.
          </p>
        </Card>
      </div>
    );
  }

  const s = q.data;

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
      <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to dashboard
      </Link>

      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">{s.name}</h1>
              <p className="text-sm text-muted-foreground">
                {s.sector} · {s.subsector} · {s.country}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="outline">{s.source}</Badge>
                {s.icici_entity_mapping?.map((e) => (
                  <Badge key={e} className="bg-secondary text-secondary-foreground">
                    {e}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {s.website && (
              <Button variant="outline" asChild>
                <a href={s.website} target="_blank" rel="noreferrer">
                  <Globe className="h-4 w-4" /> Website
                </a>
              </Button>
            )}
            <Button onClick={() => analyze.mutate()} disabled={analyze.isPending}>
              {analyze.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Re-analyze with AI
            </Button>
          </div>
        </div>

        {s.description && (
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {s.description}
          </p>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Scores */}
        <Card className="p-5">
          <h3 className="font-display text-base font-semibold">Scores</h3>
          <Separator className="my-3" />
          <Score label="BFSI Relevance" value={s.bfsi_relevance_score} />
          <Score label="Enterprise Readiness" value={s.enterprise_readiness_score} />
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Priority</span>
            <Badge>{s.priority_level}</Badge>
          </div>
        </Card>

        {/* Facts */}
        <Card className="p-5">
          <h3 className="font-display text-base font-semibold">Company</h3>
          <Separator className="my-3" />
          <Fact icon={Calendar} label="Founded" value={s.founded_year} />
          <Fact icon={TrendingUp} label="Stage" value={s.funding_stage} />
          <Fact
            icon={DollarSign}
            label="Total Funding"
            value={s.total_funding_usd ? `$${(s.total_funding_usd / 1e6).toFixed(1)}M` : undefined}
          />
          <Fact icon={Users} label="Headcount" value={s.employee_count} />
          {s.founders?.length ? (
            <Fact icon={Users} label="Founders" value={s.founders.join(", ")} />
          ) : null}
        </Card>

        {/* AI Analysis */}
        <Card className="p-5 lg:col-span-1">
          <h3 className="font-display text-base font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> AI Analysis
          </h3>
          <p className="text-xs text-muted-foreground">via local Ollama</p>
          <Separator className="my-3" />
          {s.ai_analysis ? (
            <p className="text-sm leading-relaxed text-foreground/90">{s.ai_analysis}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No analysis yet — click "Re-analyze with AI" to generate.
            </p>
          )}
        </Card>
      </div>

      {/* Strengths / Risks */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-display text-base font-semibold text-success">Strengths</h3>
          <Separator className="my-3" />
          {s.ai_strengths?.length ? (
            <ul className="space-y-2 text-sm">
              {s.ai_strengths.map((str) => (
                <li key={str} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                  {str}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No strengths logged.</p>
          )}
        </Card>
        <Card className="p-5">
          <h3 className="font-display text-base font-semibold text-destructive">Risks</h3>
          <Separator className="my-3" />
          {s.ai_risks?.length ? (
            <ul className="space-y-2 text-sm">
              {s.ai_risks.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                  {r}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No risks logged.</p>
          )}
        </Card>
      </div>

      {s.ai_recommended_action && (
        <Card className="border-primary/40 bg-primary/5 p-5">
          <h3 className="font-display text-base font-semibold">Recommended Action</h3>
          <p className="mt-2 text-sm leading-relaxed">{s.ai_recommended_action}</p>
        </Card>
      )}
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  const v = Math.max(0, Math.min(100, value));
  const color =
    v >= 75 ? "bg-success" : v >= 50 ? "bg-primary" : v >= 25 ? "bg-warning" : "bg-muted-foreground";
  return (
    <div className="mb-3">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums">{v}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${color}`} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | number;
}) {
  return (
    <div className="mb-2.5 flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="font-medium">{value ?? "—"}</span>
    </div>
  );
}
