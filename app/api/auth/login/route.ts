import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../lib/db";
import User from "../../../models/User";
import { signToken } from "../../../lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = signToken(user._id.toString());
    return NextResponse.json({
      token,
      user: {
        email: user.email,
        name: typeof user.name === "string" ? user.name : "",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
