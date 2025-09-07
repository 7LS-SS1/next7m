/**
 * Client-safe shim. Do NOT import this from Client Components or /pages.
 * Server code must import from "@lib/auth-server".
 */
export type SessionPayload = { sub: string; email: string; role: string };

// Throwing stubs to make misuse obvious in dev.
export async function createSession(): Promise<never> {
  throw new Error('Import from "@lib/auth-server" in server code.');
}
export async function getSession(): Promise<never> {
  throw new Error('Import from "@lib/auth-server" in server code.');
}
export async function destroySession(): Promise<never> {
  throw new Error('Import from "@lib/auth-server" in server code.');
}