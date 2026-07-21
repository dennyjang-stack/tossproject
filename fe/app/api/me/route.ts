import { createErrorResponse, isSeedSession, SEED_EMAIL, SEED_NAME } from '@/lib/stub-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!isSeedSession(request.headers.get('cookie'))) {
    return createErrorResponse(401, '로그인이 필요합니다.');
  }

  return Response.json(
    {
      email: SEED_EMAIL,
      name: SEED_NAME,
    },
    { status: 200 },
  );
}
