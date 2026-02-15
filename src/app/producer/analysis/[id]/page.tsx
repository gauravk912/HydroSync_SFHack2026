// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { getIndustryDisplayName } from "@/ml/industryLabel";

// type Report = {
//   _id: string;

//   company_name?: string | null;
//   location?: string | null;
//   producer_industry_type?: string | null;
//   extracted_at?: string | Date | null;

//   // extracted numeric fields (mongo format)
//   ph?: number | null;
//   temperature_C?: number | null;
//   turbidity_NTU?: number | null;
//   color_PtCo?: number | null;
//   tds_mg_L?: number | null;
//   tss_mg_L?: number | null;
//   bod5_mg_L?: number | null;
//   cod_mg_L?: number | null;
//   free_chlorine_mg_L?: number | null;
//   total_coliform_CFU_100mL?: number | null;
//   hardness_mg_L_as_CaCO3?: number | null;
//   chloride_mg_L?: number | null;
//   sulfate_mg_L?: number | null;
//   silica_mg_L?: number | null;
//   iron_mg_L?: number | null;
//   manganese_mg_L?: number | null;
//   oil_and_grease_mg_L?: number | null;
//   electrical_conductivity_uS_cm?: number | null;

//   // ✅ optional fields saved after analysis (if your API stores them)
//   model_output?: {
//     recommended?: string | null;
//     confidence?: number | null;
//     top5?: Array<{ industry: string; probability: number }>;
//     compatible_count?: number;
//     rejected_count?: number;
//     compatible?: string[];
//     rejected?: string[];
//   } | null;

//   gemini_summary?: string | null;
// };

// type PredictResponse = {
//   input: Record<string, any>;
//   summary: {
//     recommended: string | null;
//     confidence: number | null;
//     countCompatible: number;
//     countRejected: number;
//   };
//   top5: Array<{ rank: number; industry: string; probability: number }>;
//   compatible: Array<{ industry: string; compatible: number; prob: number }>;
//   rejected: Array<{ industry: string; compatible: number; prob: number }>;
// };

// function Card({ title, children }: { title?: string; children: React.ReactNode }) {
//   return (
//     <div className="rounded-2xl border bg-white p-6 shadow-sm">
//       {title ? <h2 className="text-sm font-semibold">{title}</h2> : null}
//       {title ? <div className="mt-3">{children}</div> : children}
//     </div>
//   );
// }

// function Metric({ label, value }: { label: string; value: string }) {
//   return (
//     <div className="rounded-xl border bg-slate-50 p-4">
//       <div className="text-xs text-muted-foreground">{label}</div>
//       <div className="mt-1 text-base font-semibold">{value}</div>
//     </div>
//   );
// }

// function fmt(v: any) {
//   return v === null || v === undefined || v === "" ? "—" : String(v);
// }

// /**
//  * ✅ CRITICAL: model expects feature names exactly like:
//  * "pH", "temperature_C", "turbidity_NTU", ...
//  * but DB uses "ph" so we map ph -> pH
//  */
// function buildModelInputFromReport(r: Report) {
//   return {
//     pH: r.ph ?? null,
//     temperature_C: r.temperature_C ?? null,
//     turbidity_NTU: r.turbidity_NTU ?? null,
//     color_PtCo: r.color_PtCo ?? null,
//     tds_mg_L: r.tds_mg_L ?? null,
//     tss_mg_L: r.tss_mg_L ?? null,
//     bod5_mg_L: r.bod5_mg_L ?? null,
//     cod_mg_L: r.cod_mg_L ?? null,
//     free_chlorine_mg_L: r.free_chlorine_mg_L ?? null,
//     total_coliform_CFU_100mL: r.total_coliform_CFU_100mL ?? null,
//     hardness_mg_L_as_CaCO3: r.hardness_mg_L_as_CaCO3 ?? null,
//     chloride_mg_L: r.chloride_mg_L ?? null,
//     sulfate_mg_L: r.sulfate_mg_L ?? null,
//     silica_mg_L: r.silica_mg_L ?? null,
//     iron_mg_L: r.iron_mg_L ?? null,
//     manganese_mg_L: r.manganese_mg_L ?? null,
//     oil_and_grease_mg_L: r.oil_and_grease_mg_L ?? null,
//     electrical_conductivity_uS_cm: r.electrical_conductivity_uS_cm ?? null,
//   };
// }

