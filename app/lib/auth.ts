import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";

function getJwtSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) {
    throw new Error("JWT_SECRET is not set in environment variables.");
  }
  return s;
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): { sub: string } | null {
  try {
    const payload = jwt.verify(token, getJwtSecret());
    if (typeof payload === "string" || !payload || typeof payload !== "object") {
      return null;
    }
    const sub = (payload as { sub?: string }).sub;
    if (!sub) return null;
    return { sub };
  } catch {
    return null;
  }
}

export function getBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7).trim() || null;
}

export function getAuthUserId(req: NextRequest): string | null {
  const t = getBearerToken(req);
  if (!t) return null;
  return verifyToken(t)?.sub ?? null;
}
