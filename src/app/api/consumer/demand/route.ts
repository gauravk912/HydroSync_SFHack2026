import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// OPTIONAL: If you want Gemini normalization, install and add below later.
// import { GoogleGenerativeAI } from "@google/generative-ai";

type DemandBody = {
  consumerUserId: string;
  consumerName?: string;
  location?: { city?: string; state?: string; lat?: number; lng?: number };
  industryNeed: string;
  quantityNeededGallonsPerDay: number;
};

function normalizeIndustryFallback(raw: string) {
  // Simple fallback normalization (no Gemini yet)
  return raw.trim().toLowerCase();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as DemandBody;

    if (!body.consumerUserId || !body.industryNeed || !body.quantityNeededGallonsPerDay) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ✅ Industry normalization
    const industryNeedNormalized = normalizeIndustryFallback(body.industryNeed);

    const client = await clientPromise;
    const db = client.db("hydrosync");

    const doc = {
      consumerUserId: body.consumerUserId,
      consumerName: body.consumerName ?? null,

      location: {
        city: body.location?.city ?? null,
        state: body.location?.state ?? null,
        lat: body.location?.lat ?? null,
        lng: body.location?.lng ?? null,
      },

      industryNeed: body.industryNeed,
      industryNeedNormalized,

      quantityNeededGallonsPerDay: Number(body.quantityNeededGallonsPerDay),

      status: "NEW",
      createdAt: new Date(),
    };

    const result = await db.collection("consumer_demands").insertOne(doc);

    return NextResponse.json({
      success: true,
      demandId: result.insertedId.toString(),
      industryNeedNormalized,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}