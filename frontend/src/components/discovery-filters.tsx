import { useState } from "react";
import { Search, Sparkles, Upload, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  api,
  GEOGRAPHIES,
  PRIORITIES,
  SECTORS,
  SOURCES,
  SUBSECTORS,
} from "@/lib/api";
import type { DiscoveryFilters as Filters } from "@/lib/types";

interface Props {
  value: Filters;
  onChange: (next: Filters) => void;
  onDiscover: () => void;
}

export function DiscoveryFilters({ value, onChange, onDiscover }: Props) {
  const [uploading, setUploading] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const subsectors = value.sector ? SUBSECTORS[value.sector] ?? [] : [];

  const update = (patch: Partial<Filters>) => onChange({ ...value, ...patch });

  const handleDiscover = async () => {
    setDiscovering(true);
    try {
      const res = await api.discover(value);
      toast.success(`Discovery queued — ${res.queued} startups`);
      onDiscover();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setDiscovering(false);
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const r = await api.uploadCsv(file);
      toast.success(`Imported ${r.inserted} startups`);
      onDiscover();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold">
            Discovery Filters
          </h2>
          <p className="text-xs text-muted-foreground">
            Configure sources, geography, and scoring thresholds
          </p>
        </div>
        <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
          Live
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Field label="Source">
          <Select
            value={value.source ?? undefined}
            onValueChange={(v) => update({ source: v as Filters["source"] })}
          >
            <SelectTrigger><SelectValue placeholder="All sources" /></SelectTrigger>
            <SelectContent>
              {SOURCES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Geography">
          <Select
            value={value.geography ?? undefined}
            onValueChange={(v) => update({ geography: v })}
          >
            <SelectTrigger><SelectValue placeholder="All regions" /></SelectTrigger>
            <SelectContent>
              {GEOGRAPHIES.map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Sector">
          <Select
            value={value.sector ?? undefined}
            onValueChange={(v) => update({ sector: v, subsector: undefined })}
          >
            <SelectTrigger><SelectValue placeholder="All sectors" /></SelectTrigger>
            <SelectContent>
              {SECTORS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Subsector">
          <Select
            value={value.subsector ?? undefined}
            onValueChange={(v) => update({ subsector: v })}
            disabled={!value.sector}
          >
            <SelectTrigger>
              <SelectValue placeholder={value.sector ? "Any" : "Pick sector first"} />
            </SelectTrigger>
            <SelectContent>
              {subsectors.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label={`Startup Count: ${value.count ?? 25}`}>
          <Slider
            value={[value.count ?? 25]}
            min={5}
            max={200}
            step={5}
            onValueChange={([v]) => update({ count: v })}
          />
        </Field>

        <Field label={`Min BFSI Score: ${value.min_bfsi_score ?? 0}`}>
          <Slider
            value={[value.min_bfsi_score ?? 0]}
            min={0}
            max={100}
            step={5}
            onValueChange={([v]) => update({ min_bfsi_score: v })}
          />
        </Field>

        <Field label="Priority">
          <Select
            value={value.priority ?? undefined}
            onValueChange={(v) => update({ priority: v as Filters["priority"] })}
          >
            <SelectTrigger><SelectValue placeholder="Any priority" /></SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="CSV Upload">
          <div className="relative">
            <Input
              type="file"
              accept=".csv"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
              }}
              className="cursor-pointer file:mr-3 file:rounded file:border-0 file:bg-secondary file:px-2 file:py-1 file:text-xs file:text-secondary-foreground"
            />
            {uploading && (
              <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </Field>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <p className="text-xs text-muted-foreground">
          Triggers backend scrapers → Ollama analysis → Supabase persistence
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onChange({})}>
            Reset
          </Button>
          <Button onClick={handleDiscover} disabled={discovering}>
            {discovering ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Run Discovery
          </Button>
        </div>
      </div>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
