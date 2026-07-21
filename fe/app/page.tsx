'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ErrorResponse, MeResponse } from '@/lib/api-types';

type ScreenState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; user: MeResponse };

async function readErrorResponse(response: Response): Promise<ErrorResponse | null> {
  try {
    return (await response.json()) as ErrorResponse;
  } catch {
    return null;
  }
}

export default function HomePage() {
  const router = useRouter();
  const [state, setState] = useState<ScreenState>({ status: 'loading' });
  const [loggingOut, setLoggingOut] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const response = await fetch('/api/me', {
          method: 'GET',
          credentials: 'same-origin',
        });

        if (!active) {
          return;
        }

        if (response.ok) {
          const user = (await response.json()) as MeResponse;
          setState({ status: 'ready', user });
          return;
        }

        if (response.status === 401) {
          router.replace('/login');
          return;
        }

        const payload = await readErrorResponse(response);
        setState({
          status: 'error',
          message: payload?.message ?? '잠시 후 다시 시도해 주세요.',
        });
      } catch {
        if (active) {
          setState({ status: 'error', message: '잠시 후 다시 시도해 주세요.' });
        }
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, [router, reloadToken]);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });

      if (response.status === 204) {
        router.replace('/login');
        return;
      }

      setState({ status: 'error', message: '잠시 후 다시 시도해 주세요.' });
    } catch {
      setState({ status: 'error', message: '잠시 후 다시 시도해 주세요.' });
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="auth-card home-card" aria-labelledby="home-title">
        <span className="brand-chip">Toss</span>
        <h1 className="page-title" id="home-title">
          홈
        </h1>

        {state.status === 'loading' ? <p className="loading-copy">로그인 정보를 확인하고 있어요.</p> : null}

        {state.status === 'error' ? (
          <div className="page-alert" role="alert" aria-live="polite">
            <p>{state.message}</p>
            <button
              className="retry-button"
              type="button"
              onClick={() => {
                setState({ status: 'loading' });
                setReloadToken((current) => current + 1);
              }}
            >
              다시 시도
            </button>
          </div>
        ) : null}

        {state.status === 'ready' ? (
          <>
            <div className="home-user">
              <p className="home-user-name">{state.user.name}님, 반가워요</p>
              <p className="home-user-email">{state.user.email}</p>
            </div>

            <div className="button-row" data-align="right">
              <button className="secondary-button" type="button" onClick={handleLogout} disabled={loggingOut}>
                {loggingOut ? '로그아웃 중...' : '로그아웃'}
              </button>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
