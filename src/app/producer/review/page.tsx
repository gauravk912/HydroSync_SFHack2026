"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type ExtractedWaterPassport = {
  reportName: string;
  extractedAt: string;
  confidence: number; // 0-1

  facility: {
    name?: string;
    city?: string;
    state?: string;
    sampleTime?: string;
  };

  metrics: {
    ph?: number;
    turbidityNTU?: number;
    tdsMgL?: number;
    tssMgL?: number;
    conductivityUsCm?: number;
    hardnessMgL?: number;
    alkalinityMgL?: number;
    chlorideMgL?: number;
    sulfateMgL?: number;
    nitrateMgL_asN?: number;
    ammoniaMgL_asN?: number;
  };

  suitability: Array<{
    useCase: "Cooling" | "Irrigation" | "Process Wash" | "Construction" | "Reject";
    score: number; // 0-100
    reason: string;
  }>;

  flags: Array<{ level: "info" | "warning" | "critical"; message: string }>;
  missing: string[];
};

// UI-only mock (replace later with API response)
const MOCK: ExtractedWaterPassport = {
  reportName: "hydrosync_sample_suppliers.pdf",
  extractedAt: new Date().toISOString(),
  confidence: 0.86,
  facility: {
    name: "Acme Manufacturing",
    city: "San Francisco",
    state: "CA",
    sampleTime: "2026-02-14 09:10 AM",
  },
  metrics: {
    ph: 7.4,
    turbidityNTU: 3.2,
    tdsMgL: 980,
    tssMgL: 22,
    conductivityUsCm: 1600,
    hardnessMgL: 180,
    alkalinityMgL: 120,
    chlorideMgL: 220,
    sulfateMgL: 180,
    nitrateMgL_asN: 2.1,
    ammoniaMgL_asN: 0.4,
  },
  suitability: [
    {
      useCase: "Cooling",
      score: 88,
      reason: "pH is stable, turbidity low, and TDS within typical cooling reuse ranges. Watch chloride levels to reduce corrosion risk.",
    },
    {
      useCase: "Process Wash",
      score: 74,
      reason: "Generally usable; consider filtration if wash requires very low TSS.",
    },
    {
      useCase: "Irrigation",
      score: 62,
      reason: "Possible, but salinity (TDS) may be high for sensitive crops; check local guidelines.",
    },
  ],
  flags: [
    { level: "warning", message: "Chloride is moderately high; corrosion inhibitors may be needed for cooling." },
    { level: "info", message: "All key core metrics extracted successfully." },
  ],
  missing: ["COD", "BOD", "Total Nitrogen", "Total Phosphorus"],
};

