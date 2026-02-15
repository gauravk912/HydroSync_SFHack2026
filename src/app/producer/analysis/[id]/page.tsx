"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getIndustryDisplayName } from "@/ml/industryLabel";

type Report = {
  _id: string;

  company_name?: string | null;
  location?: string | null;
  producer_industry_type?: string | null;
  extracted_at?: string | Date | null;

  // extracted numeric fields (your mongo format)
  ph?: number | null;
  temperature_C?: number | null;
  turbidity_NTU?: number | null;
  color_PtCo?: number | null;
  tds_mg_L?: number | null;
  tss_mg_L?: number | null;
  bod5_mg_L?: number | null;
  cod_mg_L?: number | null;
  free_chlorine_mg_L?: number | null;
  total_coliform_CFU_100mL?: number | null;
  hardness_mg_L_as_CaCO3?: number | null;
  chloride_mg_L?: number | null;
  sulfate_mg_L?: number | null;
  silica_mg_L?: number | null;
  iron_mg_L?: number | null;
  manganese_mg_L?: number | null;
  oil_and_grease_mg_L?: number | null;
  electrical_conductivity_uS_cm?: number | null;
};

type PredictResponse = {
  input: Record<string, any>;
  summary: {
    recommended: string | null;
    confidence: number | null;
    countCompatible: number;
    countRejected: number;
  };
  top5: Array<{ rank: number; industry: string; probability: number }>;
  compatible: Array<{ industry: string; compatible: number; prob: number }>;
  rejected: Array<{ industry: string; compatible: number; prob: number }>;
};

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      {title ? <h2 className="text-sm font-semibold">{title}</h2> : null}
      {title ? <div className="mt-3">{children}</div> : children}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-slate-50 p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-base font-semibold">{value}</div>
    </div>
  );
}

function fmt(v: any) {
  return v === null || v === undefined || v === "" ? "—" : String(v);
}

/**
 * ✅ CRITICAL: model expects feature names exactly like:
 * "pH", "temperature_C", "turbidity_NTU", ...
 * but your DB fields are like: ph, temperature_C, turbidity_NTU...
 * so we map ph -> pH and keep the rest as-is
 */
function buildModelInputFromReport(r: Report) {
  return {
    pH: r.ph ?? null, // IMPORTANT mapping
    temperature_C: r.temperature_C ?? null,
    turbidity_NTU: r.turbidity_NTU ?? null,
    color_PtCo: r.color_PtCo ?? null,
    tds_mg_L: r.tds_mg_L ?? null,
    tss_mg_L: r.tss_mg_L ?? null,
    bod5_mg_L: r.bod5_mg_L ?? null,
    cod_mg_L: r.cod_mg_L ?? null,
    free_chlorine_mg_L: r.free_chlorine_mg_L ?? null,
    total_coliform_CFU_100mL: r.total_coliform_CFU_100mL ?? null,
    hardness_mg_L_as_CaCO3: r.hardness_mg_L_as_CaCO3 ?? null,
    chloride_mg_L: r.chloride_mg_L ?? null,
    sulfate_mg_L: r.sulfate_mg_L ?? null,
    silica_mg_L: r.silica_mg_L ?? null,
    iron_mg_L: r.iron_mg_L ?? null,
    manganese_mg_L: r.manganese_mg_L ?? null,
    oil_and_grease_mg_L: r.oil_and_grease_mg_L ?? null,
    electrical_conductivity_uS_cm: r.electrical_conductivity_uS_cm ?? null,
  };
}

