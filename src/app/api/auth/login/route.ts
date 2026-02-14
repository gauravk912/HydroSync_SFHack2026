import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Missing username or password" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("hydrosync");

    // Find user by username
    const user = await db.collection("users").findOne({ username: username.trim() });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Return safe user info (never return passwordHash)
    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        role: user.role,
        username: user.username,
        industryName: user.industryName ?? null,
        orgName: user.orgName ?? null,
        city: user.city ?? null,
        state: user.state ?? null,
        address: user.address ?? null,
        consumerType: user.consumerType ?? null,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
