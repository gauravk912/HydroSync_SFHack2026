"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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

function MetricCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border bg-slate-50 p-4">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
      {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
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

  if (err) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Review Draft</h1>
          <p className="mt-2 text-sm text-red-600">{err}</p>
          <div className="mt-6">
            <Button variant="outline" onClick={() => router.push("/producer/upload")}>
              Back to Upload
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Review Draft</h1>
          <p className="mt-2 text-sm text-muted-foreground">Loading extracted values…</p>
        </div>
      </div>
    );
  }

  const fmt = (v: any) => (v === null || v === undefined || v === "" ? "—" : String(v));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Producer Console</p>
            <h1 className="text-xl font-semibold tracking-tight">Review Draft</h1>
            <p className="text-sm text-muted-foreground">
              Confirm extracted values before publishing a Water Passport.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/producer/upload")}>
            Back
          </Button>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">

        {/* Row 1 — 5 Equal Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <MetricCard title="Company" value={fmt(data.company_name)} />
          <MetricCard title="Location" value={fmt(data.location)} />
          <MetricCard title="Industry" value={fmt(data.producer_industry_type)} />
          <MetricCard
            title="Extracted at"
            value={
              data.extracted_at
                ? new Date(data.extracted_at as any).toLocaleString()
                : "—"
            }
          />
          <MetricCard title="Volume (gal)" value={fmt(data.volume_available_gallons)} />
        </div>

        {/* Row 2 — Full Width Treatment */}
        <div>
          <div className="rounded-xl border bg-slate-50 p-4">
            <div className="text-xs text-muted-foreground">Treatment</div>
            <div className="mt-1 text-base font-medium leading-relaxed">
              {fmt(data.treatment_method)}
            </div>
          </div>
        </div>

      </div>


        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold">Extraction Preview</h2>
          <p className="text-xs text-muted-foreground mt-1">
            These values were extracted from your PDF.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <MetricCard title="pH" value={fmt(data.ph)} hint="Target: 6.5–8.5" />
            <MetricCard title="TDS" value={fmt(data.tds_mg_L)} hint="mg/L" />
            <MetricCard title="Turbidity" value={fmt(data.turbidity_NTU)} hint="NTU" />
            <MetricCard title="COD" value={fmt(data.cod_mg_L)} hint="mg/L" />
            <MetricCard title="BOD5" value={fmt(data.bod5_mg_L)} hint="mg/L" />
            <MetricCard title="Temp" value={fmt(data.temperature_C)} hint="°C" />
            <MetricCard title="TSS" value={fmt(data.tss_mg_L)} hint="mg/L" />
            <MetricCard title="Conductivity" value={fmt(data.electrical_conductivity_uS_cm)} hint="µS/cm" />
            <MetricCard title="Free Chlorine" value={fmt(data.free_chlorine_mg_L)} hint="mg/L" />
            <MetricCard title="Total Coliform" value={fmt(data.total_coliform_CFU_100mL)} hint="CFU/100mL" />
            <MetricCard title="Hardness" value={fmt(data.hardness_mg_L_as_CaCO3)} hint="mg/L as CaCO₃" />
            <MetricCard title="Chloride" value={fmt(data.chloride_mg_L)} hint="mg/L" />
            <MetricCard title="Sulfate" value={fmt(data.sulfate_mg_L)} hint="mg/L" />
            <MetricCard title="Silica" value={fmt(data.silica_mg_L)} hint="mg/L" />
            <MetricCard title="Iron" value={fmt(data.iron_mg_L)} hint="mg/L" />
            <MetricCard title="Manganese" value={fmt(data.manganese_mg_L)} hint="mg/L" />
            <MetricCard title="Oil & Grease" value={fmt(data.oil_and_grease_mg_L)} hint="mg/L" />
            <MetricCard title="Color" value={fmt(data.color_PtCo)} hint="PtCo" />
          </div>
        </div>
        <div className="mt-8 flex justify-center">
        <Button
          className="px-6 py-3 text-base font-medium"
          onClick={() => router.push(`/producer/analysis/${id}`)}
        >
          View Water Analysis Report
        </Button>
        </div>

      </div>
    </div>
  );
}
