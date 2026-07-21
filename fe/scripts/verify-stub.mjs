const baseUrl = process.env.VERIFY_BASE_URL ?? 'http://127.0.0.1:3000';

function fail(message) {
  throw new Error(`계약 검증 실패: ${message}`);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    fail(`${response.url}의 JSON 응답을 읽을 수 없습니다.`);
  }
}

function assertErrorPayload(payload, status) {
  assert(payload && typeof payload === 'object', '오류 본문이 객체여야 합니다.');
  assert(payload.status === status, `오류 상태가 ${status}여야 합니다.`);
  assert(typeof payload.message === 'string', '오류 메시지가 문자열이어야 합니다.');
  assert(Array.isArray(payload.errors), 'errors가 배열이어야 합니다.');
  assert(typeof payload.timestamp === 'string' && !Number.isNaN(Date.parse(payload.timestamp)), 'timestamp가 ISO-8601 시간이어야 합니다.');
}

const invalid = await fetch(`${baseUrl}/api/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: ' ', password: ' ' }),
});
assert(invalid.status === 400, '공백 로그인 요청은 400이어야 합니다.');
const invalidBody = await readJson(invalid);
assertErrorPayload(invalidBody, 400);
assert(invalidBody.errors.some((error) => error.field === 'email'), '400 응답에 이메일 오류가 있어야 합니다.');
assert(invalidBody.errors.some((error) => error.field === 'password'), '400 응답에 비밀번호 오류가 있어야 합니다.');

const rejected = await fetch(`${baseUrl}/api/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@toss.local', password: 'wrong-password' }),
});
assert(rejected.status === 401, '잘못된 자격 증명은 401이어야 합니다.');
assertErrorPayload(await readJson(rejected), 401);

const login = await fetch(`${baseUrl}/api/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@toss.local', password: 'toss1234!' }),
});
assert(login.status === 200, '시드 계정 로그인은 200이어야 합니다.');
assert((await readJson(login)).name === '토스사용자', '로그인 응답 이름이 일치해야 합니다.');
const setCookie = login.headers.get('set-cookie');
assert(setCookie?.includes('toss_session=authenticated'), '로그인 응답에 세션 쿠키가 있어야 합니다.');
assert(setCookie?.includes('HttpOnly'), '세션 쿠키가 HttpOnly여야 합니다.');
const cookie = setCookie.split(';', 1)[0];

const me = await fetch(`${baseUrl}/api/me`, { headers: { cookie } });
assert(me.status === 200, '인증된 /api/me은 200이어야 합니다.');
const meBody = await readJson(me);
assert(meBody.email === 'user@toss.local' && meBody.name === '토스사용자', '/api/me 응답이 시드 사용자와 일치해야 합니다.');

const logout = await fetch(`${baseUrl}/api/logout`, { method: 'POST', headers: { cookie } });
assert(logout.status === 204, '로그아웃은 204여야 합니다.');
assert(logout.headers.get('set-cookie')?.includes('Max-Age=0'), '로그아웃이 세션 쿠키를 만료시켜야 합니다.');

const unauthenticated = await fetch(`${baseUrl}/api/me`);
assert(unauthenticated.status === 401, '쿠키 없는 /api/me은 401이어야 합니다.');
assertErrorPayload(await readJson(unauthenticated), 401);

console.log('계약 스텁 로그인·인증 확인·로그아웃 흐름을 검증했습니다.');