// export default function ProducerAnalysisPage() {
//   const router = useRouter();
//   const params = useParams();
//   const id = params?.id as string | undefined;

//   const [report, setReport] = useState<Report | null>(null);
//   const [pred, setPred] = useState<PredictResponse | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState<string | null>(null);

//   const [summaryText, setSummaryText] = useState<string | null>(null);
//   const [summaryLoading, setSummaryLoading] = useState(false);
//   const [summaryErr, setSummaryErr] = useState<string | null>(null);

//   const modelInput = useMemo(() => (report ? buildModelInputFromReport(report) : null), [report]);

//   useEffect(() => {
//     if (!id) {
//       setErr("Missing report id in route.");
//       setLoading(false);
//       return;
//     }

//     async function run() {
//       try {
//         setLoading(true);

//         // 1) Fetch report
//         const r1 = await fetch(`/api/reports/${id}`);
//         const reportJson = await r1.json();
//         if (!r1.ok) throw new Error(reportJson?.error || "Failed to load report");
//         setReport(reportJson);

//         // ✅ If already analyzed & saved in Mongo, just show it (no need to recompute)
//         if (reportJson?.gemini_summary) {
//           setSummaryText(reportJson.gemini_summary);
//         }

//         // 2) Call predict
//         const sample = buildModelInputFromReport(reportJson);
//         const r2 = await fetch("/api/predict", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(sample),
//         });

//         const predJson = await r2.json();
//         if (!r2.ok) throw new Error(predJson?.error || "Prediction failed");
//         setPred(predJson);

//         // 3) Generate summary + ✅ SAVE it in Mongo
//         setSummaryLoading(true);
//         setSummaryErr(null);

//         try {
//           const res3 = await fetch("/api/analysis-summary", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               reportId: id, // ✅ CRITICAL FIX (so backend can update Mongo)
//               reportMeta: {
//                 company_name: reportJson.company_name ?? null,
//                 location: reportJson.location ?? null,
//               },
//               sample, // model input
//               prediction: predJson,
//             }),
//           });

//           const sumJson = await res3.json();
//           if (!res3.ok) throw new Error(sumJson?.error || "Summary failed");
//           setSummaryText(sumJson.summary);
//         } catch (e: any) {
//           setSummaryErr(e?.message || "Summary failed");
//           setSummaryText(null);
//         } finally {
//           setSummaryLoading(false);
//         }
//       } catch (e: any) {
//         setErr(e?.message || "Something went wrong");
//       } finally {
//         setLoading(false);
//       }
//     }

//     run();
//   }, [id]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-slate-50">
//         <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
//           <div className="flex items-start justify-between gap-4">
//             <div>
//               <p className="text-xs font-medium text-muted-foreground">Producer Console</p>
//               <h1 className="text-xl font-semibold tracking-tight">Water Analysis Report</h1>
//               <p className="text-sm text-muted-foreground">Running industry compatibility model…</p>
//             </div>
//             <Button variant="outline" onClick={() => router.push(`/producer/review/${id}`)}>
//               Back
//             </Button>
//           </div>

//           <Card>
//             <p className="text-sm text-muted-foreground">Loading report + prediction…</p>
//           </Card>
//         </div>
//       </div>
//     );
//   }

//   if (err) {
//     return (
//       <div className="min-h-screen bg-slate-50">
//         <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
//           <div className="flex items-start justify-between gap-4">
//             <div>
//               <p className="text-xs font-medium text-muted-foreground">Producer Console</p>
//               <h1 className="text-xl font-semibold tracking-tight">Water Analysis Report</h1>
//             </div>
//             <Button variant="outline" onClick={() => router.push(`/producer/review/${id}`)}>
//               Back
//             </Button>
//           </div>

