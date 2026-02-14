import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    // REST ListModels endpoint (works even if SDK doesn't support listModels)
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const res = await fetch(url);

    const json = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: json?.error?.message || "Failed to list models", raw: json },
        { status: res.status }
      );
    }

    const models = (json.models || []).map((m: any) => ({
      name: m.name, // <-- USE THIS EXACT STRING IN getGenerativeModel
      supportedGenerationMethods: m.supportedGenerationMethods || [],
      displayName: m.displayName,
    }));

    const canGenerate = models.filter((m: any) =>
      m.supportedGenerationMethods.includes("generateContent")
    );

    return NextResponse.json({ canGenerate });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
