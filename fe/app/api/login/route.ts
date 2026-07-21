import {
  createErrorResponse,
  createLoginCookie,
  getLoginPayloadValues,
  parseLoginPayload,
  SEED_EMAIL,
  SEED_NAME,
  SEED_PASSWORD,
  validateLoginPayload,
} from '@/lib/stub-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const parsed = await parseLoginPayload(request);

  if (parsed === 'invalid-json') {
    return createErrorResponse(400, '요청 값이 올바르지 않습니다.');
  }

  const validationErrors = validateLoginPayload(parsed);
  if (validationErrors.length > 0) {
    return createErrorResponse(400, '요청 값이 올바르지 않습니다.', validationErrors);
  }

  const { email, password } = getLoginPayloadValues(parsed);

  if (email !== SEED_EMAIL || password !== SEED_PASSWORD) {
    return createErrorResponse(401, '이메일 또는 비밀번호가 올바르지 않습니다.');
  }

  const response = Response.json({ name: SEED_NAME }, { status: 200 });
  response.headers.set('Set-Cookie', createLoginCookie());
  return response;
}