//           <Card title="Error">
//             <p className="text-sm text-red-600">{err}</p>
//           </Card>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50">
//       <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
//         <div className="flex items-start justify-between gap-4">
//           <div>
//             <p className="text-xs font-medium text-muted-foreground">Producer Console</p>
//             <h1 className="text-xl font-semibold tracking-tight">Water Analysis Report</h1>
//             <p className="text-sm text-muted-foreground">
//               Predicted best-fit consumer industries based on extracted water parameters.
//             </p>
//           </div>

//           <Button variant="outline" onClick={() => router.push(`/producer/review/${id}`)}>
//             Back
//           </Button>
//         </div>

//         {/* Summary */}
//         <Card title="Summary">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <Metric
//               label="Recommended"
//               value={
//                 pred?.summary.recommended ? getIndustryDisplayName(pred.summary.recommended) : "—"
//               }
//             />
//             <Metric
//               label="Confidence"
//               value={
//                 pred?.summary.confidence == null ? "—" : `${(pred.summary.confidence * 100).toFixed(1)}%`
//               }
//             />
//             <Metric label="Compatible industries" value={fmt(pred?.summary.countCompatible)} />
//             <Metric label="Rejected industries" value={fmt(pred?.summary.countRejected)} />
//           </div>
//         </Card>

//         {/* Top 5 */}
//         <Card title="Top 5 Recommendations">
//           <div className="overflow-hidden rounded-xl border">
//             <table className="w-full text-sm">
//               <thead className="bg-slate-50">
//                 <tr className="text-left">
//                   <th className="px-4 py-3">Rank</th>
//                   <th className="px-4 py-3">Industry</th>
//                   <th className="px-4 py-3">Probability</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {(pred?.top5 || []).map((r) => (
//                   <tr key={r.rank} className="border-t">
//                     <td className="px-4 py-3">{r.rank}</td>
//                     <td className="px-4 py-3 font-medium">{getIndustryDisplayName(r.industry)}</td>
//                     <td className="px-4 py-3">{(r.probability * 100).toFixed(2)}%</td>
//                   </tr>
//                 ))}
//                 {!pred?.top5 || pred.top5.length === 0 ? (
//                   <tr className="border-t">
//                     <td className="px-4 py-3 text-muted-foreground" colSpan={3}>
//                       No compatible industries found at the current threshold.
//                     </td>
//                   </tr>
//                 ) : null}
//               </tbody>
//             </table>
//           </div>
//         </Card>

//         {/* Gemini Summary */}
//         <Card title="Model Analysis Summary">
//           <div className="rounded-xl border bg-slate-50 p-4 text-sm leading-relaxed">
//             {summaryLoading && (
//               <span className="text-muted-foreground">Generating summary with Gemini…</span>
//             )}

//             {!summaryLoading && summaryErr && <span className="text-red-600">{summaryErr}</span>}

//             {!summaryLoading && !summaryErr && summaryText && (
//               <span>
//                 {summaryText.replace(
//                   /\b(cooling_once_through|cooling_recirculating_towers|boiler_makeup_refinery_feed|pulp_paper_chemical_unbleached|pulp_paper_bleached|chemical_manufacturing_process|petrochemical_coal_process|textiles_sizing_suspension|textiles_scouring_bleach_dye|cement_concrete_aggregate_wash)\b/g,
//                   (m) => getIndustryDisplayName(m)
//                 )}
//               </span>
//             )}

//             {!summaryLoading && !summaryErr && !summaryText && (
//               <span className="text-muted-foreground">No summary available.</span>
//             )}
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// }




"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getIndustryDisplayName } from "@/ml/industryLabel";

