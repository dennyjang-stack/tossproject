# Improvements & findings

_Appended by VERIFY and EVALUATE. Checked off ("- [x]") by IMPLEMENT._
_Open items use "- [ ]". Empty Open list + green verify is the signal to create DONE._

## Open

## Verify

- 2026-07-21 사이클 1(재생성 TRD) verify 재실행: `cd fe && npm ci`(종료 0, 0 vulnerabilities), `npm audit --omit=dev`(종료 0, 0 vulnerabilities), `npm run build`(종료 0, TypeScript strict 통과, `/`·`/login`·`/api/login`·`/api/logout`·`/api/me` 5개 라우트 생성)를 모두 재확인했다.
- 2026-07-21 verify: 포트 :3000이 비어 있음을 확인한 뒤 `npm run dev:fresh`로 `.next-dev` 산출물의 새 스텁 서버를 정상 기동했고(안전 실패 경로는 이번엔 해당 없음), `npm run verify:stub`이 종료 코드 0으로 통과했다 — `scripts/verify-stub.mjs`가 공백 400(email·password `errors[]`), 오자격 401, 시드 200 `{name:"토스사용자"}`+`Set-Cookie: toss_session=…; Path=/; HttpOnly; SameSite=Lax`, `/api/me` 인증 200/무쿠키 401, 로그아웃 204(빈 값·`Path=/`·`HttpOnly`·`SameSite=Lax`·`Max-Age=0`), **로그아웃 뒤 동일 쿠키 재전송 `/api/me` 401**, 모든 오류 본문의 정확한 키(`timestamp`,`status`,`message`,`errors`)·UTC `Z` timestamp·필드 오류 키(`field`,`message`)를 단언해 통과했다.
- 2026-07-21 verify: agent-browser 새 격리 창(1280×800, 고유 세션)에서 쿠키 없이 `/` 접근 → `/login` 리다이렉트를 `browser_get url`로 확인했고, `browser_evaluate`로 `#email`(type=email)·`#password`(type=password)·`.primary-button`(텍스트 "로그인", 계산 배경 `rgb(49, 130, 246)`)·`.auth-card`를 확인했다(1번·4번).
- 2026-07-21 verify: 같은 세션에서 공백 제출 → `#email-error`="이메일을 입력해 주세요.", `#password-error`="비밀번호를 입력해 주세요." 동시 표시를 확인했다. `bad-email`/`toss1234!` 제출 → 이메일 필드에만 "올바른 이메일 형식이 아닙니다." 표시, `#password-error`는 공백 문자 하나(trim 시 길이 0)로 실질적으로 비어 있음을 `textContent`/`trim().length` 조회로 확인했다(6번).
- 2026-07-21 verify: 오자격(`user@toss.local`/`wrong-password`) 제출 → URL `/login` 유지 + `[role="alert"]`에 "이메일 또는 비밀번호가 올바르지 않습니다." 표시를 확인했다. 시드 계정(`user@toss.local`/`toss1234!`) 제출 → URL이 `/`로 바뀌고 본문에 "토스사용자님, 반가워요"와 `user@toss.local`이 표시됨을 확인했다(5번·7번).
- 2026-07-21 verify: 로그인 성공 직후 `browser_back` 시 URL이 `/login`이 아닌 `about:blank`(진입 이전 상태)로 이동해 `router.replace`가 히스토리에 로그인 페이지를 남기지 않음을 확인했다(5번).
- 2026-07-21 verify: 홈에서 "로그아웃" 버튼을 실제 클릭 → URL이 `/login`으로 복귀함을 확인했고, 같은 세션에서 `/`로 재접근 시 다시 `/login`으로 차단됨을 확인해 세션 무효화가 홈 재접근 차단에도 반영됨을 확인했다(7번·8번).
- 2026-07-21 verify: 1280px 창에서 `scrollWidth===innerWidth===1280`, 별도 격리된 새 360×800 창(쿠키 없음)에서 `scrollWidth===innerWidth===360`을 확인했다. 같은 360px 무쿠키 창에서 `/` 접근이 `/login`으로 리다이렉트됨을 재확인해 미로그인 홈 차단(8번)도 독립적으로 재검증했다(9번).
- 2026-07-21 verify: `browser_errors`(action=view)가 전 여정에 걸쳐 0건이었다. `browser_console`(types=error)에는 경계 400·401 제출이 남긴 "Failed to load resource" 메시지만 있었고(과제 지시대로 실패로 보지 않음), "X-Toss-Event-Id" 관련 메시지는 탭 목록(`browser_tab list`) 확인 결과 별도로 열려 있던 실제 `https://toss.im` 탭(이전 DESIGN 단계 잔여물)에서 발생한 것으로 `fe/` 앱과 무관함을 확인했다. `nextjs-portal`의 shadow DOM을 조회해 실제 렌더된 오류 다이얼로그(`[role="dialog"]`)는 0개, 개발자 도구 배지 텍스트도 빈 문자열이라 Next.js 오류 오버레이가 활성화되지 않았음을 확인했다(11번).
- 2026-07-21 verify: `node -e`로 `next.config.js`의 `rewrites()`를 직접 호출해 기본 모드 `[]`, `NEXT_PUBLIC_API_MODE=real` 모드 `[{"source":"/api/:path*","destination":"http://localhost:8080/api/:path*"}]`를 확인했다. `grep`으로 `fe/app`·`fe/lib`의 `fetch(` 호출 3건(`/api/me`,`/api/logout`,`/api/login`)이 모두 상대 경로임을 확인했다(10번).
- 2026-07-21 verify: `fe/` 소스(`app`,`lib`,`next.config.js`,`scripts`) 전체에서 `http(s)://`·`@import`·`url(...)` 검색 결과가 `next.config.js`의 rewrite 대상 `:8080`과 `scripts/verify-stub.mjs`·`scripts/test-verify-stub.mjs`의 localhost 검증 주소 3건뿐이라 외부 CDN·폰트·원격 이미지가 없음을 확인했다(9번).
- 2026-07-21 verify: DESIGN.md 2절을 재확인해 `#3182f6`(프라이머리)·`#191f28`(본문)·`#4e5968`(보조)·카드 최대 너비 420px·모서리 24px·데스크톱 여백 32px 기록을 확인했고, 실제 `.primary-button` 계산 배경 `rgb(49, 130, 246)`(= `#3182f6`)이 이 기록과 일치함을 확인했다(1번).
- 2026-07-21 verify: `git diff --name-only`와 `git status --short`에 `be/` 경로가 없었다(이 프론트 워크트리에는 `be/` 디렉터리 자체가 존재하지 않는다)(12번).
- 2026-07-21 verify: 검증에 사용한 `npm run dev:fresh` 프로세스를 SIGTERM으로 완전히 종료(잔여 `next dev` 프로세스 없음 확인)한 뒤, `dev:fresh`가 생성한 `fe/next-env.d.ts`(`.next-dev` 참조로 변경됨) 변경을 `git checkout`으로 원복하고 `fe/.next-dev` 디렉터리를 삭제해 `git status --short`가 다시 빈 출력임을 확인했다.
- cycle green: 재생성된 TRD 13개 인수 조건을 `npm ci`·`npm audit --omit=dev`·`npm run build`(모두 종료 0), 새로 기동한 `npm run dev:fresh` 스텁 서버 대상 `npm run verify:stub`(종료 0, 재전송 401·정확한 키·UTC `Z`·쿠키 속성 포함), agent-browser 고유 격리 세션의 실제 클릭·입력 기반 전체 사용자 여정(미로그인 차단·400 필드 오류 2종·401 인라인·성공 리다이렉트와 히스토리 검사·홈 표시·로그아웃·재접근 차단·360~1280px 무스크롤·`browser_errors` 0건·오류 오버레이 부재), rewrite 조건부 분기, 소스 내 외부 자산 부재, `be/` 미수정까지 모두 독립적으로 재확인해 통과했다.

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

