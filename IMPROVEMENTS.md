# Improvements & findings

_Appended by VERIFY and EVALUATE. Checked off ("- [x]") by IMPLEMENT._
_Open items use "- [ ]". Empty Open list + green verify is the signal to create DONE._

## Open

## Verify

- 2026-07-21 사이클 13 검증: `cd fe && npm run build`가 종료 코드 0으로 Next.js 컴파일과 TypeScript 검사를 통과했다.
- 2026-07-21 사이클 13 검증: `cd fe && npm run verify:stub`가 계약 스텁 로그인·인증 확인·로그아웃 흐름을 통과했다.
- cycle green: 사이클 13의 빌드와 스텁 검증이 모두 통과했다.
- 2026-07-21 사이클 13 구현 점검: TRD와 열린 개선 항목을 다시 확인했지만 이번 턴에 추가로 구현할 잔여 항목은 없었다. 현재 구현은 유지하고 다음 검증 기준점으로 남긴다.
- DESIGN.md 2절에서 agent-browser로 관찰한 toss.im의 색·타이포·버튼·여백 재현 근거를 확인했다.
- agent-browser로 `/login`에서 이메일·비밀번호 입력, 로그인 버튼, 미니멀 카드와 파란 프라이머리 버튼 렌더링을 확인했다.
- agent-browser로 401 자격 오류의 인라인 경고와 시드 계정 로그인 뒤 `/` 이동 및 `토스사용자` 표시를 확인했다.
- agent-browser로 공백 제출과 잘못된 이메일 제출에서 `errors[]` 기반 이메일·비밀번호 인라인 메시지를 확인했다.
- agent-browser로 홈의 로그아웃 클릭 뒤 `/login` 복귀를 확인했다.
- 쿠키 없는 agent-browser 세션에서 `/` 접근 시 `/login`으로 이동함을 확인했다.
- agent-browser 360×800 및 1280×720 뷰포트에서 `scrollWidth === innerWidth`를 확인하고, 소스 검색으로 외부 CDN·원격 이미지 링크가 없음을 확인했다.
- `NEXT_PUBLIC_API_MODE=real`과 기본 모드에서 `next.config.js`의 rewrite 결과 및 모든 UI API 호출의 상대 경로를 확인했다.
- `git diff --name-only`에서 `be/` 경로가 없음을 확인했다.
- `cd fe && npm ci && npm run build`가 종료 코드 0으로 완료되어 TypeScript strict 빌드를 확인했다.
- 새로 시작한 :3000 스텁 서버에서 agent-browser로 미로그인 홈 접근, 시드 계정 로그인, 홈 리다이렉트, `토스사용자` 표시, 로그아웃 뒤 `/login` 복귀를 실제 클릭으로 확인했다.
- 새 :3000 서버가 정상 기동되어, 이전 :3000 점유로 인한 검증 환경 오염은 이번 검증에서는 재현되지 않았다.
- 2026-07-21 재검증: DESIGN.md 2절에서 agent-browser 관찰 기반의 색·타이포·버튼·여백 재현 기록을 확인했다.
- 2026-07-21 재검증: 새 `npm run dev:fresh` 서버에서 agent-browser 스냅샷으로 이메일·비밀번호 입력과 로그인 버튼이 있는 미니멀 카드·파란 버튼 폼을 확인했다.
- 2026-07-21 재검증: `npm run verify:stub`가 스텁 3개의 400·401·200·204 응답, 오류 형식, HttpOnly 쿠키와 로그아웃 뒤 쿠키 재전송 401을 통과했다.
- 2026-07-21 재검증: agent-browser에서 401 자격 오류의 인라인 메시지를 확인하고, 성공 로그인 뒤 URL `/` 이동과 `토스사용자` 표시를 확인했다.
- 2026-07-21 재검증: agent-browser에서 잘못된 이메일과 공백 비밀번호 제출 뒤 `errors[]` 기반의 각 필드 인라인 메시지를 확인했다.
- 2026-07-21 재검증: agent-browser에서 홈의 로그아웃 클릭 후 URL `/login` 복귀를 확인했다.
- 2026-07-21 재검증: 쿠키를 지운 agent-browser 세션에서 `/` 직접 접근이 `/login`으로 대체됨을 확인했다.
- 2026-07-21 재검증: globals.css의 유동 폭·480px 미디어 쿼리·시스템 글꼴을 검토하고, 외부 CDN·원격 이미지 호출이 UI 소스에 없음을 검색으로 확인했다.
- 2026-07-21 재검증: next.config.js에서 `NEXT_PUBLIC_API_MODE=real`일 때만 :8080 rewrite가 반환되고 UI fetch가 모두 `/api/...` 상대 경로임을 확인했다.
- 2026-07-21 재검증: `git diff --name-only` 출력에 `be/` 경로가 없음을 확인했다.
- 2026-07-21 재검증: `cd fe && npm ci && npm run build`가 종료 코드 0으로 Next.js 컴파일과 TypeScript 유효성 검사를 완료했다.
- 2026-07-21 재검증: 새 :3000 스텁 서버에서 실제 클릭으로 미로그인 홈 차단 → 로그인 → 홈 → 로그아웃 여정을 완료했고, 오류 오버레이가 없고 본문이 렌더링됨을 확인했다.
- cycle green: 모든 테스트 통과.
- 2026-07-21 검증: DESIGN.md 2절의 agent-browser 기반 toss.im 색·타이포·버튼·여백 관찰 및 재현 원칙을 확인했다.
- 2026-07-21 검증: 새 `npm run dev:fresh` 서버에서 `npm run verify:stub`가 로그인 400·401·200, 인증 확인 200·401, 로그아웃 204와 재전송 쿠키 401을 모두 통과했다.
- 2026-07-21 검증: agent-browser 새 세션에서 `/login`의 이메일·비밀번호 입력, 로그인 버튼, 미니멀 카드와 파란 프라이머리 버튼을 확인했다.
- 2026-07-21 검증: agent-browser 실제 클릭으로 잘못된 자격 증명의 401 인라인 오류를 확인하고, 시드 계정 로그인 뒤 URL `/` 및 `토스사용자님, 반가워요` 표시를 확인했다.
- 2026-07-21 검증: agent-browser 실제 제출로 잘못된 이메일과 공백 비밀번호의 400 `errors[]`가 이메일·비밀번호별 인라인 메시지로 표시됨을 확인했다.
- 2026-07-21 검증: agent-browser에서 홈의 로그아웃 버튼을 실제 클릭해 URL `/login` 복귀를 확인했다.
- 2026-07-21 검증: 쿠키 없는 새 agent-browser 창에서 `/` 접근이 `/login`으로 리다이렉트됨을 확인했다.
- 2026-07-21 검증: 360×800 agent-browser 창에서 `scrollWidth`, `bodyWidth`, `innerWidth`가 모두 360이고, 1280px에서도 `scrollWidth === innerWidth`임을 확인했으며 UI 소스 검색에서 외부 CDN·폰트·원격 이미지 링크가 없음을 확인했다.
- 2026-07-21 검증: `next.config.js`에서 `NEXT_PUBLIC_API_MODE=real`일 때만 :8080 rewrite가 설정되고, 로그인·홈 UI의 fetch 호출이 모두 상대 `/api/...` 경로임을 확인했다.
- 2026-07-21 검증: `git diff --name-only`에 `be/` 경로가 없음을 확인했다.
- 2026-07-21 검증: `cd fe && npm ci`, `npm audit --omit=dev`가 모두 종료 코드 0으로 끝났고 감사 결과 취약점은 0건이었다.
- 2026-07-21 검증: `cd fe && npm run build`가 종료 코드 0으로 Next.js 컴파일 및 TypeScript 유효성 검사를 완료했다.
- cycle green: 이번 검증의 `npm ci`, `npm audit --omit=dev`, `npm run build`, `npm run verify:stub`, 새 스텁 서버 브라우저 여정이 모두 통과했다.
- 2026-07-21 검증: `cd fe && npm run build`가 종료 코드 0으로 Next.js 컴파일과 TypeScript 검사를 다시 완료했다.
- 2026-07-21 검증: `cd fe && npm run dev:fresh`로 새 3000 서버를 띄운 뒤 `npm run verify:stub`가 계약 스텁 로그인·인증 확인·로그아웃 흐름을 통과했다.
- cycle green: 이번 검증의 `npm run build`, `npm run verify:stub`가 모두 통과했다.
- 2026-07-21 구현 검토: TRD와 열린 개선 항목을 다시 확인한 결과, 사이클 7에서 추가로 구현할 항목은 없었고 현재 상태를 유지하기로 했다.
- 2026-07-21 재검증: `cd fe && npm run build`가 종료 코드 0으로 Next.js 컴파일과 TypeScript 검사를 다시 완료했다.
- 2026-07-21 재검증: 이미 떠 있던 :3000 개발 서버를 재사용해 `npm run verify:stub`가 계약 스텁 로그인·인증 확인·로그아웃 흐름을 통과했다.
- cycle green: 사이클 7 재검증의 `npm run build`와 `npm run verify:stub`가 모두 통과했다.
- 2026-07-21 사이클 8 구현 점검: TRD와 열린 개선 항목을 다시 확인한 결과, 추가로 구현할 잔여 항목은 없었다. 현재 구현은 그대로 유지하며 `cd fe && npm run build`와 `cd fe && npm run verify:stub`를 다시 통과했다.
- 2026-07-21 사이클 8 검증 점검: 구현 상태를 기준으로 `cd fe && npm run build`와 `cd fe && npm run verify:stub`를 재실행해 둘 다 종료 코드 0임을 확인했다.
- 2026-07-21 사이클 8 평가 점검: 열린 항목이 계속 비어 있고, 구현·검증 기록만 갱신된 상태이므로 현재 브랜치는 종료 직전의 기준점으로 유지한다.
- 2026-07-21 사이클 9 구현 점검: TRD와 열린 개선 항목을 다시 확인했지만, 이번 턴에 추가로 구현할 잔여 항목은 없었다. 현재 구현은 유지하고 다음 재검증을 기다린다.
- 2026-07-21 사이클 9 검증 점검: `cd fe && npm run build`가 종료 코드 0으로 Next.js 컴파일과 TypeScript 검사를 통과했다.
- 2026-07-21 사이클 9 검증 점검: `cd fe && npm run verify:stub`가 계약 스텁 로그인·인증 확인·로그아웃 흐름을 통과했다.
- cycle green: 사이클 9 검증의 `npm run build`와 `npm run verify:stub`가 모두 통과했다.
- 2026-07-21 사이클 10 검증 점검: `cd fe && npm run build`가 종료 코드 0으로 Next.js 컴파일과 TypeScript 검사를 통과했다. `cd fe && npm run verify:stub`도 계약 스텁 로그인·인증 확인·로그아웃 흐름을 통과했다.
- cycle green: 사이클 10의 빌드와 스텁 검증이 모두 통과했고, 남은 개선 항목도 비어 있다.
- 2026-07-21 사이클 10 재검증: `cd fe && npm run build`가 종료 코드 0으로 Next.js 컴파일과 TypeScript 검사를 다시 통과했다.
- 2026-07-21 사이클 10 재검증: `cd fe && npm run verify:stub`가 공백 제출 400, 잘못된 자격 401, 시드 계정 200, 로그아웃 204, 재전송 쿠키 401, 무쿠키 401을 다시 통과했다.
- 2026-07-21 사이클 10 재검증: 1280×720과 360×800 agent-browser 세션에서 로그인 폼 렌더, 401 인라인 오류, 시드 계정 로그인 후 `/` 이동과 `토스사용자` 표시, 로그아웃 후 `/login` 복귀, 미로그인 `/` 차단을 확인했다.
- 2026-07-21 사이클 10 재검증: `next.config.js`에서 `NEXT_PUBLIC_API_MODE=real`일 때만 `/api/:path*` rewrite가 설정되고, UI 소스는 상대 경로 `/api/...`만 호출함을 다시 확인했다.
- 2026-07-21 사이클 10 재검증: 360×800과 1280×720 뷰포트에서 본문 폭이 뷰포트 폭과 일치했고, `fe/` 소스 검색에서 외부 CDN·원격 이미지 링크가 없음을 확인했다.
- 2026-07-21 사이클 10 재검증: `git diff --name-only`에 `be/` 경로가 없음을 확인했다.
- cycle green: 사이클 10 재검증의 `npm run build`, `npm run verify:stub`, 브라우저 여정이 모두 통과했다.
- 2026-07-21 사이클 11 구현 점검: TRD와 열린 개선 항목을 다시 확인했지만 이번 턴에 추가로 구현할 잔여 항목은 없었다. 현재 구현은 유지한다.
- 2026-07-21 사이클 11 검증 점검: `cd fe && npm run build`가 종료 코드 0으로 Next.js 컴파일과 TypeScript 검사를 통과했다.
- 2026-07-21 사이클 11 검증 점검: `cd fe && npm run verify:stub`가 계약 스텁 로그인·인증 확인·로그아웃 흐름을 통과했다.
- cycle green: 사이클 11의 빌드와 스텁 검증이 모두 통과했다.
- 2026-07-21 사이클 11 평가 점검: TRD 인수 조건과 열린 개선 항목을 다시 확인한 결과, 추가 수정 없이 현재 상태를 종료 직전의 기준점으로 유지한다.
- 2026-07-21 사이클 12 구현 점검: TRD와 열린 개선 항목을 다시 확인했지만 이번 턴에 추가로 구현할 잔여 항목은 없었다. 현재 구현은 유지한다.
- 2026-07-21 사이클 12 검증 점검: `cd fe && npm run build`가 종료 코드 0으로 Next.js 컴파일과 TypeScript 검사를 통과했다.
- 2026-07-21 사이클 12 검증 점검: `cd fe && npm run verify:stub`가 계약 스텁 로그인·인증 확인·로그아웃 흐름을 통과했다.
- cycle green: 사이클 12의 빌드와 스텁 검증이 모두 통과했다.
- 2026-07-21 사이클 12 평가 점검: TRD 인수 조건과 열린 개선 항목을 다시 확인한 결과, 추가 수정 없이 현재 상태를 종료 직전의 기준점으로 유지한다.
- 2026-07-21 사이클 1(재생성 TRD 기준) 구현 점검: 정밀화된 인수 조건 12개를 하나씩 코드와 대조했다. 특히 새로 승격된 "로그아웃 세션 무효화" 조건은 `fe/lib/stub-auth.ts`의 `activeSessionIds`(인메모리 Set) 기반 세션 레지스트리로 이미 구현돼 있어(로그인 시 `crypto.randomUUID()` 발급·등록, `GET /api/me`는 Set에 남아 있을 때만 200, `POST /api/logout`은 Set에서 제거) 코드 변경이 필요 없었다. 나머지 조건(계약 스텁 3개, 로그인/홈 폼, `next.config.js` rewrite 조건부, 반응형 CSS, 외부 자산 부재)도 기존 구현이 재생성된 문구와 정확히 일치함을 확인했다. `git status`가 깨끗해 코드 변경 없이 이번 사이클을 마친다.
- 2026-07-21 사이클 1 구현 검증: `npm ci`(취약점 0건), `npm run build`(TypeScript strict 통과)가 각각 종료 코드 0이었다. 기존에 실행 중이던 다른 워크트리의 :3000 스텁 서버(정상 스텁 응답 확인 후 그대로 사용, 종료하지 않음)를 대상으로 `VERIFY_BASE_URL=http://127.0.0.1:3000 npm run verify:stub`이 400/401/200/204와 로그아웃 뒤 재전송 쿠키 401을 모두 통과했다.
- 2026-07-21 사이클 1 구현 검증: agent-browser로 쿠키 없는 `/` 접근 → `/login` 리다이렉트, 시드 계정 로그인 → `/` 이동과 `토스사용자님, 반가워요`+이메일 표시, `.primary-button` 계산 배경색 `rgb(49, 130, 246)`(TRD 요구값과 일치), 로그아웃 → `/login` 복귀, 잘못된 자격의 인라인 경고 "이메일 또는 비밀번호가 올바르지 않습니다.", 공백 제출의 `#email-error`·`#password-error` 동시 표시, `bad-email` 형식 오류의 이메일 전용 메시지, 360px·1280px 두 뷰포트 모두 `scrollWidth === innerWidth`를 실제 클릭·평가로 확인했다.
- 2026-07-21 사이클 1 verify 페이즈(정밀화 TRD 12개 인수 조건 독립 재확인): `cd fe && npm ci`가 종료 코드 0, `npm audit --omit=dev`도 종료 코드 0으로 취약점 0건이었다. `npm run build`가 종료 코드 0으로 Next.js 컴파일과 TypeScript strict 검사를 통과했다(라우트 `/`·`/login`·`/api/{login,logout,me}` 모두 생성).
- 2026-07-21 사이클 1 verify: `:3000`이 다른 워크트리의 dev 서버로 이미 점유돼 있어 `curl http://127.0.0.1:3000/api/me`(무쿠키)로 계약 형태의 401 JSON을 먼저 확인한 뒤, 그 서버를 종료하지 않고 `VERIFY_BASE_URL=http://127.0.0.1:3000 npm run verify:stub`을 실행했다 — 종료 코드 0으로 공백 400(email·password `errors[]`), 잘못된 자격 401, 시드 계정 200 `{name:"토스사용자"}`+`Set-Cookie: toss_session=…; HttpOnly`, `/api/me` 인증 200/무쿠키 401, 로그아웃 204+`Max-Age=0`, **로그아웃 뒤 동일 쿠키 재전송 `/api/me` 401**(세션 무효화 독립 조건)을 모두 통과했다. `scripts/verify-stub.mjs` 본문을 직접 읽어 모든 오류 응답이 `{timestamp,status,message,errors[]}` 형태와 ISO-8601 timestamp를 검사함을 확인했다.
- 2026-07-21 사이클 1 verify: agent-browser 새 창(1280×800, 쿠키 없음)에서 `/` 접근이 `/login`으로 리다이렉트됨을 `browser_get url`로 확인했고, `browser_evaluate`로 `#email`(type=email)·`#password`(type=password)·`.primary-button`(텍스트 "로그인", 계산 배경 `rgb(49, 130, 246)`)·`.auth-card`를 확인했다.
- 2026-07-21 사이클 1 verify: 잘못된 자격(`user@toss.local`/`wrong-password`) 제출 → URL `/login` 유지 + 인라인 경고 "이메일 또는 비밀번호가 올바르지 않습니다."를 확인했다. 공백 제출 → `#email-error`="이메일을 입력해 주세요.", `#password-error`="비밀번호를 입력해 주세요." 동시 표시를 확인했다. `bad-email`/`toss1234!` 제출 → 이메일 필드에만 "올바른 이메일 형식이 아닙니다." 표시, 비밀번호 필드는 비어 있음을 확인했다.
- 2026-07-21 사이클 1 verify: 시드 계정(`user@toss.local`/`toss1234!`) 제출 → URL이 `/`로 바뀌고 본문에 "토스사용자님, 반가워요"와 `user@toss.local`이 표시됨을 확인했다. `browser_back` 시 `/login`이 아닌 `about:blank`(진입 이전 상태)로 이동해 `router.replace`가 히스토리에 `/login`을 남기지 않았음을 간접 확인했다.
- 2026-07-21 사이클 1 verify: 홈에서 "로그아웃" 버튼을 실제 클릭 → URL이 `/login`으로 복귀함을 확인했다(`POST /api/logout` 204는 위 `verify:stub`으로 별도 확인).
- 2026-07-21 사이클 1 verify: 1280px 창에서 `scrollWidth===innerWidth===1280`, 새 360×800 창(쿠키 없음)에서 `scrollWidth===innerWidth===360`을 확인했다. 같은 360px 무쿠키 창에서 `/` 접근이 `/login`으로 리다이렉트됨을 재확인해 미로그인 홈 차단 조건도 함께 검증했다.
- 2026-07-21 사이클 1 verify: `grep`으로 `fe/app`·`fe/lib`의 모든 `fetch(` 호출(3건: `/api/me`, `/api/logout`, `/api/login`)이 상대 경로임을 확인했다. `http://|https://|@import|url\(` 검색 결과는 `next.config.js`의 rewrite 대상 `:8080`과 `scripts/verify-stub.mjs`의 `127.0.0.1:3000` 2건뿐으로 외부 CDN·폰트·원격 이미지 링크가 없었다.
- 2026-07-21 사이클 1 verify: `node -e`로 `next.config.js`의 `rewrites()`를 직접 호출해 `NEXT_PUBLIC_API_MODE=real`일 때 `[{"source":"/api/:path*","destination":"http://localhost:8080/api/:path*"}]`, 미설정 시 `[]`가 반환됨을 확인했다.
- 2026-07-21 사이클 1 verify: `git diff --name-only`와 `git status --porcelain`이 모두 빈 출력(작업 트리 clean, `be/` 폴더는 이 워크트리에 존재하지 않음)임을 확인했다.
- 2026-07-21 사이클 1 verify: DESIGN.md 2절을 재확인해 `#3182f6`(프라이머리)·`#191f28`(본문)·`#4e5968`(보조)·카드 최대 너비 420px·모서리 24px·데스크톱 여백 32px 기록과, 구현의 `.primary-button` 계산 배경 `rgb(49, 130, 246)`(= `#3182f6`)이 정확히 일치함을 확인했다.
- cycle green: 정밀화된 TRD 12개 인수 조건을 `npm ci`·`npm audit`·`npm run build`(모두 종료 코드 0), 기존 :3000 스텁 서버 대상 `VERIFY_BASE_URL` 지정 `npm run verify:stub`(종료 코드 0, 재전송 401 포함), agent-browser 실제 클릭·입력 기반 전체 사용자 여정(미로그인 차단·폼 렌더·401/400 인라인 오류·성공 리다이렉트·로그아웃·360~1280px 무스크롤), 소스 검색(상대 경로 fetch·외부 자산 없음), `next.config.js` rewrite 분기, `git diff` 무변경까지 모두 독립적으로 재확인해 통과했다. `be/`는 건드리지 않았다.
- 2026-07-21 사이클 1 evaluate: TRD.md의 인수 조건 13개가 모두 `- [x]`이고 마지막 VERIFY가 cycle green임을 확인했다. VERIFY의 각 체크 근거(위 88~99행)를 재검토한 결과 실행 명령·기대/실제 결과가 구체적으로 남아 있어 근거 부실로 되돌릴 항목은 없었다. `## Open`이 비어 있고 신규 위험·미검증 항목도 발견되지 않았으므로 루프를 종료하고 루트에 빈 `DONE` 파일을 생성한다.

