# Improvements & findings

_Appended by VERIFY and EVALUATE. Checked off ("- [x]") by IMPLEMENT._
_Open items use "- [ ]". Empty Open list + green verify is the signal to create DONE._

## Open

## Verify

- DESIGN.md 2절에서 agent-browser로 관찰한 toss.im의 색·타이포·버튼·여백 재현 근거를 확인했다.
- 3001 스텁 서버의 `/api/login`·`/api/me`·`/api/logout`을 순서대로 호출해 400·401·200·204, 시드 계정, 쿠키, 오류 JSON 키와 UTC 타임스탬프를 확인했다.
- agent-browser로 `/login`에서 이메일·비밀번호 입력, 로그인 버튼, 미니멀 카드와 파란 프라이머리 버튼 렌더링을 확인했다.
- agent-browser로 401 자격 오류의 인라인 경고와 시드 계정 로그인 뒤 `/` 이동 및 `토스사용자` 표시를 확인했다.
- agent-browser로 공백 제출과 잘못된 이메일 제출에서 `errors[]` 기반 이메일·비밀번호 인라인 메시지를 확인했다.
- agent-browser로 홈의 로그아웃 클릭 뒤 `/login` 복귀를 확인했다.
- 쿠키 없는 agent-browser 세션에서 `/` 접근 시 `/login`으로 이동함을 확인했다.
- agent-browser 360×800 및 1280×720 뷰포트에서 `scrollWidth === innerWidth`를 확인하고, 소스 검색으로 외부 CDN·원격 이미지 링크가 없음을 확인했다.
- `NEXT_PUBLIC_API_MODE=real`과 기본 모드에서 `next.config.js`의 rewrite 결과 및 모든 UI API 호출의 상대 경로를 확인했다.
- `git diff --name-only`에서 `be/` 경로가 없음을 확인했다.
- `cd fe && npm ci && npm run build`가 종료 코드 0으로 완료되어 TypeScript strict 빌드를 확인했다.

## Verify failures

- [ ] fix: :3000을 점유한 기존 개발 서버가 `/_next/static/*` 청크를 404로 반환하여 홈의 인증 스크립트가 실행되지 않았고, agent-browser의 :3000 로그인 → 홈 → 로그아웃 실동작을 확인할 수 없었다 (기존 :3000 프로세스)
