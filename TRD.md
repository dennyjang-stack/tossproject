# TRD — 토스 로그인 프론트엔드 (Next.js, agent-browser MCP)

## Goal

https://toss.im 의 스타일을 `agent-browser` MCP로 관찰해 **로그인 페이지**를 Next.js로
구현하고, 로그인 성공 시 **홈(`/`)으로 리다이렉트**한다. 백엔드 코드는 이 워크트리에
없으므로, 프로젝트 문맥의 API 계약과 **글자 단위로 동일한 스텁 라우트 핸들러**를 포함해
독립적으로 실행·검증한다. **`be/`는 건드리지 않는다.**

## 참고

- 스타일 관찰 대상: `https://toss.im` — 자산 복제가 아니라 **색·타이포·버튼·여백의 재현**이 목표.
- API 계약·시드 계정은 프로젝트 문맥(CLAUDE.md)의 "API 계약" 표가 단일 소스.
- 시드 계정: `user@toss.local` / `toss1234!` (표시 이름 `토스사용자`).
- 세션 쿠키 이름은 `toss_session`이며 `HttpOnly`·`Path=/`·`SameSite=Lax` 속성을 가진다.

## 용어

- **로그인 폼** — 이메일/비밀번호 입력 + 로그인 버튼으로 구성된 UI.
- **계약 스텁** — `fe/app/api/{login,me,logout}/route.ts`. 계약 표와 동일한 상태코드·응답 형태·
  시드 계정으로 동작하는 Next.js Route Handler. 기본(dev)은 스텁, `NEXT_PUBLIC_API_MODE=real`일 때만
  rewrite로 실백엔드(:8080)에 연결.
- **오류 본문** — 모든 실패 응답의 JSON 형태 `{timestamp, status, message, errors[]}`. `errors[]`
  항목은 `{field, message}`. `timestamp`는 ISO-8601 문자열.

## 기능 요구사항

1. `agent-browser`로 toss.im을 열어 스타일 재현 포인트(색·타이포·버튼·여백)를 관찰·기록한다.
2. 계약 스텁 3개를 구현한다 (세션은 서버 측 세션 레지스트리로 단순 모사하되 로그아웃 시 무효화한다).
3. `/login` 페이지: 토스 느낌의 미니멀 로그인 폼. 제출 시 `POST /api/login`.
4. 로그인 성공 시 `/`(홈)으로 리다이렉트. 홈은 `GET /api/me`로 이름을 표시하고 로그아웃 버튼을 둔다.
5. 미로그인 상태로 홈 접근 시 `/login`으로 보낸다.

## Acceptance criteria

각 조건은 나열된 검증 방법(명령·기대 출력·경계 입력)으로 재현 가능해야 한다.

- [x] `agent-browser`로 `https://toss.im`을 열어 스냅샷/스크린샷으로 관찰한 재현 포인트를
      DESIGN.md에 **구체적 값과 함께** 기록한다: 프라이머리 파랑(`#3182f6`), 기본 본문색
      (`#191f28`), 보조 텍스트색(`#4e5968`), 카드 최대 너비·모서리·여백. 구현의 `.primary-button`
      배경 계산값이 `rgb(49, 130, 246)`으로 이 기록과 일치한다.
- [x] 계약 스텁 3개(`/api/login`·`/api/me`·`/api/logout`)가 계약 표와 글자 단위로 일치한다.
      `npm run verify:stub`(dev 서버 :3000, 스텁 모드)가 종료 코드 0으로 다음을 모두 통과한다:
      `POST /api/login` 공백 입력 → **400** + `errors[]`에 `email`·`password` 둘 다 포함,
      잘못된 자격 → **401**, 시드 계정 → **200** `{name:"토스사용자"}` + `Set-Cookie: toss_session=…; HttpOnly`,
      `GET /api/me` 유효 세션 → **200** `{email:"user@toss.local", name:"토스사용자"}`, 무쿠키 → **401**,
      `POST /api/logout` → **204** + `Max-Age=0`. 모든 실패 응답 본문은 오류 본문 형태를 따른다.