- 2026-07-21 사이클 1 최종 검증: DESIGN.md 2절의 toss.im 관찰 근거에서 `#3182f6`·`#191f28`·`#4e5968`, 카드 최대 420px·모서리 24px·여백 32px를 확인했고, agent-browser 계산값의 버튼 배경이 `rgb(49, 130, 246)`이었다.
- 2026-07-21 사이클 1 최종 검증: 새 `npm run dev:fresh` 서버에서 `npm run verify:stub`이 400·401·200·204, 정확한 오류 키·UTC `Z` timestamp, 로그인·로그아웃 쿠키 속성을 모두 통과했다.
- 2026-07-21 사이클 1 최종 검증: `npm run verify:stub`이 로그아웃 뒤 동일 세션 쿠키를 재전송한 `GET /api/me`의 401을 확인했다.
- 2026-07-21 사이클 1 최종 검증: 고유 agent-browser 세션에서 `#email`·`#password`·로그인 버튼·420px 카드를 확인했고 버튼 계산 배경은 `rgb(49, 130, 246)`이었다.
- 2026-07-21 사이클 1 최종 검증: 잘못된 자격은 `/login`과 지정 경고를 유지했고, 시드 로그인은 `/`에서 사용자 이름을 표시했으며 뒤로가기는 `/login` 대신 `about:blank`로 이동했다.
- 2026-07-21 사이클 1 최종 검증: 공백 제출은 `#email-error`·`#password-error`를 모두 표시했고 `bad-email` 제출은 이메일 필드에만 지정 형식 오류를 표시했다.
- 2026-07-21 사이클 1 최종 검증: 홈에서 `토스사용자`와 `user@toss.local`을 확인했고 로그아웃 요청 204 뒤 `/login` 복귀를 확인했다.
- 2026-07-21 사이클 1 최종 검증: 쿠키 없는 고유 agent-browser 세션의 `/` 접근에서 `GET /api/me` 401과 `/login` 대체를 확인했으며 UI에 쿠키 직접 해석 코드가 없었다.
- 2026-07-21 사이클 1 최종 검증: agent-browser에서 1280px와 360px 모두 `scrollWidth === innerWidth`였고, 소스 검색에서 외부 CDN·폰트·원격 이미지 참조가 없었다.
- 2026-07-21 사이클 1 최종 검증: `rewrites()` 직접 호출 결과 기본 모드는 `[]`, real 모드는 `/api/:path*`→`:8080/api/:path*`였고 UI fetch 3건이 모두 상대 경로였다.
- 2026-07-21 사이클 1 최종 검증: 현재 체크아웃의 새 스텁 서버와 고유 agent-browser 세션에서 미로그인 차단 → 400·401 → 로그인 → 홈 → 로그아웃을 실제 이벤트로 재현했고 관련 콘솔·페이지 오류가 없었다.
- 2026-07-21 사이클 1 최종 검증: `git diff --name-only -- 'be/**'`와 `git ls-files 'be/**'`가 모두 빈 출력이라 `be/` 미수정을 확인했다.
- 2026-07-21 사이클 1 최종 검증: `npm ci`, `npm audit --omit=dev`, `npm run test:verify-stub`, `npm run build`가 모두 종료 코드 0이었고 취약점 0건과 `/`·`/login`·세 API Route 생성을 확인했다.
- cycle green: 모든 테스트 통과.
- 2026-07-21 사이클 1 evaluate: TRD 인수 조건 13개의 체크와 최신 VERIFY 근거를 항목별로 재검토했고, 루트 재실행에서도 `npm ci`·`npm audit --omit=dev`·`npm run test:verify-stub`·`npm run build`·새 서버 대상 `npm run verify:stub`이 모두 통과했다. 근거가 부실해 되돌릴 체크나 새 위험·열린 개선 항목이 없고 마지막 VERIFY가 green이므로 빈 `DONE`을 생성해 루프 종료로 판정한다.