## TRD 재생성

_사이클 1 · trd-regen 페이즈. 직전 교차검증 정합성이 13개 인수 조건 전부 `pass`이고 `consistency-ok=true`였다. 조건들은 이미 명령·기대 출력·경계 입력을 명시한 정밀한 형태였으므로 취지·개수를 유지하면서, 다음 세대가 처음부터 재검증하도록 모든 체크박스를 `- [ ]`로 초기화했다._

- 억지로 항목을 늘리지 않았다. 정합성에서 새 결함·판단 보류가 없었으므로 인수 조건 개수는 13개로 유지했다.
- 교차검증에서 유일하게 문구가 모호했던 전체 브라우저 조건(11번)을 정밀화했다: 판정 기준을 `browser_errors`(업케치 JS 예외·페이지 오류) 0건 + Next.js 오류 오버레이 부재로 명시하고, 경계 입력(400·401)을 검증하는 과정에서 스텁이 의도적으로 반환한 4xx에 대한 브라우저 "Failed to load resource" 네트워크 로그는 정상 동작이라 실패로 보지 않음을 명확히 했다.
- 400 필드 오류 조건(6번)에 형식 오류 이메일 제출 시 `#password-error`가 비어 있어야 한다는 경계 기대를 덧붙여 필드별 인라인 판정을 더 엄격하게 만들었다.
- `dev:fresh`의 안전 실패를 "종료 코드 1"로 구체화했다. 그 외 조건은 취지를 바꾸지 않고 그대로 유지했다.

## 평가

_사이클 1 · evaluate 페이즈. TRD.md의 인수 조건 13개를 하나씩 검토하고, verify가 남긴 `- [x]` 체크의 근거를 재검토했다._

- 13개 인수 조건이 모두 `- [x]`이고, 각 체크는 명령 종료 코드(`npm ci`/`audit`/`build`/`verify:stub` 모두 0)와 agent-browser 고유 세션의 실제 URL·DOM·상태코드 관측이라는 구체적 근거로 뒷받침된다. 근거가 부실하거나 실제로 미충족인 항목은 없어 되돌린(`- [x]`→`- [ ]`) 항목이 없다.
- 6번의 `#password-error`는 레이아웃 높이 유지를 위한 공백 문자 하나(`{password.error || ' '}`)를 렌더하지만 `trim().length===0`이고 `data-empty` 속성이 `true`라 실질적으로 비어 있음이 확인됐다. 인수 조건의 취지("비어 있다")를 충족하므로 결함으로 보지 않는다.
- 마지막 verify가 green이고 모든 인수 조건이 충족되어 남은 작업(`- [ ]`)이 없다. 루프 종료 신호로 저장소 루트에 빈 `DONE` 파일을 생성했다. 다음 세대에 넘길 추가 개선 항목은 없다.
- [x] VERIFY 재실행: TRD.md 인수 조건 9개(라인 23~31)가 모두 `- [ ]`로 남아 있다. 이번 사이클 VERIFY가 `## Verify`에 9개 전부에 대한 green 근거(빌드 종료 코드 0, 테스트 17개 `failures="0" errors="0"`, 항목별 코드·설정·실 서버 대조)를 기록했으나 **TRD.md의 체크박스를 토글하지 않았다**(verify 페이즈 3단계 누락). 체크는 VERIFY만 할 수 있고 EVALUATE는 되돌리기만 가능하므로, 다음 VERIFY 패스에서 코드 변경 없이 아래 근거대로 9개 박스를 `- [x]`로 표시하면 된다. 새 구현 작업은 필요 없다(현재 빌드·테스트 이미 green).
  - 근거 위치: `## Verify` > "2026-07-21 재생성 TRD(trd-regen) 이후 새 사이클 독립 verify" 블록의 인수 조건 1~9 항목.
  - 특히 인수 조건 7(정규식 글자 단위 동일성)은 TRD 문구와 테스트 상수 `ISO_8601_UTC_REGEX`를 문자 단위 비교해 `True`로 확인됨.
  - **해결됨 (사이클 2 verify)**: 아래 "사이클 2 · 체크박스 토글 verify" 블록에서 TRD.md 인수 조건 9개를 `- [x]`로 토글 완료했다.

## Implement

- 사이클 2 · implement: DESIGN.md §10 점검·고정 항목을 하나씩 대조 검증했다. 사이클 1에서 재생성 TRD 인수 조건 9개를 이미 구현·검증했으므로 새 구조·새 코드는 만들지 않는 범위(§0)이며, 실제로 **코드 변경 없음**(어긋난 항목이 없어 최소 수정 대상이 없었다).
  - 정규식 글자 단위 동일성(핵심): `AuthControllerTest`의 `ISO_8601_UTC_REGEX` 상수를 Java 이스케이프 해제한 런타임 값과 `TRD.md` 인수 조건 7의 정규식 `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$`를 문자 단위 비교 → `True`(완전 동일, 초 그룹 포함, 우회 없음). 샘플 `2026-07-21T10:08:34.933Z`가 양쪽 정규식에 매칭됨도 확인.
  - HttpOnly 명시 설정: `application.yml`에 `server.servlet.session.cookie.http-only: true` 실존, 전용 테스트 `세션쿠키_HttpOnly_명시설정`이 `Environment` 프로퍼티 `"true"`를 단언.
  - 경계·응답 형태: me 401 두 경계(a 세션없음 / b 세션有·속성無) 별도 테스트, 동시 입력오류 두 필드, 로그아웃 세션 유무 두 경우, 로그인 200 `aMapWithSize(1)`·me 200 `aMapWithSize(2)` 모두 존재.
  - 빌드 재실행: `be/`에서 `./gradlew clean build --console=plain` → `BUILD SUCCESSFUL`, 종료 코드 `0`, `AuthControllerTest` `tests="17" skipped="0" failures="0" errors="0"`.
  - 참고: `## Open`의 "VERIFY 재실행" 항목은 TRD 체크박스 토글을 요구하는 **VERIFY 작업**이므로 implement에서 체크하지 않았다(implement는 TRD 체크박스를 토글할 수 없음). 이번 사이클 verify가 처리한다.

## Verify

