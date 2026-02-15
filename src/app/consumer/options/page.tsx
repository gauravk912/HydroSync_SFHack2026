"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/** ---------------- Types matching your API response ---------------- */

type ApiSelection = {
  producerId: string;
  company_name: string;
  location: string;
  allocatedGallons: number;
  availableGallons: number;
  distanceMiles: number;
  confidence: number;
  recommended?: string | null;
  recommendedDisplay?: string | null;
  compatibleProb?: number | null;
  gemini_summary?: string | null;
  consumerNeedDisplay?: string | null;
};

type ApiOption = {
  mode: "SINGLE" | "PAIR" | "MULTI";
  remainingGallons: number;
  selections: ApiSelection[];
};

type RankedProducer = {
  producerId: string;
  company_name: string;
  location: string;
  availableGallons: number;
  distanceMiles: number;
  confidence: number;
  recommended?: string | null;
  recommendedDisplay?: string | null;
  compatibleProb?: number | null;
};

type MatchResponse = {
  success: boolean;
  demand: any;
  industryNeedDisplay?: string | null;

  // NEW
  options?: ApiOption[];
  rankedProducers?: RankedProducer[];

  // Backward compatibility (still returned by your API)
  selections?: ApiSelection[];
  remainingGallons: number;
  mode: "SINGLE" | "PAIR" | "MULTI";

  error?: string;
};

/** ---------------- Helpers ---------------- */

function fmtNum(n: number) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString();
}

function fmtMiles(mi?: number) {
  if (!Number.isFinite(mi as number)) return "—";
  return `${(mi as number).toFixed(0)} mi`;
}

function pct(p: number) {
  if (!Number.isFinite(p)) return "—";
  return `${Math.round(p * 100)}%`;
}

/** ---------------- Page ---------------- */