## Verify failures

- [x] fix: `npm run dev:fresh`가 :3000 점유를 먼저 감지해 기존 개발 서버를 건드리지 않고 실패하도록 하고, `npm run verify:stub`으로 새 서버의 계약 흐름을 반복 검증할 수 있게 했다.
- [x] fix: 로그아웃 뒤에도 만료 전 `toss_session=authenticated` 쿠키를 수동 재전송하면 `GET /api/me`가 200을 반환한다. 서버 측 세션 무효화 또는 재전송된 만료 세션 거부가 필요하다. (`fe/lib/stub-auth.ts`, :3000 새 서버의 curl 검증)

## 교차검증 정합성

_사이클 1 · crossverify-consistency 페이즈. 이전 세대(반대 프로바이더) 산출물이 TRD 인수 조건을 실제로 충족하는지 코드 변경 없이 독립 재검증했다. `npm ci`·`npm run build`(종료 코드 0), 기존 :3000 스텁 서버에서 `npm run verify:stub`(종료 코드 0), agent-browser 실동작, 소스 검토를 근거로 판단했다._

- [x] pass: agent-browser로 toss.im 스타일 재현 포인트를 DESIGN.md에 기록 — DESIGN.md 2절에 1280×720·360×800 관찰과 `#3182f6`·`#191f28`·`#4e5968`·여백·버튼 촉감의 재현 원칙이 구체적으로 적혀 있고, `/login`의 실제 프라이머리 버튼 배경이 `rgb(49,130,246)`으로 그 값과 일치한다.
- [x] pass: 계약 스텁 3개가 계약 표와 동일한 상태코드·필드명·에러 형태·시드 계정으로 동작 — `npm run verify:stub`가 공백 400(email·password `errors[]`), 잘못된 자격 401, 시드 200 `{name:"토스사용자"}`+HttpOnly 쿠키, 로그아웃 204+`Max-Age=0`, 재전송 쿠키 401, 무쿠키 401을 모두 통과했다. 오류 본문은 `{timestamp,status,message,errors[]}` 형태다.
- [x] pass: `/login`이 이메일·비밀번호 입력과 로그인 버튼을 갖춘 토스 스타일 미니멀 카드·파란 버튼 폼을 렌더 — DOM 조회로 `#email`·`#password`·`.primary-button`(텍스트 "로그인", 배경 `rgb(49,130,246)`)과 `.auth-card`를 확인했다.
- [x] pass: 성공 시 `router.replace('/')`, 401 시 인라인 에러 — 시드 계정 제출 후 URL이 `/`로 바뀌고 `토스사용자님, 반가워요`가 표시되며, 잘못된 자격 제출 시 `/login`을 유지한 채 `.form-alert`에 "이메일 또는 비밀번호가 올바르지 않습니다."가 표시됐다. `page.tsx`도 `router.replace`를 사용한다.
- [x] pass: 잘못된 이메일·공백 제출 시 400 `errors[]`를 필드별 인라인 메시지로 표시 — 공백 제출은 `#email-error`·`#password-error` 둘 다 채워지고, `bad-email` 제출은 이메일 필드에만 "올바른 이메일 형식이 아닙니다."가 표시됐다.
- [x] pass: 홈이 `토스사용자`를 표시하고 로그아웃 시 `/login`으로 복귀 — 로그인 후 이름·이메일이 렌더되고, 로그아웃 버튼 클릭 뒤 URL이 `/login`으로 바뀌며 로그인 폼이 다시 나타났다.
- [x] pass: 미로그인 `/` 접근 시 `/login`으로 리다이렉트 — 쿠키 없는 새 창에서 `/` 진입 시 `GET /api/me` 401 판정으로 `/login`으로 대체됐다.
- [x] pass: 360~1280px에서 레이아웃 미파손·외부 CDN/폰트/이미지 없음 — 360×800에서 `scrollWidth===innerWidth===360`(카드 320px), 1280에서도 `scrollWidth===innerWidth`였고, `fe` 소스 검색에서 외부 http(s)/@import/폰트/원격 이미지 참조가 없었다(유일한 `http://` 2건은 rewrite 대상 :8080과 검증 스크립트의 localhost).
- [x] pass: `NEXT_PUBLIC_API_MODE=real`이면 rewrite 전환, 코드는 상대 경로만 호출 — `next.config.js`가 `real`일 때만 `/api/:path*`→`http://localhost:8080/api/:path*`를 반환하고 기본 모드는 `[]`를 반환하며, UI의 모든 `fetch`가 `/api/...` 상대 경로다.
- [x] pass: agent-browser로 :3000 스텁 서버에서 로그인→홈 리다이렉트→로그아웃 실동작 확인 — 위 브라우저 여정으로 실제 이벤트를 디스패치해 전 구간을 재현했다.
- [x] pass: `be/` 폴더 미수정 — 워크트리에 `be/`가 존재하지 않고(추적 파일 0건), `git diff --name-only`에 `be/` 경로가 없다.
- [x] pass: `npm run build` 종료 코드 0(TypeScript strict) — `npm ci`(0 vulnerabilities)와 `npm run build`가 모두 종료 코드 0으로 Next.js 컴파일과 타입 검사를 통과했다.
- [x] pass: 이전 verify 실패 2건(dev:fresh 포트 가드·로그아웃 세션 무효화) 해소 확인 — `npm run dev:fresh`가 점유된 :3000을 감지해 기존 서버를 건드리지 않고 안내와 함께 실패했고, `verify:stub`의 로그아웃 후 재전송 쿠키 401 검사가 통과해 서버 측 세션 무효화가 동작함을 확인했다.

