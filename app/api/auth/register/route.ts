import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../lib/db";
import User from "../../../models/User";
import {
  AUTH_EMAIL_RE,
  validateAuthName,
  validateAuthPasswordRegister,
} from "../../../utils/regex";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nameRaw = typeof body.name === "string" ? body.name : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    const nameErr = validateAuthName(nameRaw);
    if (nameErr) {
      return NextResponse.json({ error: nameErr }, { status: 400 });
    }
    const name = nameRaw.trim();

    if (!email || !AUTH_EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const passErr = validateAuthPasswordRegister(password);
    if (passErr) {
      return NextResponse.json({ error: passErr }, { status: 400 });
    }

    await connectDB();

    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ name, email, passwordHash });

    return NextResponse.json(
      { message: "Registration successful. You can sign in now." },
      { status: 201 }
    );
  } catch (e: unknown) {
    const err = e as { code?: number };
    if (err.code === 11000) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