- 2026-07-21 최신 verify: `be/`에서 `./gradlew clean build --console=plain` 실행 → `BUILD SUCCESSFUL`, 종료 코드 `0`, `AuthControllerTest` `tests="18" skipped="0" failures="0" errors="0"` 확인.
- 인수 조건 1: `AuthControllerTest#로그인_성공`, `#로그인_성공_응답필드_하나뿐`, `#세션쿠키_HttpOnly_명시설정`과 `be/src/main/resources/application.yml`의 `server.servlet.session.cookie.http-only: true`로 로그인 200·`name` 단일 필드·HttpOnly 명시 설정을 확인했다.
- 인수 조건 2: `AuthControllerTest#로그인_비밀번호_불일치`와 `#로그인_존재하지않는_이메일`이 각각 401, 비어 있지 않은 `message`, 빈 `errors[]`를 검증한다.
- 인수 조건 3: `AuthControllerTest#로그인_이메일_형식_오류`, `#로그인_이메일_공백`, `#로그인_비밀번호_공백`, `#로그인_이메일_비밀번호_동시_형식오류`로 400 경계와 필드별 `{field, message}` 및 동시 오류 두 필드 담김을 확인했다.
- 인수 조건 4: `AuthControllerTest#me_세션있음`, `#me_세션없음`, `#me_세션있으나_로그인속성없음`으로 로그인 세션 200·세션 없음 401·세션 있으나 속성 없음 401을 확인했다.
- 인수 조건 5: `AuthControllerTest#로그아웃_성공_이후_me_401`, `#로그아웃_세션없어도_204`와 `MockHttpSession.isInvalid()`로 로그아웃 204·빈 본문·세션 무효화·후속 me 401을 확인했다.
- 인수 조건 6: `AuthControllerTest#에러형태_400`, `#에러형태_401`과 `ApiExceptionHandler`/`ErrorResponse` 구현으로 400·401 에러가 정확히 `timestamp`, `status`, `message`, `errors` 네 키만 갖고 `status`가 실제 코드와 일치함을 확인했다.
- 인수 조건 7: `AuthControllerTest#timestamp_ISO8601_UTC`의 정규식 상수 `ISO_8601_UTC_REGEX`와 `ErrorResponse.of(Instant.now().toString())`를 대조해 초를 포함한 ISO-8601 UTC 문자열 규칙이 코드·테스트에서 동일함을 확인했다.
- 인수 조건 8: `git status --porcelain`에는 `fe/` 변경이 없고, `git diff --name-only main...HEAD`에도 `fe/` 경로가 없으며 변경은 `be/`와 루프 문서로만 한정됨을 확인했다.
- 인수 조건 9: 한국어 `@DisplayName`의 `@WebMvcTest` + `MockMvc` 테스트 18개가 모두 통과했고, 새 `./gradlew clean build`가 종료 코드 0으로 끝났다.
- cycle green: 모든 테스트 통과

- 2026-07-21 fresh verify: `be/`에서 `./gradlew clean build` 재실행 → `BUILD SUCCESSFUL`, 종료 코드 `0`, `AuthControllerTest` `tests="14" failures="0" errors="0"` 확인. `git diff --name-only main...HEAD`에도 `fe/` 경로 없음.
- cycle green: 모든 테스트 통과
- 빌드: `be/`에서 `./gradlew clean build` 실행 → **BUILD SUCCESSFUL**, 종료 코드 **0** 확인 (파이프 없이 `$?` 직접 캡처로 재확인).
- 테스트: `be/build/test-results/test/TEST-com.example.toss.auth.AuthControllerTest.xml` → `tests="14" skipped="0" failures="0" errors="0"`. 인수 조건 A~G마다 성공·실패(400/401) 케이스가 쌍으로 존재하고, HttpOnly 명시 설정 테스트가 추가되었다.
- 인수 조건 1 (`POST /api/login` 시드 계정 → 200 `{name}` + HttpOnly 세션 쿠키): `AuthControllerTest#로그인_성공`으로 200/`$.name`/세션 생성 확인 + `be/`를 `--server.port=8099`로 실제 기동해 `curl -i` 로 응답 헤더에 `Set-Cookie: JSESSIONID=...; Path=/; HttpOnly` 실제 노출 직접 확인(WebMvcTest는 세션 객체만 검증하고 Set-Cookie 헤더 자체는 검증하지 않으므로 실 서버로 별도 확인). 충족.
- 인수 조건 2 (자격 불일치 → 401 공통 에러): `AuthControllerTest#로그인_비밀번호_불일치`, `#로그인_존재하지않는_이메일` + 실 서버 curl로 401·`errors:[]` 확인. 충족.
- 인수 조건 3 (형식 오류·공백 → 400, `errors[]` 필드별): `#로그인_이메일_형식_오류`, `#로그인_비밀번호_공백` + 실 서버 curl로 `errors:[{"field":"email",...},{"field":"password",...}]` 확인. 충족.
- 인수 조건 4 (`GET /api/me` 세션有 200 / 세션無 401): `#me_세션있음`, `#me_세션없음` + 실 서버에서 쿠키 재사용 흐름(login→me)으로 200 `{email,name}` 확인. 충족.
- 인수 조건 5 (`POST /api/logout` 204 + 세션 무효화, 이후 me 401): `#로그아웃_성공_이후_me_401`(`session.isInvalid()`까지 확인) + 실 서버에서 login→me→logout→me 흐름으로 204 후 401 재현 확인. 충족.
- 인수 조건 6 (에러 응답 `{timestamp,status,message,errors[]}`, `status`=실제 코드): `#에러형태_400`, `#에러형태_401` + 실 서버 curl 응답 바디에서 네 필드 전부 확인. 충족.
- 인수 조건 7 (`timestamp` ISO-8601 UTC 문자열): `#timestamp_ISO8601_UTC`(정규식 `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$` 매칭) + 실 서버 응답 예시 `2026-07-21T09:34:21.856006895Z` 로 직접 확인. `application.yml`의 `spring.jackson.time-zone: UTC`, `write-dates-as-timestamps: false` 설정과 `ErrorResponse.of`가 `Instant.now().toString()`을 사용하는 코드 조합으로 epoch 숫자가 아닌 문자열임을 코드 레벨에서도 확인. 충족.
- 인수 조건 8 (`fe/` 미수정): 이 워크트리(백엔드 루프)에는 `fe/` 폴더 자체가 없음(`ls -d fe` → 없음), `git diff --name-only`·`git status --porcelain` 모두 `fe/` 경로 없이 클린. `git diff --name-only main...HEAD`로 확인한 변경 파일 목록도 `DESIGN.md`, `IMPROVEMENTS.md`, `TRD.md`, `be/**`뿐. 충족.
- 인수 조건 9 (항목별 성공·실패 `@WebMvcTest` + `clean build` 0): 위 테스트 14개 전부 통과 + 빌드 종료 코드 0. 충족.
- 코딩 제약 점검: 생성자 주입/`final`만 사용(`AuthController`, `AuthService`에 필드 `@Autowired` 없음, `grep -rn "@Autowired" src/main` 결과 없음), Lombok 미사용(`build.gradle.kts`·`src/main` 어디에도 `lombok` 없음), DTO 6종 모두 `record`(`LoginRequest`,`LoginResponse`,`MeResponse`,`SeedUser`,`ErrorResponse`,`FieldErrorItem`), 컨트롤러(`AuthController.java`)에 `try`/`catch` 없음, `@RestControllerAdvice`는 `ApiExceptionHandler` 단 하나만 존재, 검증은 `jakarta.validation`의 `@NotBlank`/`@Email` 선언형으로 처리(수동 null 체크 없음). 모두 충족.
- 스택/구조 점검: Java 21 toolchain, Spring Boot 3.5.16, Gradle Kotlin DSL(`build.gradle.kts`/`settings.gradle.kts`, Groovy 없음), 외부 DB·Docker·JWT/OAuth 미사용, 패키지 구조가 `auth/`,`common/` feature-by-package로 DESIGN.md와 일치. 충족.

### 2026-07-21 재생성 TRD(trd-regen) 이후 새 사이클 독립 verify

