import type { ErrorResponse, FieldError } from './api-types';

export const SESSION_COOKIE_NAME = 'toss_session';
export const SEED_EMAIL = 'user@toss.local';
export const SEED_PASSWORD = 'toss1234!';
export const SEED_NAME = '토스사용자';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type StubSessionRegistry = typeof globalThis & {
  tossStubActiveSessionIds?: Set<string>;
};

const sessionRegistry = globalThis as StubSessionRegistry;
const activeSessionIds = sessionRegistry.tossStubActiveSessionIds ??= new Set<string>();

type LoginPayload = {
  email?: unknown;
  password?: unknown;
} | null;

function timestamp() {
  return new Date().toISOString();
}

function getSessionId(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }

  return cookieHeader
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${SESSION_COOKIE_NAME}=`))
    ?.slice(`${SESSION_COOKIE_NAME}=`.length) ?? null;
}

export function isSeedSession(cookieHeader: string | null): boolean {
  const sessionId = getSessionId(cookieHeader);
  return sessionId !== null && activeSessionIds.has(sessionId);
}

export function invalidateSession(cookieHeader: string | null) {
  const sessionId = getSessionId(cookieHeader);

  if (sessionId) {
    activeSessionIds.delete(sessionId);
  }
}

export function createErrorResponse(
  status: number,
  message: string,
  errors: FieldError[] = [],
) {
  const body: ErrorResponse = {
    timestamp: timestamp(),
    status,
    message,
    errors,
  };

  return Response.json(body, { status });
}

function buildCookieAttributes(value: string, maxAge?: number) {
  const parts = [
    `${SESSION_COOKIE_NAME}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ];

  if (typeof maxAge === 'number') {
    parts.push(`Max-Age=${maxAge}`);
  }

  if (process.env.NODE_ENV === 'production') {
    parts.push('Secure');
  }

  return parts.join('; ');
}

export function createLoginCookie() {
  const sessionId = crypto.randomUUID();
  activeSessionIds.add(sessionId);
  return buildCookieAttributes(sessionId);
}

export function createLogoutCookie() {
  return buildCookieAttributes('', 0);
}

export async function parseLoginPayload(request: Request): Promise<LoginPayload | 'invalid-json'> {
  try {
    const payload = (await request.json()) as LoginPayload;
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return 'invalid-json';
    }

    return payload;
  } catch {
    return 'invalid-json';
  }
}

export function validateLoginPayload(payload: LoginPayload): FieldError[] {
  const errors: FieldError[] = [];

  if (typeof payload?.email !== 'string' || payload.email.trim().length === 0) {
    errors.push({ field: 'email', message: '이메일을 입력해 주세요.' });
  } else if (!EMAIL_PATTERN.test(payload.email.trim())) {
    errors.push({ field: 'email', message: '올바른 이메일 형식이 아닙니다.' });
  }

  if (typeof payload?.password !== 'string' || payload.password.trim().length === 0) {
    errors.push({ field: 'password', message: '비밀번호를 입력해 주세요.' });
  }

  return errors;
}

export function getLoginPayloadValues(payload: LoginPayload) {
  return {
    email: typeof payload?.email === 'string' ? payload.email.trim() : '',
    password: typeof payload?.password === 'string' ? payload.password : '',
  };
}
