/**
 * Printed page numbers: prefer footer/header lines; avoid mistaking custom
 * headers/footers (e.g. developer tag, F-block LDA, 400B) for page numbers.
 */
const PAGE_PATTERNS: RegExp[] = [
  /\bPage\s*(\d+)/i,
  /\((\d+)\)/,
  /-\s*(\d+)\s*-/,
];

/** Lines that often contain address/ID text, not page numbers (per assessment). */
function looksLikeNoiseLine(line: string): boolean {
  const s = line.trim();
  if (s.length > 220) return true;
  return /(?:developer\s*tag|developer|f[-\s]?block|\blda\b|\d{3,}B\b)/i.test(s);
}

function tryPatternsOnString(s: string): number | null {
  for (const p of PAGE_PATTERNS) {
    const m = s.match(p);
    if (m) return parseInt(m[1], 10);
  }
  return null;
}

/** Standalone 1–4 digit numbers on a short line (typical page markers). */
function tryStandaloneLine(line: string): number | null {
  if (looksLikeNoiseLine(line)) return null;
  const trimmed = line.trim();
  const nums = trimmed.match(/\b(\d{1,4})\b/g);
  if (!nums || nums.length !== 1) return null;
  const n = parseInt(nums[0], 10);
  if (n < 1 || n > 9999) return null;
  return n;
}

export function extractPageNumber(text: string): number | null {
  const lines = text.split(/\r?\n/).map((l) => l.trim());

  const footer = lines.slice(-8).reverse();
  const header = lines.slice(0, 8);

  for (const line of footer) {
    if (!line) continue;
    const fromPattern = tryPatternsOnString(line);
    if (fromPattern !== null) return fromPattern;
    const standalone = tryStandaloneLine(line);
    if (standalone !== null) return standalone;
  }

  for (const line of header) {
    if (!line) continue;
    const fromPattern = tryPatternsOnString(line);
    if (fromPattern !== null) return fromPattern;
    const standalone = tryStandaloneLine(line);
    if (standalone !== null) return standalone;
  }

  const full = tryPatternsOnString(text);
  if (full !== null) return full;

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (!line || looksLikeNoiseLine(line)) continue;
    const standalone = tryStandaloneLine(line);
    if (standalone !== null) return standalone;
  }

  return null;
}

/**
 * Question starts: Q1, Q.1, Q 1, Question 1, Q(1), and similar (order preserved, no re-sequencing).
 */
const QUESTION_RE =
  /\bQ\s*\(\s*(\d+)\s*\)|\bQ\.\s*(\d+)\b|\bQ\s+(\d+)\b|\bQ(\d+)\b|\bQuestion\s*(\d+)\b/gi;

export function extractQuestions(text: string): number[] {
  const nums: number[] = [];
  let m: RegExpExecArray | null;
  QUESTION_RE.lastIndex = 0;
  while ((m = QUESTION_RE.exec(text)) !== null) {
    const num = parseInt(m[1] || m[2] || m[3] || m[4] || m[5], 10);
    if (!Number.isNaN(num)) nums.push(num);
  }
  return nums;
}

// --- Auth (register / login validation) ---

export const AUTH_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const AUTH_NAME_RE = /^[\p{L}\p{M}\s'.-]+$/u;

export function validateAuthName(value: string): string | null {
  const v = value.trim();
  if (!v) return "Name is required.";
  if (v.length < 2) return "Name must be at least 2 characters.";
  if (v.length > 120) return "Name must be at most 120 characters.";
  if (!AUTH_NAME_RE.test(v)) {
    return "Name may only include letters, spaces, hyphens, apostrophes, and periods.";
  }
  return null;
}

export function validateAuthEmail(value: string): string | null {
  const v = value.trim();
  if (!v) return "Email is required.";
  if (!AUTH_EMAIL_RE.test(v)) return "Please enter a valid email address.";
  return null;
}

/** Login: password required only. Register: min 8 characters. */
export function validateAuthPassword(value: string, isRegister: boolean): string | null {
  if (!value) return "Password is required.";
  if (isRegister && value.length < 8) {
    return "Password must be at least 8 characters.";
  }
  return null;
}

/** Server-side register: same rules as client. */
export function validateAuthPasswordRegister(value: string): string | null {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  return null;
}