_TRD.md의 인수 조건 9개가 모두 `- [ ]`로 초기화된 상태에서, implement 산출물을 별도 서브에이전트가 처음부터 다시 코드·테스트·빌드로 대조 검증했다. 소스 코드는 수정하지 않았다(순수 검증). 아래는 이번 패스의 독립 근거이며, 이전 사이클(14개 테스트 시절)의 기록 위에 새로 덧붙인다._

- 빌드(신규 실행): `be/`에서 `./gradlew clean build --console=plain` 재실행 → 로그 마지막 줄 `BUILD SUCCESSFUL in 3s`, `echo $?`로 직접 캡처한 종료 코드 `0`(파이프 미사용). 8개 태스크 전부 실행·성공.
- 테스트 수치(신규): `be/build/test-results/test/TEST-com.example.toss.auth.AuthControllerTest.xml`의 루트 속성이 `tests="17" skipped="0" failures="0" errors="0"`. 직전 사이클(14개)보다 3개 늘었으며, 신규분은 `A-형태`(응답 필드 1개 확인), `C-실패: 이메일과 비밀번호가 동시에 잘못되면...`(동시 오류 경계), `D-실패(경계b): 세션은 있으나 로그인 사용자 속성이 없으면...`(me 401의 두 번째 경계) — DESIGN.md §10에서 지시한 "점검·고정" 항목과 정확히 일치한다.
- **인수 조건 1**(로그인 200 `{name}` 단일 필드 + HttpOnly 세션 쿠키 + `application.yml` 명시 설정 + 전용 `@WebMvcTest`): `application.yml`에 `server.servlet.session.cookie.http-only: true` 실존 확인(`be/src/main/resources/application.yml`). `AuthControllerTest#세션쿠키_HttpOnly_명시설정`이 `Environment.getProperty("server.servlet.session.cookie.http-only")`가 문자열 `"true"`임을 직접 단언해 통과. `#로그인_성공_응답필드_하나뿐`이 `aMapWithSize(1)`로 여분 필드 없음을 확인. 추가로 `be/`를 `--server.port=8099`로 기동해 `curl -is`로 실제 응답 확인: `HTTP/1.1 200`, 바디 `{"name":"토스사용자"}`, 헤더 `Set-Cookie: JSESSIONID=...; Path=/; HttpOnly`. **충족**.
- **인수 조건 2**(미등록 이메일·틀린 비밀번호 → 401, `message` 비어있지 않음, `errors=[]`): `#로그인_비밀번호_불일치`, `#로그인_존재하지않는_이메일` 둘 다 `$.status=401`, `$.message`가 정확한 비어있지 않은 한국어 문자열, `$.errors`가 빈 배열임을 검증하고 통과. 실 서버 curl로도 `{"status":401,"message":"이메일 또는 비밀번호가 올바르지 않습니다.","errors":[]}` 재현. **충족**.
- **인수 조건 3**(형식 오류·공백 → 400, `errors[]` 필드별 `{field,message}`, 동시 오류 시 두 필드 모두): `#로그인_이메일_형식_오류`(`field`=email), `#로그인_비밀번호_공백`(`field`=password), `#로그인_이메일_비밀번호_동시_형식오류`가 `containsInAnyOrder("email","password")`와 모든 `message`가 비어있지 않음(`everyItem(not(emptyOrNullString()))`)을 함께 검증하고 통과. 실 서버 curl `{"email":"not-an-email","password":"  "}` → 400, `errors:[{"field":"password","message":"must not be blank"},{"field":"email","message":"must be a well-formed email address"}]` 재현(두 필드 모두 존재, 메시지 비어있지 않음). **충족**.
- **인수 조건 4**(me: 세션有 200 정확히 2필드 / (a)세션無 401 / (b)세션有·속성無 401, (a)(b) 별도 테스트): `#me_세션있음`이 `aMapWithSize(2)`로 `email`·`name` 두 키만 확인. `#me_세션없음`은 세션 쿠키 없이 401(경계 a), `#me_세션있으나_로그인속성없음`은 `new MockHttpSession()`(빈 세션)으로 401(경계 b) — **두 경계가 서로 다른 테스트 메서드로 분리**되어 있음을 소스에서 직접 확인. 실 서버 로그인→me 흐름으로 200 `{"email":"user@toss.local","name":"토스사용자"}` 재현. **충족**.
- **인수 조건 5**(logout: 세션 유무 무관 204 빈 본문, 기존 세션 무효화 후 me 401, 두 경우 별도 테스트): `#로그아웃_성공_이후_me_401`이 204 + `session.isInvalid()==true` + 후속 me 401을 확인, `#로그아웃_세션없어도_204`가 세션 없이 204를 별도로 확인 — 두 케이스가 별도 테스트로 분리됨을 소스에서 확인. 실 서버 curl 흐름(login→logout→me)에서 204(바디 없음, `Content-Length` 헤더 없음/빈 본문) 후 401 재현, 세션 없이 logout도 204 재현. **충족**.
- **인수 조건 6**(400·401 모두 `timestamp,status,message,errors` 4필드, `status`=실제 코드, `errors`는 항상 배열): `#에러형태_400`, `#에러형태_401`이 4필드 존재와 `$.status`가 400/401과 일치함을 확인. `ErrorResponse` record가 정확히 4필드이고 `ApiExceptionHandler.build`가 `status.value()`를 그대로 담는 코드를 직접 확인(`be/src/main/java/com/example/toss/common/ErrorResponse.java`, `ApiExceptionHandler.java`). **충족**.
- **인수 조건 7**(timestamp 정규식 글자 단위 동일성 — 이번 재생성의 핵심): TRD.md 문구의 정규식 `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$`와 `AuthControllerTest`의 상수 `ISO_8601_UTC_REGEX = "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?Z$"`를 파이썬으로 디코딩해 문자 단위 비교(`trd == test`)한 결과 **`True`** — 완전히 동일함을 직접 대조했다(초 그룹 `:\d{2}` 포함, 우회 없음). 이 정규식은 `#B-실패` 2건, `#timestamp_ISO8601_UTC`(G)에서 실제 매칭 검증에 쓰이며 빌드가 통과했으므로 런타임에도 실제 매칭됨이 확인됐다. 추가로 실 서버 응답 `timestamp` 3건(`2026-07-21T10:21:39.870032975Z` 등)을 파이썬 `re.match`로 동일 정규식에 직접 매칭 → 전부 `True`. `application.yml`의 `spring.jackson.time-zone: UTC`/`write-dates-as-timestamps: false`와 `ErrorResponse.of`의 `Instant.now().toString()` 조합도 코드 레벨에서 재확인. **충족(글자 단위 동일성 확인 완료)**.
- **인수 조건 8**(`fe/` 미수정, 변경 범위가 `be/`·루프 문서에 한정): 이 워크트리에는 `fe/` 폴더 자체가 존재하지 않음(`ls -d fe` → No such file or directory). `git status --porcelain` 결과 없음(클린). `git diff --name-only main...HEAD` 결과 `.superpowers/sdd/task-1-report.md`, `DESIGN.md`, `IMPROVEMENTS.md`, `TRD.md`, `be/**` 파일들뿐이며 `fe/` 경로는 하나도 없음을 직접 확인. **충족**.
- **인수 조건 9**(항목별 성공·실패 `@WebMvcTest` + 한국어 `@DisplayName` + `clean build` 0): `AuthControllerTest` 17개 테스트 전부가 한국어 `@DisplayName`을 갖고(`grep`으로 테스트명 전수 확인), A~G 각 인수 조건마다 성공·실패(400/401)/경계 케이스가 쌍으로 존재함을 위 항목별로 대조 완료. `tests="17" failures="0" errors="0"` + `./gradlew clean build` 종료 코드 `0`. **충족**.
- 코딩 제약 재점검(독립): `grep -rn "@Autowired" be/src/main` → 결과 없음(생성자 주입만). `AuthController`(final `authService`), `AuthService`(final `userRepository`) 모두 생성자 주입 확인. `grep -rni lombok be/build.gradle.kts be/src/main` → 없음. DTO 6종(`LoginRequest`,`LoginResponse`,`MeResponse`,`SeedUser`,`ErrorResponse`,`FieldErrorItem`) 전부 `public record` 확인(각 파일 직접 열람). `AuthController.java`에 `try`/`catch` 없음(직접 열람). `@RestControllerAdvice`는 `ApiExceptionHandler` 1곳뿐(`grep -rl`). `LoginRequest`는 `@NotBlank`/`@Email` 선언형만 사용, 수동 null 체크 없음. `settings.gradle.kts`/`build.gradle.kts`만 존재하고 `.gradle`(Groovy) 빌드 파일 없음(`find . -name "*.gradle" -not -path "*/gradle/wrapper/*"` → 디렉터리 하나만 매치, 파일 없음). Java 21 toolchain·Spring Boot 3.5.16 `build.gradle.kts`에서 확인. 패키지 구조가 `auth/`·`common/` 두 개로 `controller/`·`service/` 계층 분리 없음(파일 목록 직접 확인). **모두 충족, 위반 없음**.
- 종합: TRD.md 인수 조건 9개 전부 코드·테스트·빌드·실 서버 실측으로 독립 재확인했고 미충족 항목이 없다. 이번 verify 패스에서 소스 코드는 열람만 하고 수정하지 않았다(순수 검증). fe/ 관련 변경 없음도 재확인했다.