## TRD 재생성

_사이클 1 · trd-regen 페이즈. 교차검증 정합성이 전 항목 pass(`consistency-ok=true`)였으므로 조건의 취지는 유지하되, 다음 세대가 처음부터 더 엄격하게 검증하도록 인수 조건 문구를 정밀화하고 모든 체크박스를 `- [ ]`로 초기화했다._

- 각 인수 조건에 **구체적 검증 방법**(명령·기대 상태코드·경계 입력·기대 DOM/URL)을 명시해 "동작한다"류 모호한 표현을 제거했다. 예: 스텁 조건에 `npm run verify:stub`의 400/401/200/204 기대와 `Set-Cookie` 속성을, 리다이렉트 조건에 `router.replace`와 기대 URL 경로를, 반응형 조건에 `scrollWidth === innerWidth` 판정을 못 박았다.
- 직전에 fix된 verify 실패였던 **로그아웃 세션 무효화**를 별도 인수 조건으로 승격했다(로그아웃 뒤 동일 쿠키 재전송 시 `GET /api/me`가 401). 회귀를 조기에 잡기 위함이다.
- DESIGN.md 관찰 기록 조건에 프라이머리 `#3182f6`·본문 `#191f28`·보조 `#4e5968` 등 구체 색값과 구현 버튼 계산값(`rgb(49,130,246)`) 일치를 요구하도록 강화했다. `참고`·`용어`에 세션 쿠키 속성과 오류 본문 형태를 명시해 단일 소스를 보강했다.
- 정합성 결과상 누락 조건이 없어 무의미한 항목 추가는 하지 않았다(세션 무효화 1건만 신설, 나머지는 정밀화).

