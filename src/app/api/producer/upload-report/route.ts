import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const runtime = "nodejs"; // important for file handling

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file || !userId) {
      return NextResponse.json({ error: "Missing file or userId" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    // Convert PDF to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Store in Mongo (hackathon-simple)
    const client = await clientPromise;
    const db = client.db("hydrosync");

    const result = await db.collection("lab_reports").insertOne({
      userId,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      uploadedAt: new Date(),
      pdfBase64: buffer.toString("base64"), // simple storage for now
      status: "uploaded",
    });

    return NextResponse.json({ success: true, reportId: result.insertedId.toString() }, { status: 201 });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}