### 사이클 2 · 체크박스 토글 verify

_직전 사이클 verify가 green 근거는 남겼으나 TRD.md 체크박스를 토글하지 않은 문제(`## Open` 참고)를 해결하기 위해, 코드 변경 없이 빌드·테스트·정규식·실 서버를 처음부터 다시 독립 검증하고 그 결과로 TRD.md의 `- [ ]` 9개를 `- [x]`로 토글했다. `be/**` 소스는 수정하지 않았다(순수 검증)._

- 빌드(신규 실행): `be/`에서 `./gradlew clean build --console=plain` 재실행 → `BUILD SUCCESSFUL in 3s`, `echo $?` 종료 코드 `0`(파이프 미사용). 8개 태스크 전부 성공.
- 테스트 수치(신규): `be/build/test-results/test/TEST-com.example.toss.auth.AuthControllerTest.xml` 루트 속성 `tests="17" skipped="0" failures="0" errors="0"`.
- **인수 조건 1** (로그인 200 `{name}` 단일 필드 + HttpOnly 세션 쿠키 + `application.yml` 명시 설정): `be/src/main/resources/application.yml` 13~14행에 `cookie: / http-only: true` 실존 확인. 실 서버(`--server.port=8099`)에 `curl -i -X POST /api/login`으로 시드 계정 전송 → `HTTP/1.1 200`, 바디 정확히 `{"name":"토스사용자"}`, 응답 헤더 `Set-Cookie: JSESSIONID=...; Path=/; HttpOnly` 실측. 테스트 `A-성공`, `A-설정`, `A-형태` 3건 통과. **충족 → `- [x]`**.
- **인수 조건 2** (미등록 이메일·틀린 비밀번호 → 401, `message` 비어있지 않음, `errors=[]`): 실 서버 curl로 틀린 비밀번호 전송 → `{"status":401,"message":"이메일 또는 비밀번호가 올바르지 않습니다.","errors":[]}` 실측. 테스트 `B-실패` 2건(`존재하지_않는_이메일`, `비밀번호_틀림`) 통과. **충족 → `- [x]`**.
- **인수 조건 3** (형식 오류·공백 → 400, `errors[]` 필드별 `{field,message}`, 동시 오류 시 두 필드): 실 서버 curl로 `{"email":"not-an-email","password":"  "}` 전송 → `400`, `errors:[{"field":"password",...},{"field":"email",...}]` 두 필드 모두 실측. 테스트 `C-실패` 3건 통과. **충족 → `- [x]`**.
- **인수 조건 4** (me: 세션有 200 정확히 2필드 / (a)세션無 401 / (b)세션有·속성無 401, 별도 테스트): 실 서버 login→me 흐름 → `200 {"email":"user@toss.local","name":"토스사용자"}` 실측. 테스트 `D-성공`, `D-실패(경계a)`, `D-실패(경계b)` 3건이 서로 다른 메서드로 분리돼 있음을 소스에서 확인, 모두 통과. **충족 → `- [x]`**.
- **인수 조건 5** (logout: 세션 유무 무관 204, 무효화 후 me 401, 두 경우 별도 테스트): 실 서버 login→logout→me 흐름 → logout `204`(빈 본문), 이후 me `401` 실측; 세션 없이 logout도 `204` 실측. 테스트 `E-성공`, `E-실패쪽` 2건 통과. **충족 → `- [x]`**.
- **인수 조건 6** (400·401 모두 `timestamp,status,message,errors` 4필드, `status`=실제 코드): 실 서버 curl 5건의 400/401 응답 전부 4필드 포함, `status` 값이 실제 HTTP 코드와 일치함을 실측. 테스트 `F` 2건 통과. **충족 → `- [x]`**.
- **인수 조건 7** (timestamp 정규식 글자 단위 동일성): TRD.md 29행에서 정규식 원문을 정규식 추출해 `"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$"`을 얻고, 테스트 상수 `ISO_8601_UTC_REGEX`(`AuthControllerTest.java` 33~34행)의 Java 이스케이프를 디코딩한 값과 Python으로 문자 단위 비교(`trd_regex == test_regex`) → **`True`**(완전 동일). 샘플 `2026-07-21T10:08:34.933Z`가 두 정규식 모두에 매칭됨(`True`)도 재확인. 실 서버 실측 `timestamp` 예 `2026-07-21T10:34:07.604490350Z` 등도 동일 정규식에 매칭. 테스트 `G` 통과. **충족 → `- [x]`**.
- **인수 조건 8** (`fe/` 미수정, 변경 범위 한정): `git status --porcelain` 결과 없음(클린), `git diff --name-only main...HEAD`에 `fe/` 경로 0건, 변경 파일은 `DESIGN.md`·`IMPROVEMENTS.md`·`TRD.md`·`.superpowers/**`·`be/**`뿐임을 재확인. **충족 → `- [x]`**.
- **인수 조건 9** (항목별 성공·실패 `@WebMvcTest` + 한국어 `@DisplayName` + `clean build` 0): `AuthControllerTest` 17개 테스트 명이 전부 한국어 `@DisplayName`(테스트 메서드명이 곧 표시명)이고 A~G 각 조건마다 성공·실패/경계 쌍이 존재함을 XML 테스트케이스 목록으로 재확인, `tests="17" failures="0" errors="0"` + 빌드 종료 코드 `0`. **충족 → `- [x]`**.
- **TRD.md 토글 결과**: 위 9개 항목 전부 충족이 확인되어 TRD.md 라인 23~31의 `- [ ]` 9개를 모두 `- [x]`로 토글했다(문구는 변경하지 않음, `git diff --stat TRD.md` → `9 insertions(+), 9 deletions(-)`로 체크마크만 변경됨을 확인). `be/**` 소스 코드는 열람만 했고 수정하지 않았다.
- cycle green (사이클 2): 모든 테스트 통과, TRD 인수 조건 9개 전부 `- [x]`.

