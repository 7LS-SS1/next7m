import { getSession } from '@lib/auth';
import { unauthorized } from '@lib/db';

export async function withAuth(handler: (session: any) => Promise<Response>) {
  const s = await getSession();
  if (!s) return unauthorized();
  return handler(s);
}