type Report = {
  _id: string;

  company_name?: string | null;
  location?: string | null;
  producer_industry_type?: string | null;
  extracted_at?: string | Date | null;

  // extracted numeric fields (mongo format)
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

  // optional fields saved after analysis (if your API stores them)
  model_output?: {
    recommended?: string | null;
    confidence?: number | null;
    top5?: Array<{ industry: string; probability: number }>;
    compatible_count?: number;
    rejected_count?: number;
    compatible?: string[];
    rejected?: string[];
  } | null;

  gemini_summary?: string | null;
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

function fmt(v: any) {
  return v === null || v === undefined || v === "" ? "—" : String(v);
}

/**
 * model expects:
 * "pH", "temperature_C", "turbidity_NTU", ...
 * DB uses "ph" so we map ph -> pH
 */
function buildModelInputFromReport(r: Report) {
  return {
    pH: r.ph ?? null,
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

/* ---------------- UI helpers ---------------- */

function SectionTitle({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

function GradientCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "relative rounded-3xl p-[1px]",
        "dark:bg-gradient-to-r dark:from-emerald-500/60 dark:via-sky-500/60 dark:to-indigo-500/60",
        className ?? "",
      ].join(" ")}
    >
      <div className="relative overflow-hidden rounded-3xl border bg-card p-6 shadow-sm dark:border-transparent md:p-8">
        {/* subtle outer glow (dark only) */}
        <div
          className="
            pointer-events-none absolute -inset-1 -z-10 hidden dark:block
            blur-2xl opacity-60
            bg-gradient-to-r from-emerald-500/20 via-sky-500/20 to-indigo-500/20
          "
        />

        {/* subtle water wave tint */}
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
          <div className="absolute -top-24 left-1/2 h-48 w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-400/10 via-sky-400/10 to-indigo-400/10 blur-3xl" />
          <svg
            className="absolute bottom-0 left-0 right-0 w-full opacity-30"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,64 C120,32 240,32 360,64 C480,96 600,96 720,64 C840,32 960,32 1080,64 C1200,96 1320,96 1440,64 L1440,120 L0,120 Z"
              fill="currentColor"
              className="text-sky-500/20"
            />
          </svg>
        </div>

        {children}
      </div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
  right,
}: {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">
      {title ? (
        <div className="mb-5">
          <SectionTitle title={title} subtitle={subtitle} right={right} />
        </div>
      ) : null}
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border bg-background/50 p-4">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-black tracking-tight">{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

function BadgePill({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center rounded-full border bg-background/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
      {children}
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-foreground/70" style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ---------------- Page ---------------- */

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

        // 1) Fetch report
        const r1 = await fetch(`/api/reports/${id}`);
        const reportJson = await r1.json();
        if (!r1.ok) throw new Error(reportJson?.error || "Failed to load report");
        setReport(reportJson);

        // If already summarized & saved in Mongo, show it immediately
        if (reportJson?.gemini_summary) {
          setSummaryText(reportJson.gemini_summary);
        }

        // 2) Predict
        const sample = buildModelInputFromReport(reportJson);
        const r2 = await fetch("/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sample),
        });

        const predJson = await r2.json();
        if (!r2.ok) throw new Error(predJson?.error || "Prediction failed");
        setPred(predJson);

        // 3) Generate summary + save in Mongo
        setSummaryLoading(true);
        setSummaryErr(null);

        try {
          const res3 = await fetch("/api/analysis-summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reportId: id,
              reportMeta: {
                company_name: reportJson.company_name ?? null,
                location: reportJson.location ?? null,
              },
              sample,
              prediction: predJson,
            }),
          });

          const sumJson = await res3.json();
          if (!res3.ok) throw new Error(sumJson?.error || "Summary failed");
          setSummaryText(sumJson.summary);
        } catch (e: any) {
          setSummaryErr(e?.message || "Summary failed");
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

  const recommendedDisplay = pred?.summary?.recommended
    ? getIndustryDisplayName(pred.summary.recommended)
    : "—";

  const confidencePct =
    pred?.summary?.confidence == null ? null : pred.summary.confidence * 100;

  const headerBack = (
    <Button variant="outline" onClick={() => router.push(`/producer/review/${id}`)}>
      Back
    </Button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* Background glow */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute left-1/2 top-[-140px] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-400/20 via-sky-400/15 to-transparent blur-3xl" />
          <div className="absolute bottom-[-220px] right-[-180px] h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-indigo-400/15 via-sky-400/10 to-transparent blur-3xl" />
        </div>

        {/* Top bar */}
        <div className="sticky top-0 z-20 border-b bg-background/70 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="inline-flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-foreground text-background">
                  <span className="text-sm font-black">H</span>
                </div>
              </Link>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Producer Console</p>
                <h1 className="text-xl font-semibold tracking-tight">Water Analysis Report</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              {headerBack}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
          <GradientCard>
            <SectionTitle
              title="Running compatibility model…"
              subtitle="Loading report + prediction. This usually takes a few seconds."
              right={<BadgePill>Processing</BadgePill>}
            />
            <div className="mt-6 grid gap-3 md:grid-cols-4">
              <div className="h-20 rounded-2xl border bg-background/50" />
              <div className="h-20 rounded-2xl border bg-background/50" />
              <div className="h-20 rounded-2xl border bg-background/50" />
              <div className="h-20 rounded-2xl border bg-background/50" />
            </div>
          </GradientCard>

          <Card title="Details">
            <p className="text-sm text-muted-foreground">
              Pulling extracted parameters and generating a Water Passport-style explanation…
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* Background glow */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute left-1/2 top-[-140px] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-400/20 via-sky-400/15 to-transparent blur-3xl" />
          <div className="absolute bottom-[-220px] right-[-180px] h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-indigo-400/15 via-sky-400/10 to-transparent blur-3xl" />
        </div>

        <div className="sticky top-0 z-20 border-b bg-background/70 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Producer Console</p>
              <h1 className="text-xl font-semibold tracking-tight">Water Analysis Report</h1>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {headerBack}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 py-8">
          <Card title="Error" subtitle="We couldn’t generate this report.">
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {err}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background glow (match landing/auth theme) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-140px] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-400/20 via-sky-400/15 to-transparent blur-3xl" />
        <div className="absolute bottom-[-220px] right-[-180px] h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-indigo-400/15 via-sky-400/10 to-transparent blur-3xl" />
      </div>

      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-foreground text-background">
                <span className="text-sm font-black">H</span>
              </div>
              <div className="leading-tight hidden sm:block">
                <div className="text-sm font-extrabold">HydroSync</div>
                <div className="text-[11px] text-muted-foreground">Producer Console</div>
              </div>
            </Link>

            <div className="ml-2">
              <h1 className="text-xl font-semibold tracking-tight">Water Analysis Report</h1>
              <p className="text-sm text-muted-foreground">
                Predicted best-fit consumer industries based on extracted water parameters.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {headerBack}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        {/* HERO SUMMARY */}
        <GradientCard>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <BadgePill>Water Passport • Model Output</BadgePill>
              <h2 className="mt-3 text-2xl font-black tracking-tight">
                Recommended :{" "}
                <span className="className=
    bg-gradient-to-r from-emerald-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent
    dark:bg-none dark:text-white dark:text-opacity-95 dark:[-webkit-text-fill-color:unset]
  ">
                  {recommendedDisplay}
                </span>
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                This recommendation is based on your extracted metrics (pH, salinity, turbidity, COD/BOD,
                disinfection indicators, and mineral constraints). Review the Top 5 list and the Gemini
                explanation below.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => router.push(`/producer/review/${id}`)}>
                Edit inputs
              </Button>
              <Button onClick={() => router.push("/producer/upload")}>New upload</Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4">
            <Stat label="Recommended" value={recommendedDisplay} hint="Best-fit consumer segment" />
            <Stat
              label="Confidence"
              value={confidencePct == null ? "—" : `${confidencePct.toFixed(1)}%`}
              hint="Model certainty for top pick"
            />
            <Stat
              label="Compatible"
              value={fmt(pred?.summary?.countCompatible)}
              hint="Meets constraints at threshold"
            />
            <Stat
              label="Rejected"
              value={fmt(pred?.summary?.countRejected)}
              hint="Likely constraint violations"
            />
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Confidence meter</span>
              <span>{confidencePct == null ? "—" : `${confidencePct.toFixed(0)} / 100`}</span>
            </div>
            <ProgressBar value={confidencePct ?? 0} />
          </div>
        </GradientCard>

        {/* TOP 5 */}
        <Card
          title="Top 5 Recommendations"
          subtitle="Ranked consumer industries with predicted probability."
          right={<BadgePill>Sorted by probability</BadgePill>}
        >
          <div className="overflow-hidden rounded-2xl border bg-background/40">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold">Rank</th>
                  <th className="px-4 py-3 font-semibold">Industry</th>
                  <th className="px-4 py-3 font-semibold">Probability</th>
                </tr>
              </thead>
              <tbody>
                {(pred?.top5 || []).map((r) => {
                  const pct = r.probability * 100;
                  return (
                    <tr key={r.rank} className="border-t">
                      <td className="px-4 py-3">{r.rank}</td>
                      <td className="px-4 py-3 font-semibold">
                        {getIndustryDisplayName(r.industry)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-40 max-w-[40vw]">
                            <ProgressBar value={pct} />
                          </div>
                          <span className="text-muted-foreground">{pct.toFixed(2)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {!pred?.top5 || pred.top5.length === 0 ? (
                  <tr className="border-t">
                    <td className="px-4 py-4 text-muted-foreground" colSpan={3}>
                      No compatible industries found at the current threshold.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>

        {/* GEMINI SUMMARY */}
        <Card
          title="Model Analysis Summary"
          subtitle="Evidence-style explanation (Gemini)."
          right={
            summaryLoading ? (
              <BadgePill>Generating…</BadgePill>
            ) : summaryErr ? (
              <BadgePill>Error</BadgePill>
            ) : (
              <BadgePill>Explainable</BadgePill>
            )
          }
        >
          <div className="rounded-2xl border bg-background/50 p-4 text-sm leading-relaxed">
            {summaryLoading && (
              <span className="text-muted-foreground">
                Generating explanation with Gemini…
              </span>
            )}

            {!summaryLoading && summaryErr && (
              <span className="text-destructive">{summaryErr}</span>
            )}

            {!summaryLoading && !summaryErr && summaryText && (
              <span>
                {summaryText.replace(
                  /\b(cooling_once_through|cooling_recirculating_towers|boiler_makeup_refinery_feed|pulp_paper_chemical_unbleached|pulp_paper_bleached|chemical_manufacturing_process|petrochemical_coal_process|textiles_sizing_suspension|textiles_scouring_bleach_dye|cement_concrete_aggregate_wash)\b/g,
                  (m) => getIndustryDisplayName(m)
                )}
              </span>
            )}

            {!summaryLoading && !summaryErr && !summaryText && (
              <span className="text-muted-foreground">No summary available.</span>
            )}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border bg-background/50 p-4">
              <div className="text-sm font-semibold">Traceability</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Your PDF remains linked to this output so consumers can trust the evidence trail.
              </p>
            </div>
            <div className="rounded-2xl border bg-background/50 p-4">
              <div className="text-sm font-semibold">Constraint fit</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Recommendations prioritize industries where your metrics likely meet operational limits.
              </p>
            </div>
            <div className="rounded-2xl border bg-background/50 p-4">
              <div className="text-sm font-semibold">Action-ready</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Next step: share the draft in Review, then publish the Water Passport.
              </p>
            </div>
          </div>
        </Card>

        {/* Optional: quick “inputs used” */}
        <Card title="Inputs used" subtitle="Snapshot of the model features (from your extracted report).">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {modelInput
              ? Object.entries(modelInput).map(([k, v]) => (
                  <div key={k} className="rounded-2xl border bg-background/50 p-4">
                    <div className="text-xs font-semibold text-muted-foreground">{k}</div>
                    <div className="mt-1 text-sm font-semibold">{fmt(v)}</div>
                  </div>
                ))
              : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
