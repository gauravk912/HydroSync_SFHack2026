import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectMongo } from "@/lib/mongo";
import { getLabReportModel } from "@/models/LabReport";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> } // params is a Promise in Next 16
) {
  try {
    const { id } = await ctx.params;

    await connectMongo();
    const db = mongoose.connection.useDb("hydrosync");
    const LabReport = getLabReportModel(db);

    const doc = await LabReport.findById(id).lean();
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(doc);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
