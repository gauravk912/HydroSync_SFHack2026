import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { predictConsumerIndustries } from "@/ml/consumerPredictor";
import { connectMongo } from "@/lib/mongo";
import { getLabReportModel } from "@/models/LabReport";

export const runtime = "nodejs";

/** DB -> model input mapping */
function buildModelInputFromReport(r: any) {
  return {
    pH: r.ph ?? null, // IMPORTANT: model expects pH but DB stores ph
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

function prettyIndustry(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

async function generateGeminiSummary({
  company,
  location,
  sample,
  prediction,
}: {
  company: string | null;
  location: string | null;
  sample: any;
  prediction: any;
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

  const top4 = (prediction?.compatible || [])
    .slice(0, 4)
    .map((r: any) => `${prettyIndustry(r.industry)} (${(r.prob * 100).toFixed(0)}%)`);

  const rejected = (prediction?.rejected || [])
    .map((r: any) => `${prettyIndustry(r.industry)} (${(r.prob * 100).toFixed(0)}%)`);

  const rec = prediction?.summary?.recommended
    ? prettyIndustry(prediction.summary.recommended)
    : "Unknown";

  const conf =
    prediction?.summary?.confidence == null
      ? "Unknown"
      : `${(prediction.summary.confidence * 100).toFixed(1)}%`;

  const keyParams = {
    pH: sample?.pH ?? null,
    temperature_C: sample?.temperature_C ?? null,
    turbidity_NTU: sample?.turbidity_NTU ?? null,
    tds_mg_L: sample?.tds_mg_L ?? null,
    bod5_mg_L: sample?.bod5_mg_L ?? null,
    cod_mg_L: sample?.cod_mg_L ?? null,
    total_coliform_CFU_100mL: sample?.total_coliform_CFU_100mL ?? null,
    free_chlorine_mg_L: sample?.free_chlorine_mg_L ?? null,
    electrical_conductivity_uS_cm: sample?.electrical_conductivity_uS_cm ?? null,
  };

  const prompt = `
Write a concise Water Analysis Summary in 5–6 sentences.

Rules:
- Sentence 1: Recommended industry + confidence.
- Sentence 2: List exactly FOUR industries it can supply to (use the provided list).
- Sentence 3: Mention compatible vs rejected counts.
- Sentence 4–6: Mention industries it cannot supply to and give qualitative reasons grounded in the parameter values (no made-up thresholds/regulations).

Company: ${company ?? "Unknown"}
Location: ${location ?? "Unknown"}

Recommended: ${rec} (${conf})
Compatible count: ${prediction?.summary?.countCompatible ?? "?"}
Rejected count: ${prediction?.summary?.countRejected ?? "?"}

Use these as the FOUR suitable industries:
${top4.join(", ") || "None"}

Rejected industries:
${rejected.join(", ") || "None"}

Key parameters:
${JSON.stringify(keyParams)}
`;

  const out = await model.generateContent(prompt);
  return out.response.text().trim();
}

// Next.js 16 dynamic params are a Promise
type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;

    const db = await connectMongo();
    const LabReport = getLabReportModel(db);

    const doc: any = await LabReport.findById(id).lean();
    if (!doc) return NextResponse.json({ error: "Report not found" }, { status: 404 });

    // cache
    if (doc.analysis?.prediction && doc.analysis?.geminiSummaryText) {
      return NextResponse.json({ reportId: id, analysis: doc.analysis });
    }

    const sample = buildModelInputFromReport(doc);

    const output = predictConsumerIndustries(sample, 5);

    const top5 = output.top5.map((r, idx) => ({
      rank: idx + 1,
      industry: r.industry,
      probability: r.prob,
    }));

    const prediction = {
      input: sample,
      summary: {
        recommended: top5?.[0]?.industry ?? null,
        confidence: top5?.[0]?.probability ?? null,
        countCompatible: output.compatible.length,
        countRejected: output.rejected.length,
      },
      top5,
      compatible: output.compatible,
      rejected: output.rejected,
    };

    const geminiSummaryText = await generateGeminiSummary({
      company: doc.company_name ?? null,
      location: doc.location ?? null,
      sample,
      prediction,
    });

    const analysis = {
      createdAt: new Date(),
      modelVersion: "consumer_compat_v1",
      prediction,
      geminiSummaryText,
    };

    await LabReport.findByIdAndUpdate(id, { $set: { analysis } });

    return NextResponse.json({ reportId: id, analysis });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to generate/save analysis", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
