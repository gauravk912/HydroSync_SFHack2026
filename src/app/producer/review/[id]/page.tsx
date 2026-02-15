// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";

// type Report = {
//   _id: string;
//   company_name?: string | null;
//   location?: string | null;
//   producer_industry_type?: string | null;
//   extracted_at?: string | Date | null;

//   volume_available_gallons?: number | null;
//   treatment_method?: string | null;

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
// };

// function MetricCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
//   return (
//     <div className="rounded-xl border bg-slate-50 p-4">
//       <div className="text-xs text-muted-foreground">{title}</div>
//       <div className="mt-1 text-lg font-semibold">{value}</div>
//       {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
//     </div>
//   );
// }

// export default function ProducerReviewPage() {
//   const router = useRouter();
//   const params = useParams();
//   const id = params?.id as string | undefined;

//   const [data, setData] = useState<Report | null>(null);
//   const [err, setErr] = useState<string | null>(null);

//   useEffect(() => {
//     if (!id) {
//       setErr("Missing report id in route.");
//       return;
//     }

//     async function load() {
//       try {
//         const res = await fetch(`/api/reports/${id}`);
//         const json = await res.json();
//         if (!res.ok) throw new Error(json?.error || "Failed to load report");
//         setData(json);
//       } catch (e: any) {
//         setErr(e.message);
//       }
//     }

//     load();
//   }, [id]);

//   if (err) {
//     return (
//       <div className="min-h-screen bg-slate-50 p-8">
//         <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-6 shadow-sm">
//           <h1 className="text-xl font-semibold">Review Draft</h1>
//           <p className="mt-2 text-sm text-red-600">{err}</p>
//           <div className="mt-6">
//             <Button variant="outline" onClick={() => router.push("/producer/upload")}>
//               Back to Upload
//             </Button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!data) {
//     return (
//       <div className="min-h-screen bg-slate-50 p-8">
//         <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-6 shadow-sm">
//           <h1 className="text-xl font-semibold">Review Draft</h1>
//           <p className="mt-2 text-sm text-muted-foreground">Loading extracted values…</p>
//         </div>
//       </div>
//     );
//   }

//   const fmt = (v: any) => (v === null || v === undefined || v === "" ? "—" : String(v));

//   return (
//     <div className="min-h-screen bg-slate-50">
//       <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
//         <div className="flex items-start justify-between gap-4">
//           <div>
//             <p className="text-xs font-medium text-muted-foreground">Producer Console</p>
//             <h1 className="text-xl font-semibold tracking-tight">Review Draft</h1>
//             <p className="text-sm text-muted-foreground">
//               Confirm extracted values before publishing a Water Passport.
//             </p>
//           </div>
//           <Button variant="outline" onClick={() => router.push("/producer/upload")}>
//             Back
//           </Button>
//         </div>

//         <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">

//         {/* Row 1 — 5 Equal Boxes */}
//         <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//           <MetricCard title="Company" value={fmt(data.company_name)} />
//           <MetricCard title="Location" value={fmt(data.location)} />
//           <MetricCard title="Industry" value={fmt(data.producer_industry_type)} />
//           <MetricCard
//             title="Extracted at"
//             value={
//               data.extracted_at
//                 ? new Date(data.extracted_at as any).toLocaleString()
//                 : "—"
//             }
//           />
//           <MetricCard title="Volume (gal)" value={fmt(data.volume_available_gallons)} />
//         </div>

//         {/* Row 2 — Full Width Treatment */}
//         <div>
//           <div className="rounded-xl border bg-slate-50 p-4">
//             <div className="text-xs text-muted-foreground">Treatment</div>
//             <div className="mt-1 text-base font-medium leading-relaxed">
//               {fmt(data.treatment_method)}
//             </div>
//           </div>
//         </div>

//       </div>


//         <div className="rounded-2xl border bg-white p-6 shadow-sm">
//           <h2 className="text-sm font-semibold">Extraction Preview</h2>
//           <p className="text-xs text-muted-foreground mt-1">
//             These values were extracted from your PDF.
//           </p>

