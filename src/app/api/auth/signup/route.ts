import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
// import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role, username, password, industryName, city, state, address } = body;

    if (!role || !username || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("hydrosync");

    // Check if username already exists
    const existingUser = await db.collection("users").findOne({ username });
    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.collection("users").insertOne({
      role, // "producer" or "consumer"
      username,
      passwordHash,
      industryName,
      city,
      state,
      address,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      userId: result.insertedId.toString(),
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}