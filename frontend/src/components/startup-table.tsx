import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, ArrowUpDown, ExternalLink } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PriorityLevel, Startup } from "@/lib/types";

const priorityVariant: Record<PriorityLevel, string> = {
  Critical: "bg-destructive/15 text-destructive border-destructive/30",
  High: "bg-primary/15 text-primary border-primary/30",
  Medium: "bg-warning/15 text-warning-foreground border-warning/30",
  Low: "bg-muted text-muted-foreground border-border",
};

type SortKey =
  | "name"
  | "country"
  | "sector"
  | "bfsi_relevance_score"
  | "enterprise_readiness_score"
  | "priority_level";

export function StartupTable({
  startups,
  loading,
}: {
  startups: Startup[];
  loading?: boolean;
}) {
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("bfsi_relevance_score");
  const [asc, setAsc] = useState(false);

  const rows = useMemo(() => {
    const filtered = startups.filter((s) => {
      if (!q) return true;
      const hay = `${s.name} ${s.sector} ${s.subsector} ${s.country} ${s.source}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] as string | number;
      const bv = b[sortKey] as string | number;
      if (av === bv) return 0;
      const cmp = av > bv ? 1 : -1;
      return asc ? cmp : -cmp;
    });
  }, [startups, q, sortKey, asc]);

  const toggleSort = (k: SortKey) => {
    if (k === sortKey) setAsc((v) => !v);
    else {
      setSortKey(k);
      setAsc(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b p-4">
        <div>
          <h2 className="font-display text-lg font-semibold">
            Startup Intelligence
          </h2>
          <p className="text-xs text-muted-foreground">
            {rows.length} startups · scored & classified by AI
          </p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search startups…"
            className="pl-8"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <Th onClick={() => toggleSort("name")}>Startup</Th>
              <Th onClick={() => toggleSort("country")}>Country</Th>
              <Th onClick={() => toggleSort("sector")}>Sector</Th>
              <TableHead className="text-xs uppercase tracking-wider">
                Subsector
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider">
                Source
              </TableHead>
              <Th onClick={() => toggleSort("bfsi_relevance_score")}>BFSI</Th>
              <Th onClick={() => toggleSort("enterprise_readiness_score")}>
                Enterprise
              </Th>
              <Th onClick={() => toggleSort("priority_level")}>Priority</Th>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <EmptyRow text="Loading startup intelligence…" />
            ) : rows.length === 0 ? (
              <EmptyRow text="No startups yet. Run a discovery to populate." />
            ) : (
              rows.map((s) => (
                <TableRow key={s.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    <Link
                      to="/startups/$id"
                      params={{ id: s.id }}
                      className="hover:text-primary"
                    >
                      {s.name}
                    </Link>
                    {s.icici_entity_mapping?.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {s.icici_entity_mapping.slice(0, 2).map((e) => (
                          <span
                            key={e}
                            className="rounded bg-secondary/10 px-1.5 py-0.5 text-[10px] font-medium text-secondary"
                          >
                            {e.replace("ICICI ", "")}
                          </span>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {s.country}
                  </TableCell>
                  <TableCell className="text-sm">{s.sector}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {s.subsector}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {s.source}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ScoreBar value={s.bfsi_relevance_score} />
                  </TableCell>
                  <TableCell>
                    <ScoreBar value={s.enterprise_readiness_score} />
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded border px-2 py-0.5 text-xs font-medium ${priorityVariant[s.priority_level]}`}
                    >
                      {s.priority_level}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link
                      to="/startups/$id"
                      params={{ id: s.id }}
                      className="inline-flex items-center text-muted-foreground hover:text-primary"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

function Th({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <TableHead
      onClick={onClick}
      className="cursor-pointer select-none text-xs uppercase tracking-wider hover:text-foreground"
    >
      <span className="inline-flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      </span>
    </TableHead>
  );
}

function ScoreBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  const color =
    v >= 75 ? "bg-success" : v >= 50 ? "bg-primary" : v >= 25 ? "bg-warning" : "bg-muted-foreground";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${color}`} style={{ width: `${v}%` }} />
      </div>
      <span className="text-xs font-medium tabular-nums">{v}</span>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <TableRow>
      <TableCell colSpan={9} className="py-16 text-center text-sm text-muted-foreground">
        {text}
      </TableCell>
    </TableRow>
  );
}