//           <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
//             <MetricCard title="pH" value={fmt(data.ph)} hint="Target: 6.5–8.5" />
//             <MetricCard title="TDS" value={fmt(data.tds_mg_L)} hint="mg/L" />
//             <MetricCard title="Turbidity" value={fmt(data.turbidity_NTU)} hint="NTU" />
//             <MetricCard title="COD" value={fmt(data.cod_mg_L)} hint="mg/L" />
//             <MetricCard title="BOD5" value={fmt(data.bod5_mg_L)} hint="mg/L" />
//             <MetricCard title="Temp" value={fmt(data.temperature_C)} hint="°C" />
//             <MetricCard title="TSS" value={fmt(data.tss_mg_L)} hint="mg/L" />
//             <MetricCard title="Conductivity" value={fmt(data.electrical_conductivity_uS_cm)} hint="µS/cm" />
//             <MetricCard title="Free Chlorine" value={fmt(data.free_chlorine_mg_L)} hint="mg/L" />
//             <MetricCard title="Total Coliform" value={fmt(data.total_coliform_CFU_100mL)} hint="CFU/100mL" />
//             <MetricCard title="Hardness" value={fmt(data.hardness_mg_L_as_CaCO3)} hint="mg/L as CaCO₃" />
//             <MetricCard title="Chloride" value={fmt(data.chloride_mg_L)} hint="mg/L" />
//             <MetricCard title="Sulfate" value={fmt(data.sulfate_mg_L)} hint="mg/L" />
//             <MetricCard title="Silica" value={fmt(data.silica_mg_L)} hint="mg/L" />
//             <MetricCard title="Iron" value={fmt(data.iron_mg_L)} hint="mg/L" />
//             <MetricCard title="Manganese" value={fmt(data.manganese_mg_L)} hint="mg/L" />
//             <MetricCard title="Oil & Grease" value={fmt(data.oil_and_grease_mg_L)} hint="mg/L" />
//             <MetricCard title="Color" value={fmt(data.color_PtCo)} hint="PtCo" />
//           </div>
//         </div>
//         <div className="mt-8 flex justify-center">
//         <Button
//           className="px-6 py-3 text-base font-medium"
//           onClick={() => router.push(`/producer/analysis/${id}`)}
//         >
//           View Water Analysis Report
//         </Button>
//         </div>

//       </div>
//     </div>
//   );
// }




"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/theme-provider";

