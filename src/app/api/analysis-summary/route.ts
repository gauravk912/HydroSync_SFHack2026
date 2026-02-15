import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

// Make industry labels look nice for humans
function prettyIndustry(s: string) {
  return s
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const body = await req.json();
    const { reportMeta, sample, prediction } = body || {};

    // Build compact lists for Gemini
    const topCompatible = (prediction?.compatible || [])
      .slice(0, 4)
      .map((x: any) => `${prettyIndustry(x.industry)} (${(x.prob * 100).toFixed(0)}%)`);

    const rejected = (prediction?.rejected || [])
      .map((x: any) => `${prettyIndustry(x.industry)} (${(x.prob * 100).toFixed(0)}%)`);

    const recommended = prediction?.summary?.recommended
      ? prettyIndustry(prediction.summary.recommended)
      : null;

    const confidence = prediction?.summary?.confidence ?? null;

    // Pick a few key parameters (keeps prompt small)
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
You are an industrial water reuse analyst. Write a short, judge-friendly summary in 5–6 sentences.

Rules:
- Keep it concise (6–7 sentences total).
- Sentence 1: State the recommended industry and confidence.
- Sentence 2: List exactly FOUR industries the water is suitable for (use the provided list).
- Sentence 3: Mention overall compatibility (how many compatible vs rejected).
- Sentence 4–5: List the industries it is NOT suitable for and give high-level reasons grounded in the parameters (do not invent regulations/thresholds; be qualitative and reference the given values).
- If values are missing, say "some metrics were missing" rather than guessing.
- Output plain text only (no bullets, no markdown).
- Setence 6-7: List some methods that the company can implement to make the grey water usefull for the rejected industries as well.

Context:
Company/Facility: ${reportMeta?.company_name ?? "Unknown"}
Location: ${reportMeta?.location ?? "Unknown"}

Model summary:
Recommended: ${recommended ?? "Unknown"}
Confidence: ${confidence == null ? "Unknown" : `${(confidence * 100).toFixed(1)}%`}
Compatible count: ${prediction?.summary?.countCompatible ?? "?"}
Rejected count: ${prediction?.summary?.countRejected ?? "?"}

Top 4 suitable industries (use these exactly in sentence 2):
${topCompatible.join(", ") || "None"}

Rejected industries (mention these in sentence 4/5):
${rejected.join(", ") || "None"}

Key water parameters (use these for reasoning):
${JSON.stringify(keyParams)}
`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    return NextResponse.json({ summary: text });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Summary generation failed", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