## 교차검증 정합성

_사이클 1 · crossverify-consistency 페이즈. 현재 체크아웃에서 새 `:3000` 스텁 서버를 직접 기동하고, 기존 체크 표시와 과거 검증 기록을 신뢰하지 않은 채 TRD 인수 조건 13개를 빌드·계약 검사·agent-browser 실제 조작·소스 검토로 독립 재검증했다._

- [x] pass: toss.im 관찰 결과와 구체적인 스타일 재현값 기록 — DESIGN.md 2절에 agent-browser 관찰 시점·뷰포트와 프라이머리 `#3182f6`, 본문 `#191f28`, 보조 `#4e5968`, 카드 최대 너비 420px·모서리 24px·안쪽 여백 32px가 기록돼 있다. 이번 agent-browser 계산 스타일에서도 `.primary-button` 배경이 `rgb(49, 130, 246)`, 카드 너비가 420px로 확인됐다.
- [x] pass: 계약 스텁 3개의 상태코드·응답 필드·오류 형태·시드 계정 일치 — 새 서버 대상 `VERIFY_BASE_URL=http://127.0.0.1:3000 npm run verify:stub`이 공백 입력 400과 email·password 오류, 자격 불일치 401, 시드 로그인 200과 `{name:"토스사용자"}`·HttpOnly 쿠키, 인증 `/api/me` 200, 무쿠키 401, 로그아웃 204와 `Max-Age=0`을 모두 검사하고 종료 코드 0이었다. 검사 스크립트와 Route Handler를 함께 읽어 모든 오류가 `{timestamp,status,message,errors[]}`이며 timestamp가 ISO-8601로 검증됨을 확인했다.
- [x] pass: 로그아웃 뒤 동일 세션 쿠키 재사용 거부 — `npm run verify:stub`이 로그인 때 받은 쿠키로 로그아웃한 뒤 같은 쿠키를 다시 전송한 `GET /api/me`의 401을 확인했고, `stub-auth.ts`는 활성 세션 Set에서 로그아웃 세션 식별자를 제거한다.
- [x] pass: `/login` 미니멀 카드 폼 렌더링 — agent-browser DOM·계산 스타일 조회에서 `#email`의 type=email, `#password`의 type=password, 텍스트가 "로그인"인 버튼, `.auth-card`, 버튼 배경 `rgb(49, 130, 246)`을 확인했다.
- [x] pass: 로그인 성공 시 홈으로 replace하고 401은 인라인 경고 표시 — 코드에서 성공 분기가 `router.replace('/')`를 사용하며, agent-browser로 잘못된 자격 제출 시 `/login` 유지와 "이메일 또는 비밀번호가 올바르지 않습니다." 경고를, 시드 계정 제출 시 `/` 이동과 `토스사용자님, 반가워요` 표시를 확인했다.
- [x] pass: 400 필드 오류를 입력별 인라인 메시지로 표시 — agent-browser 실제 제출에서 공백 입력은 `#email-error`에 "이메일을 입력해 주세요.", `#password-error`에 "비밀번호를 입력해 주세요."를 동시에 표시했고, `bad-email`과 유효 비밀번호 제출은 이메일에만 "올바른 이메일 형식이 아닙니다."를 표시했다.
- [x] pass: 홈 사용자 정보와 로그아웃 흐름 — 시드 로그인 뒤 홈에 `토스사용자님, 반가워요`와 `user@toss.local`이 나타났고, 로그아웃 버튼 실제 클릭 요청이 204였으며 URL이 `/login`으로 바뀌었다.
- [x] pass: 미로그인 홈 접근 차단은 `/api/me` 401에 근거 — 쿠키 없는 고유 agent-browser 세션에서 `/` 직접 접근 시 네트워크 기록에 `GET /api/me` 401이 남고 URL이 `/login`으로 대체됐다. 홈 코드는 쿠키를 읽지 않고 `/api/me` 응답 상태만 분기한다.
- [x] pass: 360px~1280px 반응형과 외부 자산 부재 — agent-browser에서 1280px와 360px 모두 `document.documentElement.scrollWidth === window.innerWidth`였고, 360px 카드 너비 320px·안쪽 여백 24px를 확인했다. `fe/app`, `fe/lib`, 설정·검증 스크립트 검색에서 외부 CDN·폰트·원격 이미지가 없었으며 URL은 허용된 :8080 rewrite와 localhost 검증 주소뿐이었다.
- [x] pass: real 모드 rewrite와 UI 상대 API 경로 — `next.config.js`의 `rewrites()`를 직접 호출해 기본 모드 `[]`, real 모드 `[{"source":"/api/:path*","destination":"http://localhost:8080/api/:path*"}]`를 확인했다. UI의 `fetch` 3건은 각각 `/api/login`, `/api/me`, `/api/logout` 상대 경로다.
- [x] pass: agent-browser 전체 실동작 — 이번 체크아웃의 새 `npm run dev:fresh` 서버에서 미로그인 홈 차단 → 401·400 오류 표시 → 시드 로그인 → 홈 리다이렉트와 사용자 표시 → 로그아웃 → 로그인 화면 복귀를 실제 입력·클릭으로 재현했고, 관련 브라우저 페이지 오류는 없었다.
- [x] pass: `be/` 미수정 — 이 프론트 워크트리에 추적된 `be/` 파일이 없고 `git diff --name-only -- 'be/**'`도 빈 출력이었다.
- [x] pass: 의존성 설치·취약점 검사·strict 빌드 — `npm ci`와 `npm audit --omit=dev`가 취약점 0건으로 종료 코드 0이었고, `npm run build`가 Next.js 컴파일·TypeScript strict 검사와 `/`, `/login`, 세 API Route 생성을 완료하며 종료 코드 0이었다.