type Report = {
  _id: string;
  company_name?: string | null;
  location?: string | null;
  producer_industry_type?: string | null;
  extracted_at?: string | Date | null;

  volume_available_gallons?: number | null;
  treatment_method?: string | null;

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

function fmt(v: any) {
  return v === null || v === undefined || v === "" ? "—" : String(v);
}

function bytesToFriendly(v: any) {
  if (v === null || v === undefined || v === "" || Number.isNaN(Number(v))) return "—";
  const n = Number(v);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}k`;
  return `${n}`;
}

/** Simple theme toggle without extra deps */

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium shadow-sm hover:bg-muted/50 transition"
      aria-label="Toggle theme"
      type="button"
    >
      {isDark ? (
        <>
          <span className="text-base">🌙</span>
          <span className="hidden sm:inline">Dark</span>
        </>
      ) : (
        <>
          <span className="text-base">☀️</span>
          <span className="hidden sm:inline">Light</span>
        </>
      )}
    </button>
  );
}

function StepPill({
  label,
  active,
  done,
}: {
  label: string;
  active?: boolean;
  done?: boolean;
}) {
  return (
    <div
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
        active
          ? "border-sky-500/40 bg-sky-500/10 text-foreground"
          : done
          ? "border-emerald-500/30 bg-emerald-500/10 text-foreground"
          : "border-border bg-background text-muted-foreground",
      ].join(" ")}
    >
      <span className="text-sm leading-none">{done ? "✅" : active ? "🧾" : "•"}</span>
      <span>{label}</span>
    </div>
  );
}

function HeroCard({
  title,
  subtitle,
  rightSlot,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  rightSlot?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      {/* colored border “margin” (stronger in dark mode like login/signup) */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-border" />
      <div className="pointer-events-none absolute -inset-[2px] rounded-3xl opacity-0 dark:opacity-100">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/35 via-sky-500/35 to-indigo-500/35 blur-[10px]" />
      </div>

      {/* subtle water tint + wave */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
        <div className="absolute -top-28 left-1/2 h-56 w-[980px] -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-400/10 via-sky-400/12 to-indigo-400/10 blur-3xl" />
        <svg
          className="absolute bottom-0 left-0 right-0 w-full opacity-35"
          viewBox="0 0 1440 140"
          preserveAspectRatio="none"
        >
          <path
            d="M0,76 C120,42 240,42 360,76 C480,110 600,110 720,76 C840,42 960,42 1080,76 C1200,110 1320,110 1440,76 L1440,140 L0,140 Z"
            fill="currentColor"
            className="text-sky-500/20"
          />
        </svg>
      </div>

      <div className="p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2">
              <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-semibold text-muted-foreground">
                Water Passport · Review
              </span>
              <span className="hidden sm:inline text-xs text-muted-foreground">
                Verify extracted values before running the model
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black tracking-tight">{title}</h1>

            {subtitle ? (
              <p className="text-sm md:text-base text-muted-foreground max-w-3xl">{subtitle}</p>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2">
              <StepPill label="Upload" done />
              <StepPill label="Review Draft" active />
              <StepPill label="Analysis" />
            </div>
          </div>

          {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
        </div>

        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  hint,
  emphasis,
}: {
  title: string;
  value: string;
  hint?: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl border border-border bg-muted/30 p-4 transition",
        "hover:bg-muted/40",
      ].join(" ")}
    >
      <div className="text-[11px] font-medium text-muted-foreground">{title}</div>
      <div className={["mt-1", emphasis ? "text-xl font-bold" : "text-lg font-semibold"].join(" ")}>
        {value}
      </div>
      {hint ? <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

export default function ProducerReviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  const [data, setData] = useState<Report | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setErr("Missing report id in route.");
      return;
    }

    async function load() {
      try {
        const res = await fetch(`/api/reports/${id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to load report");
        setData(json);
      } catch (e: any) {
        setErr(e.message);
      }
    }

    load();
  }, [id]);

  const extractedAt = useMemo(() => {
    if (!data?.extracted_at) return "—";
    try {
      return new Date(data.extracted_at as any).toLocaleString();
    } catch {
      return "—";
    }
  }, [data?.extracted_at]);

  // Error state
  if (err) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
          <HeroCard
            title="Review Draft"
            subtitle="We couldn’t load this report. Please go back and upload again."
            rightSlot={
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="outline" onClick={() => router.push("/producer/upload")}>
                  Back to Upload
                </Button>
              </div>
            }
          />

          <SectionCard title="Error" subtitle="Check your connection or try a new upload.">
            <div className="rounded-2xl border border-border bg-muted/30 p-4 text-sm text-red-600">
              {err}
            </div>
          </SectionCard>
        </div>
      </div>
    );
  }

  // Loading state
  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
          <HeroCard
            title="Review Draft"
            subtitle="Loading extracted values from your lab report…"
            rightSlot={
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="outline" onClick={() => router.push("/producer/upload")}>
                  Back
                </Button>
              </div>
            }
          />
          <SectionCard title="Preparing preview" subtitle="This usually takes a few seconds.">
            <div className="text-sm text-muted-foreground">Fetching report data…</div>
          </SectionCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <HeroCard
          title={
            <>
              Review & confirm your{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent dark:bg-none dark:text-white dark:text-opacity-95 dark:[-webkit-text-fill-color:unset]">
                Water Passport
              </span>
            </>
          }
          subtitle={
            <>
              Confirm extracted values before publishing. If anything looks off, re-upload a cleaner
              PDF (clear units + sampling time). When ready, continue to the model analysis.
            </>
          }
          rightSlot={
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" onClick={() => router.push("/producer/upload")}>
                New upload
              </Button>
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <MetricCard title="Company" value={fmt(data.company_name)} />
            <MetricCard title="Location" value={fmt(data.location)} />
            <MetricCard title="Industry" value={fmt(data.producer_industry_type)} />
            <MetricCard title="Extracted at" value={extractedAt} />
          </div>
        </HeroCard>

        {/* Facility + batch details */}
        <SectionCard
          title="Facility & batch details"
          subtitle="These fields help traceability and matching to consumers."
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <MetricCard title="Company" value={fmt(data.company_name)} />
            <MetricCard title="Location" value={fmt(data.location)} />
            <MetricCard title="Industry type" value={fmt(data.producer_industry_type)} />
            <MetricCard title="Extracted at" value={extractedAt} />
            <MetricCard
              title="Volume available (gal)"
              value={data.volume_available_gallons == null ? "—" : bytesToFriendly(data.volume_available_gallons)}
              hint={data.volume_available_gallons == null ? "" : "Reported by producer"}
              emphasis
            />
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-muted/30 p-4">
            <div className="text-[11px] font-medium text-muted-foreground">Treatment</div>
            <div className="mt-1 text-sm font-medium leading-relaxed">
              {fmt(data.treatment_method)}
            </div>
          </div>
        </SectionCard>

        {/* Extraction preview */}
        <SectionCard
          title="Extraction preview"
          subtitle="These values were extracted from your PDF and will be fed into the compatibility model."
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Core */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Core water quality</div>
                <div className="text-xs text-muted-foreground">Units normalized where possible</div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <MetricCard title="pH" value={fmt(data.ph)} hint="Target: 6.5–8.5" emphasis />
                <MetricCard title="Temperature" value={fmt(data.temperature_C)} hint="°C" />
                <MetricCard title="Turbidity" value={fmt(data.turbidity_NTU)} hint="NTU" />
                <MetricCard title="Color" value={fmt(data.color_PtCo)} hint="PtCo" />
                <MetricCard title="TDS" value={fmt(data.tds_mg_L)} hint="mg/L" />
                <MetricCard title="TSS" value={fmt(data.tss_mg_L)} hint="mg/L" />
              </div>
            </div>

            {/* Treatment indicators */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Treatment & constraints</div>
                <div className="text-xs text-muted-foreground">Used for compatibility checks</div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <MetricCard title="COD" value={fmt(data.cod_mg_L)} hint="mg/L" />
                <MetricCard title="BOD5" value={fmt(data.bod5_mg_L)} hint="mg/L" />
                <MetricCard title="Free chlorine" value={fmt(data.free_chlorine_mg_L)} hint="mg/L" />
                <MetricCard
                  title="Total coliform"
                  value={fmt(data.total_coliform_CFU_100mL)}
                  hint="CFU/100mL"
                />
                <MetricCard
                  title="Conductivity"
                  value={fmt(data.electrical_conductivity_uS_cm)}
                  hint="µS/cm"
                />
                <MetricCard
                  title="Hardness"
                  value={fmt(data.hardness_mg_L_as_CaCO3)}
                  hint="mg/L as CaCO₃"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Chloride" value={fmt(data.chloride_mg_L)} hint="mg/L" />
            <MetricCard title="Sulfate" value={fmt(data.sulfate_mg_L)} hint="mg/L" />
            <MetricCard title="Silica" value={fmt(data.silica_mg_L)} hint="mg/L" />
            <MetricCard title="Iron" value={fmt(data.iron_mg_L)} hint="mg/L" />
            <MetricCard title="Manganese" value={fmt(data.manganese_mg_L)} hint="mg/L" />
            <MetricCard title="Oil & grease" value={fmt(data.oil_and_grease_mg_L)} hint="mg/L" />
          </div>
        </SectionCard>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="outline" onClick={() => router.push("/producer/upload")}>
            Back to Upload
          </Button>

          <div className="flex gap-2">
            <Button
              className="px-6"
              onClick={() => router.push(`/producer/analysis/${id}`)}
            >
              Continue to Water Analysis
            </Button>
          </div>
        </div>

        <div className="pb-6 text-center text-xs text-muted-foreground">
          Tip: If a value looks wrong, try a PDF with a clear table + units (mg/L, NTU, °C) and a visible
          sampling timestamp.
        </div>
      </div>
    </div>
  );
}
