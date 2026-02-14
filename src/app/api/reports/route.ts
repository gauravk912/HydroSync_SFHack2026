import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from "mongoose";
import { z } from "zod";

import { connectMongo } from "@/lib/mongo";
import { getLabReportModel } from "@/models/LabReport";

const ExtractSchema = z.object({
  company_name: z.string().nullable(),
  location: z.string().nullable(),
  producer_industry_type: z.string().nullable(),
  extracted_at: z.string().nullable(),

  volume_available_gallons: z.number().nullable(),
  treatment_method: z.string().nullable(),

  ph: z.number().nullable(),
  temperature_C: z.number().nullable(),
  turbidity_NTU: z.number().nullable(),
  color_PtCo: z.number().nullable(),
  tds_mg_L: z.number().nullable(),
  tss_mg_L: z.number().nullable(),
  bod5_mg_L: z.number().nullable(),
  cod_mg_L: z.number().nullable(),
  free_chlorine_mg_L: z.number().nullable(),
  total_coliform_CFU_100mL: z.number().nullable(),
  hardness_mg_L_as_CaCO3: z.number().nullable(),
  chloride_mg_L: z.number().nullable(),
  sulfate_mg_L: z.number().nullable(),
  silica_mg_L: z.number().nullable(),
  iron_mg_L: z.number().nullable(),
  manganese_mg_L: z.number().nullable(),
  oil_and_grease_mg_L: z.number().nullable(),
  electrical_conductivity_uS_cm: z.number().nullable(),
});

function safeJsonFromGemini(text: string) {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1) throw new Error("Gemini did not return JSON");
  return JSON.parse(text.slice(first, last + 1));
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("pdf");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing pdf file" }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF supported" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

    const prompt = `
Return ONLY valid JSON (no markdown, no backticks, no commentary).
Extract structured water quality data from the PDF.
If any field is missing, set it to null.
Use EXACT keys:

company_name, location, producer_industry_type, extracted_at,
volume_available_gallons, treatment_method,
ph, temperature_C, turbidity_NTU, color_PtCo, tds_mg_L, tss_mg_L, bod5_mg_L, cod_mg_L,
free_chlorine_mg_L, total_coliform_CFU_100mL, hardness_mg_L_as_CaCO3, chloride_mg_L, sulfate_mg_L,
silica_mg_L, iron_mg_L, manganese_mg_L, oil_and_grease_mg_L, electrical_conductivity_uS_cm

Set extracted_at to the current ISO timestamp when extraction happens.
`;

    const result = await model.generateContent([
      { inlineData: { data: base64, mimeType: "application/pdf" } },
      prompt,
    ]);

    const text = result.response.text();
    const parsed = safeJsonFromGemini(text);

    const validated = ExtractSchema.parse({
      ...parsed,
      extracted_at: new Date().toISOString(),
    });

    await connectMongo();
    const db = mongoose.connection.useDb("hydrosync"); // <-- your new DB name
    const LabReport = getLabReportModel(db);

    const doc = await LabReport.create({
      ...validated,
      extracted_at: new Date(validated.extracted_at!),
      source_pdf_filename: file.name,
      source_pdf_mime: file.type,
    });

    return NextResponse.json({ reportId: doc._id.toString() });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}
