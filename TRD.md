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

- [ ] `POST /api/login`에 시드 계정 `{"email":"user@toss.local","password":"toss1234!"}`을 보내면 **200**과 정확히 `{"name":"토스사용자"}`를 반환하고 로그인 세션을 생성하며, `JSESSIONID` 쿠키가 HttpOnly로 반환되도록 `server.servlet.session.cookie.http-only=true`를 명시 설정한다
- [ ] `POST /api/login`에서 등록되지 않은 이메일 또는 틀린 비밀번호를 보내면 각각 **401**과 공통 에러 형태를 반환하며, `status`는 401이고 `errors`는 빈 배열이다
- [ ] `POST /api/login`에서 잘못된 이메일 형식 또는 이메일·비밀번호 공백을 보내면 각각 **400**을 반환하고, `errors[]`에 해당 입력 필드의 비어 있지 않은 `{field, message}` 항목이 포함된다
- [ ] `GET /api/me`는 로그인 세션 쿠키가 있으면 **200**과 정확히 `{"email":"user@toss.local","name":"토스사용자"}`를 반환하고, 세션이 없거나 로그인 사용자 속성이 없으면 **401**과 공통 에러 형태를 반환한다
- [ ] `POST /api/logout`은 세션 유무와 관계없이 본문 없는 **204**를 반환하고, 기존 세션이 있으면 무효화하여 같은 쿠키로 직후 호출한 `GET /api/me`가 **401**이 된다
- [ ] API 계약상 **400·401** 에러 응답은 모두 `timestamp`, `status`, `message`, `errors` 네 필드를 포함하며, `status`는 실제 HTTP 상태 코드와 일치하고 `errors`는 항상 배열이다
- [ ] 모든 에러 응답의 `timestamp`는 epoch 숫자가 아닌 ISO-8601 UTC 문자열이며 정규식 `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$`와 일치한다
- [ ] `git diff --name-only main...HEAD`와 작업 트리 변경 목록에 `fe/` 경로가 없고, 변경은 백엔드 루프 범위인 `be/` 및 루프 문서에만 한정된다
- [ ] 위 요청 행렬의 성공·실패·경계 케이스와 HttpOnly 세션 쿠키 설정을 한국어 `@DisplayName`의 `@WebMvcTest` + `MockMvc` 테스트로 검증하며, `be/`에서 새로 실행한 `./gradlew clean build`가 테스트 실패 없이 `BUILD SUCCESSFUL`·종료 코드 0으로 끝난다

## Out of scope

- 회원가입, 소셜 로그인, 2FA, 비밀번호 찾기, 사용자 CRUD
- 프론트엔드(`fe/`) — 별도 루프
- 외부 DB·Docker, JWT/OAuth, 배포·CI
