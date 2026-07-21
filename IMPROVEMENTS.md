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
