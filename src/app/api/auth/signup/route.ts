import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      role,
      username,
      password,
      orgName,
      city,
      state,
      address,
      consumerType,
    } = body;

    if (!role || !username || !password || !orgName || !city || !state || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("hydrosync");

    const existingUser = await db.collection("users").findOne({ username: username.trim() });
    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const doc = {
      role,
      username: username.trim(),
      passwordHash,

      orgName: orgName.trim(),
      city: city.trim(),
      state: state.trim(),
      address: address.trim(),

      consumerType: role === "consumer" ? (consumerType?.trim() || "") : "",
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(doc);

    // ✅ return same shape as login route
    return NextResponse.json({
      success: true,
      user: {
        id: result.insertedId.toString(),
        role: doc.role,
        username: doc.username,
        orgName: doc.orgName,
        city: doc.city,
        state: doc.state,
        address: doc.address,
        consumerType: doc.consumerType || null,
      },
    });
  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
