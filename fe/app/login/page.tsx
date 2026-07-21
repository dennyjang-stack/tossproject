'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ErrorResponse, FieldError } from '@/lib/api-types';

type FieldState = {
  value: string;
  error: string;
};

const INITIAL_FIELD_STATE: FieldState = {
  value: '',
  error: '',
};

function mapFieldErrors(errors: FieldError[]) {
  const next = {
    email: '',
    password: '',
  };

  for (const error of errors) {
    if (error.field === 'email' || error.field === 'password') {
      next[error.field] = error.message;
    }
  }

  return next;
}

async function readErrorResponse(response: Response): Promise<ErrorResponse | null> {
  try {
    return (await response.json()) as ErrorResponse;
  } catch {
    return null;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<FieldState>(INITIAL_FIELD_STATE);
  const [password, setPassword] = useState<FieldState>(INITIAL_FIELD_STATE);
  const [alertMessage, setAlertMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setAlertMessage('');
    setEmail((current) => ({ ...current, error: '' }));
    setPassword((current) => ({ ...current, error: '' }));

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.value,
          password: password.value,
        }),
      });

      if (response.ok) {
        router.replace('/');
        return;
      }

      const payload = await readErrorResponse(response);

      if (response.status === 400 && payload) {
        const mapped = mapFieldErrors(payload.errors);
        setEmail((current) => ({ ...current, error: mapped.email }));
        setPassword((current) => ({ ...current, error: mapped.password }));

        if (payload.errors.length === 0) {
          setAlertMessage(payload.message);
        }

        return;
      }

      if (response.status === 401 && payload) {
        setAlertMessage(payload.message);
        return;
      }

      setAlertMessage('잠시 후 다시 시도해 주세요.');
    } catch {
      setAlertMessage('잠시 후 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="auth-card" aria-labelledby="login-title">
        <span className="brand-chip">Toss</span>
        <h1 className="page-title" id="login-title">
          토스 로그인
        </h1>
        <p className="page-description">시드 계정으로 로그인해 홈 화면을 확인하세요.</p>

        <form className="login-form" noValidate onSubmit={handleSubmit}>
          {alertMessage ? (
            <div className="form-alert" role="alert" aria-live="polite">
              <p>{alertMessage}</p>
            </div>
          ) : null}

          <div className="form-stack">
            <label className="field" htmlFor="email">
              <span className="field-label">이메일</span>
              <input
                id="email"
                className="field-input"
                type="email"
                name="email"
                autoComplete="username"
                placeholder="user@toss.local"
                value={email.value}
                onChange={(event) => setEmail({ value: event.target.value, error: '' })}
                aria-invalid={email.error ? 'true' : 'false'}
                aria-describedby={email.error ? 'email-error' : undefined}
              />
              <span id="email-error" className="field-error" data-empty={!email.error}>
                {email.error || ' '}
              </span>
            </label>

            <label className="field" htmlFor="password">
              <span className="field-label">비밀번호</span>
              <input
                id="password"
                className="field-input"
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="toss1234!"
                value={password.value}
                onChange={(event) => setPassword({ value: event.target.value, error: '' })}
                aria-invalid={password.error ? 'true' : 'false'}
                aria-describedby={password.error ? 'password-error' : undefined}
              />
              <span id="password-error" className="field-error" data-empty={!password.error}>
                {password.error || ' '}
              </span>
            </label>
          </div>

          <div className="button-row">
            <button className="primary-button" type="submit" disabled={submitting}>
              {submitting ? '로그인 중...' : '로그인'}
            </button>
          </div>
        </form>

        <p className="helper-text">계정: user@toss.local / toss1234!</p>
      </section>
    </main>
  );
}