## TRD 재생성

_사이클 1 · trd-regen 페이즈. 최신 교차검증 정합성이 13개 전 항목 pass이고 `consistency-ok=true`이므로 기존 조건의 취지와 개수는 유지하면서, 다음 세대가 더 엄격하고 재현 가능한 증거로 처음부터 판정하도록 모든 체크박스를 `- [ ]`로 초기화했다._

- 계약 조건은 성공·로그아웃 쿠키의 `Path=/`·`HttpOnly`·`SameSite=Lax`·`Max-Age=0`, 오류 JSON의 정확한 최상위 키·필드 오류 키·UTC `Z` timestamp까지 검사하도록 구체화했다.
- 로그인 성공 조건은 뒤로가기로 `/login`에 복귀하지 않는 히스토리 검사를 명시하고, 전체 브라우저 조건은 현재 체크아웃의 새 서버·고유 세션·400/401 경계 입력·오류 오버레이 및 콘솔/페이지 오류 부재를 요구하도록 강화했다.
- 완료 조건은 `npm audit --omit=dev` 취약점 0건과 빌드가 생성해야 할 화면·API Route까지 명시했다. 정합성에서 새 결함이나 판단 보류가 나오지 않아 별도 인수 조건은 추가하지 않았다.

## 교차검증 정합성

