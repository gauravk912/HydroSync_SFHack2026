export const runtime = "nodejs";

import mongoose from "mongoose";

export async function GET() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) return Response.json({ error: "Missing MONGODB_URI" }, { status: 500 });

    await mongoose.connect(uri);

    const dbName = mongoose.connection.db.databaseName;
    const res = await mongoose.connection.db.collection("debug_ping").insertOne({
      ok: true,
      at: new Date(),
    });

    return Response.json({
      ok: true,
      dbName,
      insertedId: String(res.insertedId),
    });
  } catch (e: any) {
    return Response.json({ error: e?.message || "Mongo debug failed" }, { status: 500 });
  }
}