## Evaluate

- 사이클 1 · evaluate: VERIFY의 `- [x]` 9개를 실제 코드(`AuthController`, `ApiExceptionHandler`, `ErrorResponse`)와 `AuthControllerTest`(14개) 대조로 재검토 → 근거 충실, 되돌릴 항목 없음.
- 인수 조건 A의 HttpOnly 쿠키는 `@WebMvcTest`가 Set-Cookie 헤더를 검증하지 않는 한계가 있으나, VERIFY가 실 Tomcat + `curl -i`로 `HttpOnly` 실측해 보완 → 유효한 근거로 인정.
- TRD.md 인수 조건 9개 전부 `- [x]`, Open 항목 0개, 마지막 VERIFY green → 루프 종료 조건 충족. 저장소 루트에 빈 `DONE` 파일 생성.

- 사이클 1 · evaluate (재생성 TRD 이후): 재생성으로 초기화된 TRD.md 인수 조건 9개를 이번 사이클 산출물과 대조 재검토했다. `./gradlew clean build` 재실행 종료 코드 0, `AuthControllerTest` `tests="17" failures="0" errors="0"`을 직접 재확인했고, `## Verify`의 이번 패스 근거가 9개 항목 모두에 대해 충실함을 확인했다(되돌릴 근거 부실 항목 없음).
- **DONE 미생성 사유**: 완료 조건은 "TRD 인수 조건 전부 `- [x]` + 마지막 VERIFY green"인데, VERIFY가 green 근거는 남겼으나 TRD.md 체크박스를 토글하지 않아 9개 모두 `- [ ]` 상태다. EVALUATE는 체크를 되돌릴 수만 있고 새로 추가할 수 없으므로(훅 차단), 이 사이클에서는 DONE을 만들 수 없다. 억지로 조건을 완화하지 않고 루프를 이어간다.
- **되돌린 체크 없음**: TRD.md에 `- [x]` 항목이 하나도 없어(전부 `- [ ]`) 되돌릴 대상이 없다. 근거 부실로 인한 강등도 해당 없음.
- **다음 단계**: 위 `## Open`에 기록한 대로, 다음 VERIFY 패스가 이미 기록된 green 근거를 바탕으로 9개 박스를 `- [x]`로 표시하면 루프가 종료 조건에 도달한다. 코드·테스트 변경은 필요 없다.

- 사이클 2 · evaluate: 사이클 2 verify가 남긴 `- [x]` 9개를 실제 근거와 대조 재검토했다. 독립으로 `be/`에서 `./gradlew clean build`를 재실행해 종료 코드 `0`, `AuthControllerTest` `tests="17" skipped="0" failures="0" errors="0"`을 직접 재확인했다. `## Verify`의 "사이클 2 · 체크박스 토글 verify" 블록이 9개 항목 모두에 대해 빌드·테스트·실 서버 curl·정규식 글자 단위 동일성(True) 근거를 충실히 담고 있어, 근거 부실로 되돌릴 항목이 없다.
- **되돌린 체크 없음**: VERIFY의 9개 `- [x]`는 전부 유효한 근거를 가진다. 특히 인수 조건 7은 TRD 문구와 테스트 상수 `ISO_8601_UTC_REGEX`의 문자 단위 동일성이 재확인됐고, TRD.md diff가 체크박스만 변경(9+/9-, 문구 무수정)임을 확인해 VERIFY가 판정 기준을 훼손하지 않았음을 검증했다.
- **DONE 생성(루프 종료)**: TRD.md 인수 조건 9개가 모두 `- [x]`이고, `## Open`에 미체크 항목이 없으며, 마지막 VERIFY가 green(빌드 0·테스트 17개 무실패)이므로 루프 종료 조건을 충족한다. 저장소 루트에 빈 `DONE` 파일을 생성했다. 남은 후속 작업 없음.

## Verify failures

## 교차검증 정합성

- [x] pass: `POST /api/login` — 시드 계정이면 **200** `{name}`과 HttpOnly 세션 쿠키를 반환한다 — `AuthControllerTest#로그인_성공`이 세션·응답 이름을 검증하고, 별도 포트 실 서버 요청에서 200 본문 `{"name":"토스사용자"}`와 `Set-Cookie: JSESSIONID=...; Path=/; HttpOnly`를 확인했다.
- [x] pass: `POST /api/login` — 이메일/비밀번호 불일치면 **401**, 공통 에러 형태를 반환한다 — 비밀번호 불일치와 미등록 이메일을 다루는 `@WebMvcTest` 2개가 통과하며, 응답의 `status`, `message`, 빈 `errors[]`, UTC `timestamp`를 검증한다.
- [x] pass: `POST /api/login` — 이메일 형식 오류·공백 입력이면 **400**, `errors[]`에 `{field, message}`가 필드별로 들어간다 — 이메일 형식 오류·비밀번호 공백 테스트가 통과했고, 실 서버 복합 오류 응답에서 `email`과 `password` 각각의 `field`·`message` 항목을 확인했다.
- [x] pass: `GET /api/me` — 로그인 세션이 있으면 **200** `{email, name}`, 없으면 **401** — 세션 유무 테스트가 모두 통과했고, 실 서버에서도 로그인 쿠키 사용 시 200과 계약상 두 필드가 반환됐다.
- [x] pass: `POST /api/logout` — **204**를 반환하고 세션을 무효화한다 (직후 `GET /api/me`는 401) — 테스트가 `MockHttpSession.isInvalid()`와 후속 401을 검증하며, 실 서버의 동일한 연속 요청에서도 204 후 401을 재현했다.
- [x] pass: 모든 에러 응답이 `{timestamp, status, message, errors[]}` 형태이고 `status`가 실제 HTTP 코드와 일치한다 — `ApiExceptionHandler`가 400·401 예외를 `ErrorResponse`로 일원화하며, 두 상태별 웹 테스트와 실 서버 응답에서 네 필드 및 HTTP 상태 일치를 확인했다.
- [x] pass: 시간 값(`timestamp`)은 ISO-8601(UTC) 문자열로 직렬화된다 — `ErrorResponse.of`가 `Instant.now().toString()`을 사용하고 전용 테스트가 `...Z` 정규식을 검증하며, 실 서버 응답 `2026-07-21T09:42:29.736315698Z`도 확인했다.
- [x] pass: `fe/` 폴더를 수정하지 않았다 (`git diff --name-only`에 `fe/` 없음) — `git diff --name-only main...HEAD` 결과가 문서와 `be/**`에만 한정되고 이 워크트리에 `fe/` 변경이 없다.
- [x] pass: 위 각 항목마다 성공·실패 케이스 `@WebMvcTest` 테스트가 존재하고 `./gradlew clean build`가 종료 코드 0으로 끝난다 — `AuthControllerTest`의 한국어 `@DisplayName` 테스트 14개가 `tests="14" skipped="0" failures="0" errors="0"`로 통과했고, 새로 실행한 전체 빌드가 `BUILD SUCCESSFUL`·종료 코드 0으로 끝났다.

