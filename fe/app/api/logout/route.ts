import { createLogoutCookie, invalidateSession } from '@/lib/stub-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  invalidateSession(request.headers.get('cookie'));

  return new Response(null, {
    status: 204,
    headers: {
      'Set-Cookie': createLogoutCookie(),
    },
  });
}
