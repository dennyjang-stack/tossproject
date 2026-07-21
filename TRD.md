# TRD — 토스 로그인 프론트엔드 (Next.js, agent-browser MCP)

## Goal

https://toss.im 의 스타일을 `agent-browser` MCP로 관찰해 **로그인 페이지**를 Next.js로
구현하고, 로그인 성공 시 **홈(`/`)으로 리다이렉트**한다. 백엔드 코드는 이 워크트리에
없으므로, 프로젝트 문맥의 API 계약과 **글자 단위로 동일한 스텁 라우트 핸들러**를 포함해
독립적으로 실행·검증한다. **`be/`는 건드리지 않는다.**

## 참고

- 스타일 관찰 대상: `https://toss.im` — 자산 복제가 아니라 **색·타이포·버튼·여백의 재현**이 목표.
- API 계약·시드 계정은 프로젝트 문맥(AGENTS.md)의 "API 계약" 표가 단일 소스.
- 시드 계정: `user@toss.local` / `toss1234!` (표시 이름 `토스사용자`).
- 세션 쿠키 이름은 `toss_session`이며 `HttpOnly`·`Path=/`·`SameSite=Lax` 속성을 가진다.

## 용어

- **로그인 폼** — 이메일/비밀번호 입력 + 로그인 버튼으로 구성된 UI.
- **계약 스텁** — `fe/app/api/{login,me,logout}/route.ts`. 계약 표와 동일한 상태코드·응답 형태·
  시드 계정으로 동작하는 Next.js Route Handler. 기본(dev)은 스텁, `NEXT_PUBLIC_API_MODE=real`일 때만
  rewrite로 실백엔드(:8080)에 연결.
- **오류 본문** — 모든 실패 응답의 JSON 형태 `{timestamp, status, message, errors[]}`. 최상위 키는
  이 네 개이며 `errors[]` 항목은 `{field, message}` 두 키를 가진다. `timestamp`는 UTC를 나타내는
  `Z`로 끝나는 유효한 ISO-8601 문자열이다.

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
      잘못된 자격 → **401**, 시드 계정 → **200** `{name:"토스사용자"}` +
      `Set-Cookie: toss_session=…; Path=/; HttpOnly; SameSite=Lax`,
      `GET /api/me` 유효 세션 → **200** `{email:"user@toss.local", name:"토스사용자"}`, 무쿠키 → **401**,
      `POST /api/logout` → **204** + 빈 `toss_session` 값·`Max-Age=0`·`Path=/`·`HttpOnly`·`SameSite=Lax`.
      모든 실패 응답은 최상위 키가 정확히 `timestamp`·`status`·`message`·`errors`이고,
      `timestamp`가 유효한 UTC ISO-8601 문자열이며 모든 `errors[]` 항목이 `field`·`message`를 가진다.
- [x] 로그아웃 뒤 **동일 세션 쿠키를 재전송한** `GET /api/me`가 **401**을 반환한다(서버 측 세션
      무효화가 실제로 동작하며, 만료 전 쿠키 재사용을 거부한다). `npm run verify:stub`의 재전송 검사로 확인한다.
- [x] `/login`이 이메일(`#email`, `type=email`)·비밀번호(`#password`, `type=password`) 입력과
      로그인 버튼(텍스트 "로그인")을 갖춘 토스 스타일 미니멀 카드 폼을 렌더한다. 프라이머리 버튼
      배경 계산값은 `rgb(49, 130, 246)`이다.
- [x] 로그인 성공 시 `router.replace('/')`로 이동해 히스토리에 로그인 페이지를 남기지 않는다.
      시드 계정 제출 후 URL 경로가 `/`이고 홈에 `토스사용자`가 표시되며, 브라우저 뒤로가기를 해도
      직전 `/login`으로 돌아가지 않는다. 실패(**401**) 시 경로는 `/login`을 유지하며 폼에 인라인
      경고 메시지("이메일 또는 비밀번호가 올바르지 않습니다.")를 보여준다.