## TRD 재생성

- 교차검증의 9개 인수 조건이 모두 pass이고 fail·doubt가 없어 기능 범위와 조건 수는 유지했다.
- 다음 세대가 MockMvc로 독립 재현할 수 있도록 시드 요청·정확한 응답 필드, HttpOnly 쿠키 명시 설정, 오류별 `errors[]`, UTC 정규식, Git 비교 범위와 빌드 기대 결과를 조건에 구체화했다.
- 기존 인수 조건 9개의 체크박스를 모두 `- [ ]`로 초기화해 다음 세대가 처음부터 다시 검증하도록 했다.

## 교차검증 정합성

_사이클 1 · crossverify-consistency 페이즈 — 이전 세대(반대 프로바이더) 산출물을 코드·테스트·빌드 결과로 독립 재검토한 결과. 코드는 변경하지 않았다. 새로 실행한 `be/`의 `./gradlew clean build` → `BUILD SUCCESSFUL`, 종료 코드 0, `AuthControllerTest` `tests="14" skipped="0" failures="0" errors="0"`._

- [x] pass: 인수 조건 1 (`POST /api/login` 시드 계정 → 200 정확히 `{"name":"토스사용자"}` + 세션 생성 + `http-only=true` 명시) — `AuthController.login`이 `new LoginResponse(user.name())`를 반환하고, `application.yml`에 `server.servlet.session.cookie.http-only: true`가 명시돼 있다. `로그인_성공` 테스트가 200·`$.name`·세션 속성을, `세션쿠키_HttpOnly_명시설정` 테스트가 프로퍼티 `"true"`를 검증하며 둘 다 통과한다.
- [x] pass: 인수 조건 2 (미등록 이메일·틀린 비밀번호 → 401, `status`=401, `errors` 빈 배열) — `AuthService.authenticate`가 `InvalidCredentialsException`을 던지고 `ApiExceptionHandler`가 `List.of()`(빈 배열)로 401을 만든다. `로그인_비밀번호_불일치`(status 401·`errors` empty 확인)와 `로그인_존재하지않는_이메일`(401)이 통과한다.
- [x] pass: 인수 조건 3 (이메일 형식 오류·공백 → 400, `errors[]`에 필드별 `{field, message}`) — `LoginRequest`의 `@NotBlank @Email` 선언형 검증이 `MethodArgumentNotValidException`을 유발하고 핸들러가 필드 오류를 `FieldErrorItem`으로 매핑한다. `로그인_이메일_형식_오류`(`field`=email), `로그인_비밀번호_공백`(`field`=password), `에러형태_400`이 통과한다.
- [x] pass: 인수 조건 4 (`GET /api/me` 세션有 → 200 정확히 `{email,name}` / 세션無·속성無 → 401) — `AuthService.currentUser`가 세션 null 또는 속성이 `MeResponse`가 아니면 `UnauthorizedException`을 던지고, 아니면 저장된 `MeResponse`를 반환한다. `me_세션있음`(200·email·name), `me_세션없음`(401)이 통과한다.
- [x] pass: 인수 조건 5 (`POST /api/logout` → 본문 없는 204 + 기존 세션 무효화, 직후 `me` 401) — `AuthController.logout`이 세션이 있으면 `invalidate()` 후 204를 반환한다. `로그아웃_성공_이후_me_401`이 `MockHttpSession.isInvalid()`와 후속 401을, `로그아웃_세션없어도_204`가 세션 없을 때 204를 검증하며 통과한다.
- [x] pass: 인수 조건 6 (400·401 에러 응답에 `timestamp,status,message,errors` 네 필드 + `status`=실제 코드, `errors` 항상 배열) — `ErrorResponse` record가 네 필드를 갖고 핸들러가 `status.value()`를 그대로 담는다. `에러형태_400`, `에러형태_401`이 네 필드 존재와 status 일치를 검증하며 통과한다.
- [ ] fail: 인수 조건 7 (`timestamp`가 정규식 `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(\.\d+)?Z$`와 일치) — **실질 요구(ISO-8601 UTC 문자열·epoch 아님)는 충족**하나, TRD에 명시된 이 정규식은 초(`:\d{2}`) 그룹이 빠져 있어 실제 출력과 불일치한다. 구현은 `ErrorResponse.of`가 `Instant.now().toString()`을 쓰며 이는 항상 초를 포함한다(예 `2026-07-21T10:08:34.933Z`). 이 문자열을 TRD 정규식에 `re.match` 하면 `False`(초 앞의 `:` 때문에 `Z` 매칭 실패). 반면 테스트 상수 `ISO_8601_UTC_REGEX`는 `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$`로 **TRD와 다른(초 포함) 정규식**을 써서 통과하므로, TRD가 문자열 그대로 요구한 조건은 실제로 검증되지 않았다. → 다음 TRD 재생성에서 정규식에 초 그룹(`:\d{2}`)을 추가해 테스트·출력과 일치시키는 것이 옳다(코드 변경 불필요).
- [x] pass: 인수 조건 8 (`fe/` 미수정, 변경은 `be/`·루프 문서에 한정) — 이 워크트리에 `fe/` 폴더가 없고, `git diff --name-only main...HEAD`가 `DESIGN.md`·`IMPROVEMENTS.md`·`TRD.md`·`.superpowers/**`·`be/**`에만 걸린다. 작업 트리에는 컨트롤플레인 산출물인 `DONE` 삭제(`D DONE`)만 있고 `fe/` 경로는 없다.
- [x] pass: 인수 조건 9 (항목별 성공·실패 `@WebMvcTest` 존재 + `clean build` 종료 코드 0) — 한국어 `@DisplayName`의 `AuthControllerTest` 14개가 성공·실패(400/401) 쌍을 이루며 `failures="0" errors="0"`로 통과하고, 새로 실행한 `./gradlew clean build`가 `BUILD SUCCESSFUL`·종료 코드 0으로 끝났다.

_판정: fail 1건(인수 조건 7 — TRD 정규식이 실제 출력과 불일치, 테스트가 다른 정규식으로 우회)로 `.snploop/consistency-ok`는 `false`._

## TRD 재생성 (사이클 1 · trd-regen)

직전 교차검증 정합성(fail 1건, `.snploop/consistency-ok=false`)을 근거로 TRD.md를 재작성했다. 모든 인수 조건 체크박스는 `- [ ]`로 초기화해 다음 세대가 처음부터 재검증한다.