export default function ConsumerOptionsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Which option user is viewing (Option 1/2/3)
  const [activeOptionIdx, setActiveOptionIdx] = useState(0);

  useEffect(() => {
    const demandId = localStorage.getItem("hydrosync_last_demand_id");
    if (!demandId) {
      setError("No demand found. Please go back and submit requirements again.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/consumer/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ demandId }),
        });

        const json = (await res.json()) as MatchResponse;

        if (!res.ok) {
          throw new Error(json?.error || "Failed to load matches");
        }

        setData(json);
        setActiveOptionIdx(0);
      } catch (e: any) {
        setError(e?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Decide what to show as the “current plan”
  const activePlan = useMemo(() => {
    if (!data) return null;

    const opts = data.options ?? [];
    if (opts.length > 0) {
      return opts[Math.min(activeOptionIdx, opts.length - 1)];
    }

    // fallback to legacy fields
    return {
      mode: data.mode,
      remainingGallons: data.remainingGallons,
      selections: data.selections ?? [],
    } as ApiOption;
  }, [data, activeOptionIdx]);

  const totalAllocated = useMemo(() => {
    const sels = activePlan?.selections ?? [];
    return sels.reduce((sum, s) => sum + (Number(s.allocatedGallons) || 0), 0);
  }, [activePlan]);

  const demandIndustryDisplay = useMemo(() => {
    if (!data?.demand) return "—";
    return (
      data.industryNeedDisplay ??
      data.demand.industryNeed ??
      data.demand.industryNeedNormalized ??
      "—"
    );
  }, [data]);

  const demandLocationDisplay = useMemo(() => {
    if (!data?.demand) return "—";
    return data.demand.location?.city
      ? `${data.demand.location.city}, ${data.demand.location.state ?? ""}`
      : (data.demand.location ?? "—");
  }, [data]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Available Producer Options</h1>
            <p className="text-sm text-muted-foreground">
              Matches are generated based on industry compatibility, quantity, and distance.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/consumer/dashboard")}>
              Back
            </Button>
          </div>
        </div>

        {/* Status */}
        {loading && (
          <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold">Matching in progress…</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Fetching your demand and selecting the best producer options.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Demand Summary */}
        {!loading && !error && data?.demand && activePlan && (
          <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold">Your Demand</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  This is what we used to generate matches.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge label={`Mode: ${activePlan.mode}`} />
                <Badge
                  label={`Required: ${fmtNum(Number(data.demand.quantityNeededGallonsPerDay))} gal/day`}
                />
                <Badge label={`Allocated: ${fmtNum(totalAllocated)} gal/day`} />
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <KV label="Industry Need" value={String(demandIndustryDisplay)} />
              <KV label="Location" value={String(demandLocationDisplay)} />
            </div>

            {activePlan.remainingGallons > 0 && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Not enough total supply to fully satisfy demand. Remaining:{" "}
                <strong>{fmtNum(Number(activePlan.remainingGallons))}</strong> gal/day
              </div>
            )}
          </div>
        )}

        {/* Option Switcher (SINGLE / PAIR / MULTI) */}
        {!loading && !error && data && (data.options?.length ?? 0) > 0 && (
          <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">Fulfillment Plans</div>
                <div className="text-xs text-muted-foreground">
                  Choose a plan (single supplier vs split supply).
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(data.options ?? []).map((opt, idx) => (
                  <button
                    key={`${opt.mode}-${idx}`}
                    onClick={() => setActiveOptionIdx(idx)}
                    className={[
                      "rounded-full border px-3 py-1 text-xs font-medium transition",
                      idx === activeOptionIdx
                        ? "bg-black text-white border-black"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100",
                    ].join(" ")}
                  >
                    Option {idx + 1}: {opt.mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recommended Producer Supply (shows ACTIVE plan selections) */}
        {!loading && !error && data && activePlan && (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Recommended Producer Supply</h2>
              <div className="text-xs text-muted-foreground">
                {activePlan.selections?.length
                  ? `${activePlan.selections.length} producer(s)`
                  : "0 producers"}
              </div>
            </div>

            {!activePlan.selections?.length ? (
              <div className="mt-4 rounded-2xl border bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold">No matches found</div>
                <p className="mt-2 text-sm text-muted-foreground">
                  We couldn’t find a producer that matches your industry need right now.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {activePlan.selections.map((s) => (
                  <ProducerCard key={s.producerId} s={s} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Ranked alternatives */}
        {!loading && !error && data && (data.rankedProducers?.length ?? 0) > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Top Matches (ranked)</h2>
              <div className="text-xs text-muted-foreground">
                {data.rankedProducers?.length ?? 0} producer(s)
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {(data.rankedProducers ?? []).slice(0, 10).map((p) => (
                <RankedProducerCard key={p.producerId} p={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- UI bits ---------- */

function Badge({ label }: { label: string }) {
  return (
    <div className="rounded-full border bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
      {label}
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-slate-50 px-4 py-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function ProducerCard({ s }: { s: ApiSelection }) {
  const predicted = s.recommendedDisplay ?? s.recommended ?? "—";
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-base font-semibold">{s.company_name}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Predicted: {predicted} • Confidence: {pct(s.confidence)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{s.location || "—"}</div>
        </div>

        <div className="text-right">
          <div className="text-xs text-muted-foreground">Distance</div>
          <div className="text-sm font-semibold">{fmtMiles(s.distanceMiles)}</div>
        </div>
      </div>

      {s.gemini_summary && (
        <div className="mt-4 rounded-xl border bg-slate-50 p-4 text-sm text-slate-700">
          {s.gemini_summary}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <KV label="Allocated" value={`${fmtNum(Number(s.allocatedGallons))} gal/day`} />
        <KV label="Capacity" value={`${fmtNum(Number(s.availableGallons))} gal/day`} />
      </div>

      <div className="mt-4">
        <Button className="w-full">Request this supply</Button>
      </div>
    </div>
  );
}

function RankedProducerCard({ p }: { p: RankedProducer }) {
  const predicted = p.recommendedDisplay ?? p.recommended ?? "—";
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-base font-semibold">{p.company_name}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Predicted: {predicted} • Confidence: {pct(p.confidence)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{p.location || "—"}</div>
        </div>

        <div className="text-right">
          <div className="text-xs text-muted-foreground">Distance</div>
          <div className="text-sm font-semibold">{fmtMiles(p.distanceMiles)}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        <KV label="Capacity" value={`${fmtNum(Number(p.availableGallons))} gal/day`} />
      </div>
    </div>
  );
}