- [x] 잘못된 이메일 형식·공백 제출 시 **400** 응답의 `errors[]`를 필드별 인라인 메시지로 보여준다:
      공백 제출은 `#email-error`·`#password-error` 둘 다 채워지고, 형식 오류 이메일(예 `bad-email`)은
      이메일 필드에만 "올바른 이메일 형식이 아닙니다."가 표시된다(이때 `#password-error`는 비어 있다).
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
- [x] 현재 체크아웃에서 `npm run dev:fresh`로 새 dev 서버(:3000, 스텁 모드)를 시작한 뒤
      `agent-browser`의 고유한 새 세션에서 미로그인 홈 접근 → 400·401 오류 제출 → 로그인 → 홈
      리다이렉트 → 로그아웃을 실제 이벤트로 재현한다. URL·DOM·API 상태코드가 위 조건과 일치하고,
      Next.js 오류 오버레이가 뜨지 않으며 `browser_errors`(업케치 JS 예외·페이지 오류)가 **0건**이어야
      한다. 단, 경계 입력을 검증하는 과정에서 스텁이 의도적으로 반환한 4xx(400·401)에 대해 브라우저가
      남기는 "Failed to load resource" 네트워크 로그는 정상 동작이므로 실패로 보지 않는다(이 로그 외의
      `console.error`·애플리케이션 오류는 없어야 한다). :3000이 이미 점유됐다면 기존 프로세스를 종료하거나
      재사용하지 말고 `dev:fresh`의 안전한 실패(종료 코드 1)를 기록한다.
- [x] `be/` 폴더를 수정하지 않았다 (`git diff --name-only`에 `be/` 경로 없음).
- [x] `npm ci`, `npm audit --omit=dev`, `npm run build`가 각각 종료 코드 0으로 끝나며 감사 결과는
      취약점 0건이고 Next.js 컴파일·TypeScript strict 검사와 `/`·`/login`·세 API Route 생성이 확인된다.

## Out of scope

- 백엔드(`be/`) 구현 — 별도 루프 (스텁은 계약의 실행 가능한 사본일 뿐, 실서버 대체가 아님)
- 회원가입, 소셜 로그인, 2FA, 비밀번호 찾기
- 상태관리 라이브러리, UI 라이브러리, 외부 CDN, 배포·CI
# TRD — 토스 로그인 백엔드 (Spring Boot 인증 API)

## Goal

프로젝트 문맥의 **API 계약** 그대로, 시드 계정 기반 세션 로그인 API 3개
(`/api/login`, `/api/me`, `/api/logout`)를 `be/`에 구현한다. 프론트 없이
MockMvc 테스트만으로 검증을 완결한다. **`fe/`는 건드리지 않는다.**

## 용어

- **시드 계정** — `user@toss.local` / `toss1234!` (표시 이름 `토스사용자`). 인메모리 하드코딩.
- **세션** — `HttpSession` + HttpOnly 쿠키. JWT/OAuth 금지.

## 기능 요구사항

1. `POST /api/login` — 시드 계정 일치 시 세션 생성, `{name}` 반환. 불일치 401, 형식 오류 400.
2. `GET /api/me` — 세션 보유 시 `{email, name}`, 미로그인 401.
3. `POST /api/logout` — 세션 무효화, 204.
4. 모든 에러는 `ApiExceptionHandler` 한 곳에서 공통 형태로 변환한다.

## Acceptance criteria