- **인수 조건 7 (fail 반영·핵심 수정)**: TRD 정규식을 초 그룹을 포함한 `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$`로 고쳤다. 기존 정규식은 초(`:\d{2}`)가 빠져 `Instant.now().toString()`의 실제 출력(초 항상 포함)과 불일치했고, 테스트는 이를 다른 정규식으로 우회하고 있었다. "TRD 정규식과 테스트 정규식 상수가 글자 단위로 동일해야 한다"는 요구를 명시해 다음 세대가 같은 우회를 못 하게 했다. 조건의 취지(ISO-8601 UTC 문자열·epoch 아님)는 유지했다.
- **인수 조건 1 (강화)**: `application.yml` 경로와 HttpOnly 프로퍼티를 `@WebMvcTest`로 직접 검증한다는 검증 방법을 조건에 명시했고, 응답이 `name` 키 하나만 갖도록 구체화했다.
- **인수 조건 3 (강화)**: 필드명(`email`/`password`) 정확 일치와 `message` 비어 있지 않음, 이메일·비밀번호 동시 오류 시 두 필드 항목이 모두 담기는 경계를 명시했다.
- **인수 조건 4 (강화)**: 세션 없음(a)과 세션은 있으나 로그인 속성 없음(b)의 두 401 경계를 각각 별도 테스트로 검증하도록 명시했다(직전 검증에서 (b) 분기가 코드에는 있으나 전용 테스트가 없던 점 보완).
- **인수 조건 2·5·6·8·9 (구체화)**: `message` 비어 있지 않음, `errors` 빈 배열/항상 배열, 세션 유무별 별도 테스트, `git status --porcelain` 포함 범위, 성공·실패 쌍 요구 등을 문구로 더 정밀하게 다듬었다(취지 불변).

항목 수는 9개를 유지했다 — 정합성 결과가 새 기능 조건을 요구하지 않았고, 무의미한 항목 추가 대신 기존 조건의 검증 정밀도만 높였다.

## 교차검증 정합성

_사이클 1 · crossverify-consistency 페이즈 — 이전 세대 산출물을 현재 TRD의 인수 조건 9개와 독립 대조했다. `be/`에서 `./gradlew clean build --console=plain`을 새로 실행해 `BUILD SUCCESSFUL`·종료 코드 0과 `AuthControllerTest` 17개(`skipped="0" failures="0" errors="0"`) 통과를 확인했으며, 제품 코드는 변경하지 않았다._

- [x] pass: 인수 조건 1 (`POST /api/login` 시드 계정 → 200, 정확히 `{"name":"토스사용자"}`, 세션 생성, HttpOnly 쿠키와 명시 설정) — `AuthController`·`AuthService`가 인증 후 세션에 `MeResponse`를 저장하고 `LoginResponse` 하나만 반환하며, `application.yml`에 `server.servlet.session.cookie.http-only: true`가 있다. `A-성공`·`A-형태`·`A-설정` 테스트가 통과했고, 실 서버 응답에서도 `Set-Cookie: JSESSIONID=...; Path=/; HttpOnly`와 정확한 본문을 확인했다.
- [x] pass: 인수 조건 2 (미등록 이메일·틀린 비밀번호 → 각각 401, 비어 있지 않은 `message`, 빈 `errors[]`) — `AuthService.authenticate`의 두 불일치 경로가 `InvalidCredentialsException`으로 합쳐지고 `ApiExceptionHandler`가 401과 빈 목록을 반환한다. 두 입력을 분리한 `B-실패` 테스트가 각각 공통 에러 형태와 UTC timestamp까지 검증하며 통과했다.
- [x] pass: 인수 조건 3 (이메일 형식 오류·이메일/비밀번호 공백 → 400, 필드별 오류, 동시 오류 시 두 필드) — `LoginRequest`의 `@NotBlank`·`@Email`과 핸들러의 `FieldErrorItem` 변환을 확인했다. 이메일 형식 오류, 비밀번호 공백, 두 필드 동시 오류 테스트가 통과했으며, 실 서버에 공백 이메일을 보내 400과 비어 있지 않은 `email` 오류 메시지도 별도로 재현했다.
- [x] pass: 인수 조건 4 (`GET /api/me` 세션 보유 시 정확히 두 필드의 200, 세션 없음·로그인 속성 없음은 각각 401) — `D-성공`이 `aMapWithSize(2)`와 정확한 email/name을 검증하고, `D-실패(경계a)`와 `D-실패(경계b)`가 두 401 경계를 별도 테스트로 검증한다. 실 서버 로그인 쿠키로도 정확한 200 본문을 확인했다.
- [x] pass: 인수 조건 5 (`POST /api/logout`은 세션 유무와 무관하게 빈 204, 기존 세션 무효화 후 me 401) — 세션이 있는 `E-성공`은 `isInvalid()`와 후속 me 401을, 세션이 없는 `E-실패쪽`은 204를 각각 검증하며 통과했다. 실 서버의 로그인→me→logout→me 연속 요청도 200→204→401로 재현됐다.
- [x] pass: 인수 조건 6 (모든 400·401 응답은 `timestamp,status,message,errors` 네 필드, 실제 HTTP 상태와 같은 정수 status, 배열 errors) — `ErrorResponse`가 네 필드의 record이고 핸들러가 실제 `HttpStatus.value()`와 목록을 전달한다. `F`의 400·401 테스트와 자격/검증 실패 테스트가 두 상태의 필드·타입·값을 검증하며 모두 통과했다.
- [x] pass: 인수 조건 7 (timestamp는 초를 포함한 ISO-8601 UTC 문자열이며 TRD·테스트 정규식이 글자 단위로 동일) — `ErrorResponse.of`는 `Instant.now().toString()`을 사용한다. TRD와 `ISO_8601_UTC_REGEX` 런타임 값은 모두 `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$`로 동일하고 `G` 테스트가 통과했으며, 실 서버 값 `2026-07-21T10:41:39.344277728Z`도 이 형식과 일치한다.
- [x] pass: 인수 조건 8 (`fe/` 미수정, 백엔드 루프 범위와 루프 문서에만 변경 한정) — 검증 시작 시 `git status --porcelain`은 비어 있었고 `git diff --name-only main...HEAD`에 `fe/` 경로가 없었다. 변경 목록은 `be/**`, `TRD.md`, `DESIGN.md`, `IMPROVEMENTS.md`, 구현 작업 보고서로만 구성돼 있다.
- [x] pass: 인수 조건 9 (요청 행렬·경계·HttpOnly 설정을 한국어 `@DisplayName`의 `@WebMvcTest` + `MockMvc`로 검증하고 전체 빌드 성공) — `AuthControllerTest`의 17개 테스트가 모두 한국어 표시명을 가지며 로그인 A~C, me D, logout E, 공통 오류 F, timestamp G의 성공·실패·경계를 검증한다. 새 전체 빌드는 8개 태스크를 수행해 `BUILD SUCCESSFUL`·종료 코드 0으로 끝났다.

_판정: fail·doubt 없음. `.snploop/consistency-ok`는 `true`._

## TRD 재생성

_사이클 1 · trd-regen 페이즈 — 직전 교차검증에서 9개 인수 조건이 모두 pass였으므로 기능 범위와 조건 수는 유지하고, 모든 체크박스를 `- [ ]`로 초기화했다._

- 인수 조건 3은 잘못된 이메일 형식·공백 이메일·공백 비밀번호·두 필드 동시 오류를 각각 별도 `@WebMvcTest`로 검증하도록 구체화했다. 직전 실 서버 검증으로 동작은 확인됐지만 공백 이메일만을 분리한 회귀 테스트가 없었으므로 다음 세대의 증거 기준을 높였다.
- 인수 조건 5는 세션 유무별 204 응답의 본문 바이트 길이가 0인지 직접 단언하도록 강화했고, 인수 조건 6은 400·401 에러 객체가 정확히 네 키만 가지며 `message`가 비어 있지 않은지 검증하도록 강화했다.
- 인수 조건 9에 위 입력 오류 4종과 세션 경계를 빠짐없이 별도 테스트로 두도록 명시했다. API 기능 범위와 나머지 조건의 취지는 바꾸지 않았다.