export default function ProducerAnalysisPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  const [report, setReport] = useState<Report | null>(null);
  const [pred, setPred] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryErr, setSummaryErr] = useState<string | null>(null);


  const modelInput = useMemo(() => (report ? buildModelInputFromReport(report) : null), [report]);

  useEffect(() => {
    if (!id) {
      setErr("Missing report id in route.");
      setLoading(false);
      return;
    }

    async function run() {
      try {
        setLoading(true);

        // 1) fetch report
        const r1 = await fetch(`/api/reports/${id}`);
        const reportJson = await r1.json();
        if (!r1.ok) throw new Error(reportJson?.error || "Failed to load report");
        setReport(reportJson);

        // 2) call predict
        const sample = buildModelInputFromReport(reportJson);
        const r2 = await fetch("/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sample),
        });
        const predJson = await r2.json();
        if (!r2.ok) throw new Error(predJson?.error || "Prediction failed");

        setPred(predJson);
        setSummaryLoading(true);
        setSummaryErr(null);

        try {
        const res3 = await fetch("/api/analysis-summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            reportMeta: {
                company_name: reportJson.company_name ?? null,
                location: reportJson.location ?? null,
            },
            sample,          // the model input you sent to /api/predict
            prediction: predJson,
            }),
        });

        const sumJson = await res3.json();
        if (!res3.ok) throw new Error(sumJson?.error || "Summary failed");
        setSummaryText(sumJson.summary);
        } catch (e: any) {
        setSummaryErr(e.message);
        setSummaryText(null);
        } finally {
        setSummaryLoading(false);
        }

      } catch (e: any) {
        setErr(e?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Producer Console</p>
              <h1 className="text-xl font-semibold tracking-tight">Water Analysis Report</h1>
              <p className="text-sm text-muted-foreground">Running industry compatibility model…</p>
            </div>
            <Button variant="outline" onClick={() => router.push(`/producer/review/${id}`)}>
              Back
            </Button>
          </div>

          <Card>
            <p className="text-sm text-muted-foreground">Loading report + prediction…</p>
          </Card>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Producer Console</p>
              <h1 className="text-xl font-semibold tracking-tight">Water Analysis Report</h1>
            </div>
            <Button variant="outline" onClick={() => router.push(`/producer/review/${id}`)}>
              Back
            </Button>
          </div>

          <Card title="Error">
            <p className="text-sm text-red-600">{err}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Producer Console</p>
            <h1 className="text-xl font-semibold tracking-tight">Water Analysis Report</h1>
            <p className="text-sm text-muted-foreground">
              Predicted best-fit consumer industries based on extracted water parameters.
            </p>
          </div>

          <Button variant="outline" onClick={() => router.push(`/producer/review/${id}`)}>
            Back
          </Button>
        </div>

        {/* Summary */}
        <Card title="Summary">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Metric
                label="Recommended"
                value={
                    pred?.summary.recommended
                    ? getIndustryDisplayName(pred.summary.recommended)
                    : "—"
                }
            />
            <Metric
              label="Confidence"
              value={pred?.summary.confidence == null ? "—" : `${(pred.summary.confidence * 100).toFixed(1)}%`}
            />
            <Metric label="Compatible industries" value={fmt(pred?.summary.countCompatible)} />
            <Metric label="Rejected industries" value={fmt(pred?.summary.countRejected)} />
          </div>
        </Card>

        {/* Top 5 */}
        <Card title="Top 5 Recommendations">
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left">
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Industry</th>
                  <th className="px-4 py-3">Probability</th>
                </tr>
              </thead>
              <tbody>
                {(pred?.top5 || []).map((r) => (
                  <tr key={r.rank} className="border-t">
                    <td className="px-4 py-3">{r.rank}</td>
                    <td className="px-4 py-3 font-medium">
                        {getIndustryDisplayName(r.industry)}
                    </td>
                    <td className="px-4 py-3">{(r.probability * 100).toFixed(2)}%</td>
                  </tr>
                ))}
                {(!pred?.top5 || pred.top5.length === 0) ? (
                  <tr className="border-t">
                    <td className="px-4 py-3 text-muted-foreground" colSpan={3}>
                      No compatible industries found at the current threshold.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Debug / transparency (optional but nice for judges) */}
        <Card title="Model Analysis Summary">
        <div className="rounded-xl border bg-slate-50 p-4 text-sm leading-relaxed">
            {summaryLoading && (
            <span className="text-muted-foreground">
                Generating summary with Gemini…
            </span>
            )}

            {!summaryLoading && summaryErr && (
            <span className="text-red-600">
                {summaryErr}
            </span>
            )}

            {!summaryLoading && !summaryErr && summaryText && (
            <span>
                {summaryText
                    ? summaryText.replace(
                        /\b(cooling_once_through|cooling_recirculating_towers|boiler_makeup_refinery_feed|pulp_paper_chemical_unbleached|pulp_paper_bleached|chemical_manufacturing_process|petrochemical_coal_process|textiles_sizing_suspension|textiles_scouring_bleach_dye|cement_concrete_aggregate_wash)\b/g,
                        (m) => getIndustryDisplayName(m)
                    )
                : ""}
            </span>

            )}

            {!summaryLoading && !summaryErr && !summaryText && (
            <span className="text-muted-foreground">
                No summary available.
            </span>
            )}
        </div>
        </Card>

      </div>
    </div>
  );
}
