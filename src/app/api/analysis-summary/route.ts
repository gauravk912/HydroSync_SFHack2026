import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

function prettyIndustry(s: string) {
  return String(s || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function toTop5(prediction: any) {
  const compatible = Array.isArray(prediction?.compatible) ? prediction.compatible : [];
  const sorted = [...compatible].sort((a: any, b: any) => (b?.prob ?? 0) - (a?.prob ?? 0));
  return sorted.slice(0, 5).map((x: any) => ({
    industry: prettyIndustry(x?.industry),
    probability: typeof x?.prob === "number" ? x.prob : Number(x?.prob) || 0,
  }));
}

function listIndustries(arr: any[]) {
  return (Array.isArray(arr) ? arr : [])
    .map((x: any) => prettyIndustry(x?.industry))
    .filter(Boolean);
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const body = await req.json();
    const { reportId, reportMeta, sample, prediction } = body || {};

    if (!reportId || typeof reportId !== "string" || !ObjectId.isValid(reportId)) {
      return NextResponse.json({ error: "Missing/invalid reportId" }, { status: 400 });
    }

    // Build lists for Gemini prompt
    const topCompatible4 = (prediction?.compatible || [])
      .slice(0, 4)
      .map((x: any) => `${prettyIndustry(x.industry)} (${(Number(x.prob) * 100).toFixed(0)}%)`);

    const rejectedList = (prediction?.rejected || []).map(
      (x: any) => `${prettyIndustry(x.industry)} (${(Number(x.prob) * 100).toFixed(0)}%)`
    );

    const recommended = prediction?.summary?.recommended
      ? prettyIndustry(prediction.summary.recommended)
      : null;

    const confidence = prediction?.summary?.confidence ?? null;

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
You are an industrial water reuse analyst. Write a short, judge-friendly summary in 6–7 sentences.

Rules:
- Sentence 1: State the recommended industry and confidence.
- Sentence 2: List exactly FOUR industries the water is suitable for (use the provided list).
- Sentence 3: Mention overall compatibility (how many compatible vs rejected).
- Sentence 4–5: Mention rejected industries and give high-level reasons grounded in the parameters (qualitative; do not invent regulations/thresholds).
- If values are missing, say "some metrics were missing" rather than guessing.
- Output plain text only (no bullets, no markdown).
- Sentence 6–7: Suggest treatment methods that could make the water usable for rejected industries.

Context:
Company/Facility: ${reportMeta?.company_name ?? "Unknown"}
Location: ${reportMeta?.location ?? "Unknown"}

Model summary:
Recommended: ${recommended ?? "Unknown"}
Confidence: ${confidence == null ? "Unknown" : `${(confidence * 100).toFixed(1)}%`}
Compatible count: ${prediction?.summary?.countCompatible ?? "?"}
Rejected count: ${prediction?.summary?.countRejected ?? "?"}

Top 4 suitable industries (use these exactly in sentence 2):
${topCompatible4.join(", ") || "None"}

Rejected industries (mention these in sentence 4/5):
${rejectedList.join(", ") || "None"}

Key water parameters:
${JSON.stringify(keyParams)}
`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const summaryText = result.response.text().trim();

    // ✅ SAVE processed outputs into Mongo (native driver)
    const client = await clientPromise;
    const db = client.db("hydrosync");
    const col = db.collection("labreports");

    const top5 = toTop5(prediction);
    const compatibleIndustries = listIndustries(prediction?.compatible);
    const rejectedIndustries = listIndustries(prediction?.rejected);

    await col.updateOne(
      { _id: new ObjectId(reportId) },
      {
        $set: {
          gemini_summary: summaryText,
          analyzedAt: new Date(),
          analysis_version: "v1",
          model_output: {
            recommended,
            confidence: typeof confidence === "number" ? confidence : Number(confidence) || null,
            top5,
            compatible_count:
              prediction?.summary?.countCompatible ?? compatibleIndustries.length ?? 0,
            rejected_count: prediction?.summary?.countRejected ?? rejectedIndustries.length ?? 0,
            compatible: compatibleIndustries,
            rejected: rejectedIndustries,
          },
          prediction_raw: prediction ?? null, // optional debug
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ summary: summaryText, saved: true });
  } catch (err: any) {
    console.error("analysis-summary error:", err);
    return NextResponse.json(
      { error: "Summary generation failed", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
