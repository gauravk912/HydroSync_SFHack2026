import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("hydrosync");
    const result = await db.command({ ping: 1 });

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error("Mongo connection error:", err);

    return NextResponse.json(
      {
        success: false,
        name: err?.name,
        message: err?.message,
        code: err?.code,
      },
      { status: 500 }
    );
  }
}