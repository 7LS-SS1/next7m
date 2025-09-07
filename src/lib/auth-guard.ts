import { getSession } from '@lib/auth-server';

export async function requireUser() {
  return await getSession();
}

export async function requireRole(roles: string[]) {
  const s = await getSession();
  if (!s) return null;
  return roles.includes(s.role) ? s : null;
}