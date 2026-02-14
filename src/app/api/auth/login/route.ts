import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Missing username or password" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("hydrosync");

    const user = await db.collection("users").findOne({ username: username.trim() });

    if (!user) {
      return NextResponse.json({ error: "User not found. Please sign up." }, { status: 404 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);

    if (!ok) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      userId: user._id.toString(),
      role: user.role,
      username: user.username,
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}