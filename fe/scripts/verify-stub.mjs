const baseUrl = process.env.VERIFY_BASE_URL ?? 'http://127.0.0.1:3000';

function fail(message) {
  throw new Error(`계약 검증 실패: ${message}`);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function assertExactKeys(value, expectedKeys, description) {
  const actualKeys = Object.keys(value).sort();
  const sortedExpectedKeys = [...expectedKeys].sort();
  assert(
    JSON.stringify(actualKeys) === JSON.stringify(sortedExpectedKeys),
    `${description}의 키는 ${sortedExpectedKeys.join(', ')}만 있어야 합니다.`,
  );
}

function assertUtcTimestamp(value) {
  assert(
    typeof value === 'string' && value.endsWith('Z') && !Number.isNaN(Date.parse(value)),
    'timestamp가 유효한 UTC Z ISO-8601 시간이어야 합니다.',
  );
}

function assertCookieAttributes(header, { logout = false } = {}) {
  assert(typeof header === 'string', 'Set-Cookie 헤더가 있어야 합니다.');
  const [cookie, ...attributes] = header.split(';').map((part) => part.trim());
  const normalizedAttributes = attributes.map((attribute) => attribute.toLowerCase());

  assert(cookie.startsWith('toss_session='), '쿠키 이름이 toss_session이어야 합니다.');
  assert(normalizedAttributes.includes('path=/'), '쿠키에 Path=/ 속성이 있어야 합니다.');
  assert(normalizedAttributes.includes('httponly'), '쿠키가 HttpOnly여야 합니다.');
  assert(normalizedAttributes.includes('samesite=lax'), '쿠키에 SameSite=Lax 속성이 있어야 합니다.');

  if (logout) {
    assert(cookie === 'toss_session=', '로그아웃 쿠키 값이 빈 값이어야 합니다.');
    assert(normalizedAttributes.includes('max-age=0'), '로그아웃 쿠키에 Max-Age=0 속성이 있어야 합니다.');
  } else {
    assert(cookie.length > 'toss_session='.length, '로그인 쿠키에 세션 값이 있어야 합니다.');
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
  assertExactKeys(payload, ['timestamp', 'status', 'message', 'errors'], '오류 본문');
  assert(payload.status === status, `오류 상태가 ${status}여야 합니다.`);
  assert(typeof payload.message === 'string', '오류 메시지가 문자열이어야 합니다.');
  assert(Array.isArray(payload.errors), 'errors가 배열이어야 합니다.');
  assertUtcTimestamp(payload.timestamp);
  payload.errors.forEach((error) => {
    assert(error && typeof error === 'object', '필드 오류가 객체여야 합니다.');
    assertExactKeys(error, ['field', 'message'], '필드 오류');
    assert(typeof error.field === 'string', '필드 오류의 field가 문자열이어야 합니다.');
    assert(typeof error.message === 'string', '필드 오류의 message가 문자열이어야 합니다.');
  });
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
assertCookieAttributes(setCookie);
const cookie = setCookie.split(';', 1)[0];

const me = await fetch(`${baseUrl}/api/me`, { headers: { cookie } });
assert(me.status === 200, '인증된 /api/me은 200이어야 합니다.');
const meBody = await readJson(me);
assert(meBody.email === 'user@toss.local' && meBody.name === '토스사용자', '/api/me 응답이 시드 사용자와 일치해야 합니다.');

const logout = await fetch(`${baseUrl}/api/logout`, { method: 'POST', headers: { cookie } });
assert(logout.status === 204, '로그아웃은 204여야 합니다.');
assertCookieAttributes(logout.headers.get('set-cookie'), { logout: true });

const replayed = await fetch(`${baseUrl}/api/me`, { headers: { cookie } });
assert(replayed.status === 401, '로그아웃 뒤 같은 세션 쿠키를 재전송한 /api/me은 401이어야 합니다.');
assertErrorPayload(await readJson(replayed), 401);

const unauthenticated = await fetch(`${baseUrl}/api/me`);
assert(unauthenticated.status === 401, '쿠키 없는 /api/me은 401이어야 합니다.');
assertErrorPayload(await readJson(unauthenticated), 401);

console.log('계약 스텁 로그인·인증 확인·로그아웃 흐름을 검증했습니다.');
