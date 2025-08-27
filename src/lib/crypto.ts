

/**
 * Lightweight password helpers for Vercel/Serverless
 * --------------------------------------------------
 * - Uses `bcryptjs` (pure JS) to avoid native addon issues on Vercel.
 * - No optional native imports (e.g. argon2) to keep builds stable.
 * - Provides safe fallbacks for legacy/plaintext comparisons (discouraged).
 */

import bcrypt from "bcryptjs";

/** Cost factor for bcrypt. Keep modest on serverless to avoid cold-start spikes. */
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 10);

/**
 * Normalize possibly-undefined inputs to string.
 */
function s(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

/**
 * Constant-time-ish comparison without Node's crypto (edge-safe).
 * For non-cryptographic equality (legacy/plaintext fallback).
 */
function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const A = enc.encode(a);
  const B = enc.encode(b);
  const len = Math.max(A.length, B.length);
  let diff = A.length ^ B.length;
  for (let i = 0; i < len; i++) {
    const x = A[i] ?? 0;
    const y = B[i] ?? 0;
    diff |= x ^ y;
  }
  return diff === 0;
}

/**
 * Hash a plain password using bcryptjs.
 */
export async function hashPassword(plain: string): Promise<string> {
  const pwd = s(plain);
  if (!pwd) throw new Error("Password is empty");
  return bcrypt.hash(pwd, BCRYPT_ROUNDS);
}

/**
 * Verify a plain password against a stored hash.
 * Supports bcrypt hashes ("$2a", "$2b", "$2y").
 * For non-bcrypt strings, falls back to constant-time equality (legacy only).
 */
export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  const pwd = s(plain);
  const hash = s(stored);

  // Bcrypt (recommended)
  if (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")) {
    try {
      return await bcrypt.compare(pwd, hash);
    } catch {
      return false;
    }
  }

  // If someone stored plaintext (not recommended), compare in constant time.
  if (!hash.startsWith("$")) {
    return safeEqual(pwd, hash);
  }

  // Unknown/unsupported hash format (e.g., argon2).
  return false;
}

/**
 * Quick type guard: is the stored value a bcrypt hash?
 */
export function isBcryptHash(v: string): boolean {
  const x = s(v);
  return x.startsWith("$2a$") || x.startsWith("$2b$") || x.startsWith("$2y$");
}

/**
 * Synchronous variants (use sparingly; can block the event loop).
 */
export function hashPasswordSync(plain: string): string {
  const pwd = s(plain);
  if (!pwd) throw new Error("Password is empty");
  const salt = bcrypt.genSaltSync(BCRYPT_ROUNDS);
  return bcrypt.hashSync(pwd, salt);
}

export function verifyPasswordSync(plain: string, stored: string): boolean {
  const pwd = s(plain);
  const hash = s(stored);
  if (isBcryptHash(hash)) {
    try {
      return bcrypt.compareSync(pwd, hash);
    } catch {
      return false;
    }
  }
  if (!hash.startsWith("$")) {
    return safeEqual(pwd, hash);
  }
  return false;
}