import { NextResponse } from "next/server";
import { predictConsumerIndustries } from "@/ml/consumerPredictor";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const sample = await req.json();
    const output = predictConsumerIndustries(sample, 5);

    const top5 = output.top5.map((r, idx) => ({
    rank: idx + 1,
    industry: r.industry,
    probability: r.prob
    }));

    // return NextResponse.json({
    //   input: sample,
    //   top5: output.top5,
    //   compatible: output.compatible,
    //   rejected: output.rejected,
    // });
    return NextResponse.json({
    input: sample,
    summary: {
        recommended: top5?.[0]?.industry ?? null,
        confidence: top5?.[0]?.probability ?? null,
        countCompatible: output.compatible.length,
        countRejected: output.rejected.length,
    },
    top5,
    compatible: output.compatible,   
    rejected: output.rejected      
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Prediction failed", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