- [x] 로그아웃 뒤 **동일 세션 쿠키를 재전송한** `GET /api/me`가 **401**을 반환한다(서버 측 세션
      무효화가 실제로 동작하며, 만료 전 쿠키 재사용을 거부한다). `npm run verify:stub`의 재전송 검사로 확인한다.
- [x] `/login`이 이메일(`#email`, `type=email`)·비밀번호(`#password`, `type=password`) 입력과
      로그인 버튼(텍스트 "로그인")을 갖춘 토스 스타일 미니멀 카드 폼을 렌더한다. 프라이머리 버튼
      배경 계산값은 `rgb(49, 130, 246)`이다.
- [x] 로그인 성공 시 `router.replace('/')`로 이동해 히스토리에 로그인 페이지를 남기지 않는다
      (시드 계정 제출 후 URL 경로가 `/`가 되고 홈에 `토스사용자`가 표시된다). 실패(**401**) 시
      경로는 `/login`을 유지하며 폼에 인라인 경고 메시지("이메일 또는 비밀번호가 올바르지 않습니다.")를 보여준다.
- [x] 잘못된 이메일 형식·공백 제출 시 **400** 응답의 `errors[]`를 필드별 인라인 메시지로 보여준다:
      공백 제출은 `#email-error`·`#password-error` 둘 다 채워지고, 형식 오류 이메일(예 `bad-email`)은
      이메일 필드에만 "올바른 이메일 형식이 아닙니다."가 표시된다.
- [x] 홈(`/`)이 로그인 사용자 이름(`토스사용자`)과 이메일(`user@toss.local`)을 표시하고,
      로그아웃 버튼 클릭 시 `POST /api/logout`(**204**) 후 `router.replace('/login')`으로 `/login`에 돌아간다.
- [x] 미로그인 상태로 `/` 접근 시, 홈이 쿠키를 직접 해석하지 않고 `GET /api/me`의 **401** 판정에
      근거해 `/login`으로 리다이렉트한다(쿠키 없는 새 브라우저 컨텍스트에서 재현).
- [x] 뷰포트 360px~1280px에서 레이아웃이 깨지지 않는다: 360px와 1280px 모두
      `document.documentElement.scrollWidth === window.innerWidth`(가로 스크롤 없음). `fe/` 소스에
      외부 CDN·폰트·원격 이미지 링크가 없다(`http(s)://`·`@import`·원격 `url(...)` 검색 결과가
      rewrite 대상 `:8080`과 검증 스크립트의 localhost 외에는 없음).
- [x] `NEXT_PUBLIC_API_MODE=real`이면 `next.config.js`의 `rewrites()`가
      `/api/:path*` → `http://localhost:8080/api/:path*` 매핑을 반환하고, 기본 모드에서는 빈 배열(`[]`)을
      반환한다. UI 코드는 언제나 상대 경로 `/api/...`만 `fetch`한다(호스트 하드코딩 없음).
- [x] `agent-browser`로 dev 서버(:3000, 스텁 모드)에서 로그인 → 홈 리다이렉트 → 로그아웃 실동작을
      실제 이벤트로 재현해 확인한다.
- [x] `be/` 폴더를 수정하지 않았다 (`git diff --name-only`에 `be/` 경로 없음).
- [x] `npm ci`(취약점 0건)와 `npm run build`가 각각 종료 코드 0으로 끝난다 (TypeScript strict 통과).

## Out of scope

- 백엔드(`be/`) 구현 — 별도 루프 (스텁은 계약의 실행 가능한 사본일 뿐, 실서버 대체가 아님)
- 회원가입, 소셜 로그인, 2FA, 비밀번호 찾기
- 상태관리 라이브러리, UI 라이브러리, 외부 CDN, 배포·CI