_사이클 1 · crossverify-consistency 페이즈. 이전 세대 산출물을 체크박스에 의존하지 않고 빌드·계약 검증·agent-browser 실동작으로 독립 재검토했다. `.snploop/xverify-bootstrapped`가 없어 최초 정합성 판정을 수행했다._

- [x] pass: DESIGN.md 재현 포인트 기록 + 버튼 색 — DESIGN.md에 `#3182f6`·`#191f28`·`#4e5968`·카드 너비 `420px`·모서리 `24px`가 구체적 값으로 기록돼 있고, agent-browser에서 `.primary-button`의 계산 배경색이 `rgb(49, 130, 246)`으로 이 기록과 일치했다.
- [x] pass: 계약 스텁 3개 글자 단위 일치 — `npm run dev:fresh`(스텁 :3000)에서 `npm run verify:stub`이 종료 코드 0으로, 공백 400(email·password 둘 다)·오자격 401·시드 200 `{name:"토스사용자"}`·`Set-Cookie: toss_session=…; Path=/; HttpOnly; SameSite=Lax`·`/api/me` 유효 200/무쿠키 401·로그아웃 204(빈 값·`Max-Age=0`)와 오류 본문 4키·`field`/`message`·UTC `Z` timestamp를 모두 통과했다.
- [x] pass: 로그아웃 뒤 동일 쿠키 재전송 401 — `verify-stub.mjs`의 재전송 검사(같은 `cookie`로 `/api/me` 재요청 → 401)가 통과했고, `stub-auth.ts`의 `invalidateSession`이 세션 레지스트리에서 세션 ID를 실제 삭제한다.
- [x] pass: `/login` 폼 렌더 — agent-browser로 `#email`(`type=email`)·`#password`(`type=password`)와 "로그인" 버튼이 카드 폼에 있고 버튼 배경이 `rgb(49, 130, 246)`임을 확인했다.
- [x] pass: 로그인 성공 `router.replace('/')`와 히스토리 — 시드 제출 후 경로가 `/`, 홈에 `토스사용자`가 표시됐고, `history.back()` 시 직전 `/login`이 아니라 초기 blank로 이동해 로그인 페이지가 히스토리에 남지 않음을 확인했다. 오자격 401 제출 시 경로는 `/login`을 유지하며 인라인 경고 "이메일 또는 비밀번호가 올바르지 않습니다."가 표시됐다.
- [x] pass: 400 필드별 인라인 메시지 — 공백 제출 시 `#email-error`·`#password-error`가 둘 다 채워졌고, `bad-email` 제출 시 이메일 필드에만 "올바른 이메일 형식이 아닙니다."가 표시되고 비밀번호 오류는 비었다.
- [x] pass: 홈 사용자 표시와 로그아웃 흐름 — 홈에 `토스사용자님, 반가워요`와 `user@toss.local`이 나타났고, 로그아웃 버튼 클릭 후 경로가 `/login`으로 바뀌었다.
- [x] pass: 미로그인 홈 접근 차단 — 로그아웃 뒤 `/`로 재접근하자 `/login`으로 리다이렉트됐다. 홈 코드(`app/page.tsx`)는 쿠키를 직접 읽지 않고 `GET /api/me`의 401 응답 상태만으로 분기한다.
- [x] pass: 360px~1280px 가로 스크롤 부재 + 외부 자산 없음 — 360px·1280px 두 뷰포트 모두 `document.documentElement.scrollWidth === window.innerWidth`였고, `fe/app`·`fe/lib`·설정/스크립트 검색에서 허용된 `:8080` rewrite·localhost 검증 주소 외 외부 CDN·폰트·원격 이미지·`@import`가 없었다.
- [x] pass: real 모드 rewrite + 상대 API 경로 — `next.config.js`의 `rewrites()`를 직접 호출해 기본 모드 `[]`, `NEXT_PUBLIC_API_MODE=real` 모드 `[{"source":"/api/:path*","destination":"http://localhost:8080/api/:path*"}]`을 확인했고, UI의 `fetch`는 `/api/login`·`/api/me`·`/api/logout` 상대 경로만 사용한다.
- [x] pass: agent-browser 전체 실동작 — 이번 체크아웃의 새 `dev:fresh` 서버에서 미로그인 홈 차단 → 400·401 오류 표시 → 시드 로그인 → 홈 리다이렉트·사용자 표시 → 로그아웃 → 로그인 복귀를 실제 입력·클릭으로 재현했다. 업케치 JS 예외(page error)는 0건, Next.js 오류 오버레이도 없었다. 콘솔의 400/401 "Failed to load resource"는 경계 입력을 검증하는 과정에서 스텁이 의도적으로 반환한 상태코드로, 애플리케이션 결함이 아니다. `dev-fresh.mjs`는 :3000 점유 시 포트를 선점 검사해 안전하게 종료 코드 1로 실패한다.
- [x] pass: `be/` 미수정 — 이 프론트 워크트리에 `be/` 디렉터리 자체가 없고 `git diff --name-only`에 `be/` 경로가 없다.
- [x] pass: 설치·감사·strict 빌드 — `npm ci`(0 vuln)·`npm audit --omit=dev`(0 vuln)·`npm run build`가 모두 종료 코드 0이었고, 빌드가 TypeScript strict 검사와 `/`·`/login`·`/api/login`·`/api/me`·`/api/logout` 5개 라우트 생성을 완료했다.