- [x] `POST /api/login`에 시드 계정 `{"email":"user@toss.local","password":"toss1234!"}`을 보내면 **200**과 정확히 `{"name":"토스사용자"}`(다른 키 없이 `name` 하나)를 반환하고 로그인 세션을 생성하며, `JSESSIONID` 쿠키가 HttpOnly로 반환되도록 `be/src/main/resources/application.yml`에 `server.servlet.session.cookie.http-only=true`를 명시 설정한다. 이 명시 설정은 별도의 `@WebMvcTest`로 `server.servlet.session.cookie.http-only` 프로퍼티가 `"true"`임을 직접 검증한다
- [x] `POST /api/login`에서 등록되지 않은 이메일 또는 틀린 비밀번호를 보내면 각각 **401**과 공통 에러 형태를 반환하며, `status`는 401이고 `message`는 비어 있지 않은 문자열이며 `errors`는 빈 배열(`[]`)이다
- [x] `POST /api/login`에서 (a) 잘못된 이메일 형식, (b) 공백 이메일, (c) 공백 비밀번호를 보내면 각각 **400**을 반환하고, `errors[]`에 해당 입력 필드(`email`/`password`)와 정확히 일치하는 `field` 및 비어 있지 않은 `message`의 `{field, message}` 항목이 포함된다. (a)·(b)·(c)를 서로 다른 `@WebMvcTest`로 검증하고, 이메일과 비밀번호가 동시에 잘못된 요청도 별도 테스트로 두어 `errors[]`에 두 필드 항목이 모두 담기는지 검증한다
- [x] `GET /api/me`는 로그인 세션 쿠키가 있으면 **200**과 정확히 `{"email":"user@toss.local","name":"토스사용자"}`(두 키만)를 반환하고, (a) 세션 쿠키가 아예 없을 때와 (b) 세션은 있으나 로그인 사용자 속성이 없을 때 **각각** **401**과 공통 에러 형태를 반환한다. (a)·(b) 두 경계 케이스를 별도 테스트로 검증한다
- [x] `POST /api/logout`은 세션 유무와 관계없이 본문 없는 **204**를 반환하고(세션이 없어도 204), 기존 세션이 있으면 무효화하여 같은 세션으로 직후 호출한 `GET /api/me`가 **401**이 된다. 세션 있음·없음 두 경우를 별도 테스트로 검증하고, 두 204 응답 모두 본문 바이트 길이가 0임을 직접 단언한다
- [x] API 계약상 **400·401** 에러 응답은 정확히 `timestamp`, `status`, `message`, `errors` 네 키만 포함하며, `status`(정수)는 실제 HTTP 상태 코드와 일치하고 `message`는 비어 있지 않은 문자열이며 `errors`는 항상 배열(JSON array)이다. 400·401 각각에 대해 최상위 객체 크기가 4인지 별도 테스트로 검증한다
- [x] 모든 에러 응답의 `timestamp`는 epoch 숫자가 아닌 ISO-8601 UTC 문자열이며 **초(`ss`)까지 포함**하는 정규식 `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$`와 일치한다. `Instant.now().toString()`처럼 초를 항상 포함하는 직렬화를 쓰므로, TRD의 이 정규식과 테스트에서 검증에 사용하는 정규식 상수는 **글자 단위로 동일**해야 하며(초 그룹 누락 금지), 실제 응답 예 `2026-07-21T10:08:34.933Z`가 이 정규식에 매칭됨을 테스트로 확인한다
- [x] `git diff --name-only main...HEAD`와 작업 트리 변경 목록(`git status --porcelain`)에 `fe/` 경로가 없고, 변경은 백엔드 루프 범위인 `be/` 및 루프 문서(`TRD.md`, `DESIGN.md`, `IMPROVEMENTS.md` 등)에만 한정된다
- [x] 위 요청 행렬의 성공·실패(400/401)·경계 케이스와 HttpOnly 세션 쿠키 설정을 한국어 `@DisplayName`의 `@WebMvcTest` + `MockMvc` 테스트로 각 인수 조건마다 성공·실패 쌍이 존재하도록 검증하며, 특히 인수 조건 3의 입력 오류 4종과 인수 조건 4·5의 세션 경계를 빠짐없이 별도 테스트로 둔다. `be/`에서 새로 실행한 `./gradlew clean build`가 테스트 실패 없이 `BUILD SUCCESSFUL`·종료 코드 0으로 끝나야 한다

## Out of scope

- 회원가입, 소셜 로그인, 2FA, 비밀번호 찾기, 사용자 CRUD
- 프론트엔드(`fe/`) — 별도 루프
- 외부 DB·Docker, JWT/OAuth, 배포·CI
