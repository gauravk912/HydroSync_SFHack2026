"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Selection = {
  producerId: string;
  producerName: string;
  distanceKm: number;
  allocatedGallons: number;
  availableGallons: number;
  confidence: number;
  predictedIndustry: string | null;
  summary: string | null;
  location: any | null;
};

type MatchResponse = {
  success: boolean;
  demand: any;
  selections: Selection[];
  remainingGallons: number;
  mode: "SINGLE" | "PAIR" | "MULTI";
  error?: string;
};

function fmtNum(n: number) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString();
}

function fmtDistanceKm(km: number) {
  if (!Number.isFinite(km) || km === Infinity) return "—";
  return `${km.toFixed(1)} km`;
}

export default function ConsumerOptionsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalAllocated = useMemo(() => {
    if (!data?.selections?.length) return 0;
    return data.selections.reduce((sum, s) => sum + (Number(s.allocatedGallons) || 0), 0);
  }, [data]);

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
      } catch (e: any) {
        setError(e?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
              Fetching your demand and selecting the best producer(s).
            </p>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Demand Summary */}
        {!loading && !error && data?.demand && (
          <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold">Your Demand</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  This is what we used to generate matches.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge label={`Mode: ${data.mode}`} />
                <Badge label={`Required: ${fmtNum(Number(data.demand.quantityNeededGallonsPerDay))} gal/day`} />
                <Badge label={`Allocated: ${fmtNum(totalAllocated)} gal/day`} />
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <KV label="Industry Need" value={data.demand.industryNeed ?? "—"} />
              <KV
                label="Location"
                value={
                  data.demand.location?.city
                    ? `${data.demand.location.city}, ${data.demand.location.state ?? ""}`
                    : "—"
                }
              />
            </div>

            {data.remainingGallons > 0 && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Not enough total supply to fully satisfy demand. Remaining:{" "}
                <strong>{fmtNum(Number(data.remainingGallons))}</strong> gal/day
              </div>
            )}
          </div>
        )}

        {/* Matches */}
        {!loading && !error && data && (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Recommended Producer Supply</h2>
              <div className="text-xs text-muted-foreground">
                {data.selections?.length ? `${data.selections.length} producer(s)` : "0 producers"}
              </div>
            </div>

            {!data.selections?.length ? (
              <div className="mt-4 rounded-2xl border bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold">No matches found</div>
                <p className="mt-2 text-sm text-muted-foreground">
                  We couldn’t find a producer that matches your industry need right now.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {data.selections.map((s) => (
                  <ProducerCard key={s.producerId} s={s} />
                ))}
              </div>
            )}
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

function ProducerCard({ s }: { s: Selection }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-base font-semibold">{s.producerName}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {s.predictedIndustry ? `Predicted: ${s.predictedIndustry}` : "Predicted: —"} •{" "}
            Confidence: {Math.round((s.confidence ?? 0) * 100)}%
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-muted-foreground">Distance</div>
          <div className="text-sm font-semibold">
            {Number.isFinite(s.distanceKm) && s.distanceKm !== Infinity ? `${s.distanceKm.toFixed(1)} km` : "—"}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <KV label="Allocated" value={`${s.allocatedGallons.toLocaleString()} gal/day`} />
        <KV label="Capacity" value={`${s.availableGallons.toLocaleString()} gal/day`} />
      </div>

      {s.summary && (
        <div className="mt-4 rounded-xl border bg-slate-50 p-4">
          <div className="text-xs font-semibold text-slate-700">Summary</div>
          <div className="mt-1 text-sm text-slate-700">{s.summary}</div>
        </div>
      )}

      <Button className="mt-5 w-full">
        Request this supply
      </Button>
    </div>
  );
}