export default function ProducerReviewPage() {
  const router = useRouter();
  const [passport, setPassport] = useState<ExtractedWaterPassport>(MOCK);

  useEffect(() => {
    const role = localStorage.getItem("hydrosync_role");
    const userId = localStorage.getItem("hydrosync_userId");

    if (!userId) {
      router.replace("/login");
      return;
    }
    if (role !== "producer") {
      router.replace("/dashboard");
      return;
    }

    // Later: fetch extracted results from backend using reportId:
    // fetch(`/api/producer/report/${reportId}`)
  }, [router]);

  const topUseCase = useMemo(() => {
    return [...passport.suitability].sort((a, b) => b.score - a.score)[0];
  }, [passport.suitability]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Producer Console</p>
            <h1 className="text-xl font-semibold tracking-tight">Water Passport Review</h1>
            <p className="text-sm text-muted-foreground">
              Verify extracted lab values and publish suitability results.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/producer/upload")}>
              Back
            </Button>
            <Button
              onClick={() => alert("Publish flow later: save confirmed passport + mark as publishable")}
            >
              Confirm & Publish
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-3">
        {/* Left main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary card */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-sm font-semibold">Extraction Summary</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Report: <span className="font-medium text-slate-800">{passport.reportName}</span> • Extracted{" "}
                  {new Date(passport.extractedAt).toLocaleString()}
                </div>
              </div>

              <ConfidenceBadge value={passport.confidence} />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Pill label="Facility" value={passport.facility.name || "—"} />
              <Pill label="Location" value={`${passport.facility.city || "—"}, ${passport.facility.state || "—"}`} />
              <Pill label="Sample Time" value={passport.facility.sampleTime || "—"} />
            </div>
          </div>

          {/* Metrics grid */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Water Quality Metrics</h2>
                <p className="text-xs text-muted-foreground">
                  Review values. Later you can edit if the lab report had a parsing mistake.
                </p>
              </div>
              <Button variant="outline" disabled>
                Edit values (soon)
              </Button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Metric title="pH" value={passport.metrics.ph} unit="" goodRange="6.5–8.5" />
              <Metric title="Turbidity" value={passport.metrics.turbidityNTU} unit="NTU" goodRange="< 5" />
              <Metric title="TDS" value={passport.metrics.tdsMgL} unit="mg/L" goodRange="< 1200" />
              <Metric title="TSS" value={passport.metrics.tssMgL} unit="mg/L" goodRange="< 30" />
              <Metric title="Conductivity" value={passport.metrics.conductivityUsCm} unit="µS/cm" goodRange="—" />
              <Metric title="Hardness" value={passport.metrics.hardnessMgL} unit="mg/L as CaCO₃" goodRange="—" />
              <Metric title="Alkalinity" value={passport.metrics.alkalinityMgL} unit="mg/L as CaCO₃" goodRange="—" />
              <Metric title="Chloride" value={passport.metrics.chlorideMgL} unit="mg/L" goodRange="Lower better" />
              <Metric title="Sulfate" value={passport.metrics.sulfateMgL} unit="mg/L" goodRange="—" />
            </div>

            {/* Missing */}
            {passport.missing.length > 0 && (
              <div className="mt-5 rounded-xl border bg-slate-50 p-4">
                <div className="text-sm font-medium">Missing from report</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {passport.missing.join(" • ")}
                </div>
              </div>
            )}
          </div>

          {/* Suitability */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold">Suitability Recommendation</h2>
                <p className="text-xs text-muted-foreground">
                  HydroSync recommends the best reuse industries based on extracted values.
                </p>
              </div>
              {topUseCase && <TopUseCaseBadge useCase={topUseCase.useCase} score={topUseCase.score} />}
            </div>

            <div className="mt-5 space-y-3">
              {passport.suitability
                .slice()
                .sort((a, b) => b.score - a.score)
                .map((s) => (
                  <SuitabilityRow key={s.useCase} useCase={s.useCase} score={s.score} reason={s.reason} />
                ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold">Flags & Checks</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Issues that may affect reuse or require treatment.
            </p>

            <div className="mt-4 space-y-3">
              {passport.flags.length === 0 ? (
                <div className="text-sm text-muted-foreground">No flags.</div>
              ) : (
                passport.flags.map((f, idx) => (
                  <FlagRow key={idx} level={f.level} message={f.message} />
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold">Before you publish</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• Confirm values match the PDF.</li>
              <li>• Publish makes this batch visible to consumers.</li>
              <li>• You can republish with updated lab results later.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI pieces ---------- */

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 85 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
    pct >= 70 ? "bg-amber-50 text-amber-700 border-amber-200" :
                "bg-red-50 text-red-700 border-red-200";

  return (
    <div className={`rounded-full border px-3 py-1 text-xs font-medium ${color}`}>
      Extraction Confidence: {pct}%
    </div>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-slate-50 px-4 py-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function Metric({
  title,
  value,
  unit,
  goodRange,
}: {
  title: string;
  value?: number;
  unit: string;
  goodRange: string;
}) {
  const display = value === undefined || value === null ? "—" : value.toString();

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="mt-1 text-lg font-semibold">
        {display} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
      </div>
      <div className="text-xs text-muted-foreground">Target: {goodRange}</div>
    </div>
  );
}

function TopUseCaseBadge({ useCase, score }: { useCase: string; score: number }) {
  return (
    <div className="rounded-xl border bg-black px-4 py-3 text-white">
      <div className="text-xs opacity-80">Best Fit</div>
      <div className="text-sm font-semibold">{useCase}</div>
      <div className="text-xs opacity-80">{score}/100 match</div>
    </div>
  );
}

function SuitabilityRow({ useCase, score, reason }: { useCase: string; score: number; reason: string }) {
  return (
    <div className="rounded-xl border bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">{useCase}</div>
        <div className="rounded-full border bg-white px-3 py-1 text-xs font-medium">
          {score}/100
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{reason}</p>

      {/* simple progress bar */}
      <div className="mt-3 h-2 w-full rounded-full bg-white">
        <div className="h-2 rounded-full bg-black" style={{ width: `${Math.min(100, Math.max(0, score))}%` }} />
      </div>
    </div>
  );
}

function FlagRow({ level, message }: { level: "info" | "warning" | "critical"; message: string }) {
  const style =
    level === "info"
      ? "bg-slate-50 text-slate-700 border-slate-200"
      : level === "warning"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-red-50 text-red-700 border-red-200";

  const label = level === "info" ? "Info" : level === "warning" ? "Warning" : "Critical";

  return (
    <div className={`rounded-xl border p-4 ${style}`}>
      <div className="text-xs font-semibold">{label}</div>
      <div className="mt-1 text-sm">{message}</div>
    </div>
  );
}