import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';

const scenarios = [
  ['오류 최상위 추가 키', 'error-extra-key', '오류 본문의 키'],
  ['필드 오류 추가 키', 'field-error-extra-key', '필드 오류의 키'],
  ['UTC Z가 아닌 timestamp', 'timestamp-offset', 'UTC Z'],
  ['로그인 쿠키 Path 누락', 'login-cookie-path', 'Path=/'],
  ['로그인 쿠키 SameSite 누락', 'login-cookie-same-site', 'SameSite=Lax'],
  ['로그아웃 쿠키 값 유지', 'logout-cookie-value', '빈 값'],
  ['로그아웃 쿠키 Path 누락', 'logout-cookie-path', 'Path=/'],
  ['로그아웃 쿠키 HttpOnly 누락', 'logout-cookie-http-only', 'HttpOnly'],
  ['로그아웃 쿠키 SameSite 누락', 'logout-cookie-same-site', 'SameSite=Lax'],
];

function errorPayload(status, message, errors = []) {
  return {
    timestamp: '2026-07-21T12:00:00.000Z',
    status,
    message,
    errors,
  };
}

function sendJson(response, status, body, headers = {}) {
  response.writeHead(status, { 'Content-Type': 'application/json', ...headers });
  response.end(JSON.stringify(body));
}

function createContractServer(scenario) {
  let loggedOut = false;

  return createServer((request, response) => {
    if (request.url === '/api/login' && request.method === 'POST') {
      let body = '';
      request.setEncoding('utf8');
      request.on('data', (chunk) => {
        body += chunk;
      });
      request.on('end', () => {
        const credentials = JSON.parse(body);
        if (!credentials.email.trim() || !credentials.password.trim()) {
          const emailError = { field: 'email', message: '이메일을 입력해 주세요.' };
          if (scenario === 'field-error-extra-key') {
            emailError.code = 'required';
          }
          const payload = errorPayload(400, '요청 값이 올바르지 않습니다.', [
            emailError,
            { field: 'password', message: '비밀번호를 입력해 주세요.' },
          ]);
          if (scenario === 'error-extra-key') {
            payload.traceId = '허용되지-않는-키';
          }
          if (scenario === 'timestamp-offset') {
            payload.timestamp = '2026-07-21T12:00:00.000+00:00';
          }
          sendJson(response, 400, payload);
          return;
        }

        if (credentials.password === 'wrong-password') {
          sendJson(response, 401, errorPayload(401, '이메일 또는 비밀번호가 올바르지 않습니다.'));
          return;
        }

        const attributes = ['toss_session=session-id', 'Path=/', 'HttpOnly', 'SameSite=Lax'];
        if (scenario === 'login-cookie-path') {
          attributes.splice(attributes.indexOf('Path=/'), 1);
        }
        if (scenario === 'login-cookie-same-site') {
          attributes.splice(attributes.indexOf('SameSite=Lax'), 1);
        }
        sendJson(response, 200, { name: '토스사용자' }, { 'Set-Cookie': attributes.join('; ') });
      });
      return;
    }

    if (request.url === '/api/logout' && request.method === 'POST') {
      loggedOut = true;
      const attributes = ['toss_session=', 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
      if (scenario === 'logout-cookie-value') {
        attributes[0] = 'toss_session=session-id';
      }
      if (scenario === 'logout-cookie-path') {
        attributes.splice(attributes.indexOf('Path=/'), 1);
      }
      if (scenario === 'logout-cookie-http-only') {
        attributes.splice(attributes.indexOf('HttpOnly'), 1);
      }
      if (scenario === 'logout-cookie-same-site') {
        attributes.splice(attributes.indexOf('SameSite=Lax'), 1);
      }
      response.writeHead(204, { 'Set-Cookie': attributes.join('; ') });
      response.end();
      return;
    }

    if (request.url === '/api/me' && request.method === 'GET') {
      if (request.headers.cookie === 'toss_session=session-id' && !loggedOut) {
        sendJson(response, 200, { email: 'user@toss.local', name: '토스사용자' });
        return;
      }
      sendJson(response, 401, errorPayload(401, '로그인이 필요합니다.'));
      return;
    }

    response.writeHead(404);
    response.end();
  });
}

function runVerifier(baseUrl) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['scripts/verify-stub.mjs'], {
      cwd: new URL('..', import.meta.url),
      env: { ...process.env, VERIFY_BASE_URL: baseUrl },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.on('data', (chunk) => {
      output += chunk;
    });
    child.stderr.on('data', (chunk) => {
      output += chunk;
    });
    child.on('error', reject);
    child.on('close', (code) => resolve({ code, output }));
  });
}

for (const [description, scenario, expectedMessage] of scenarios) {
  const server = createContractServer(scenario);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();

  try {
    const result = await runVerifier(`http://127.0.0.1:${address.port}`);
    assert.notEqual(result.code, 0, `${description} 위반을 검증기가 거부해야 합니다.`);
    assert.match(result.output, new RegExp(expectedMessage), `${description} 실패 이유가 명확해야 합니다.`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

console.log('계약 검증기의 엄격한 오류·쿠키 단언을 확인했습니다.');
