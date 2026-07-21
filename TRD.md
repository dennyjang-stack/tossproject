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

- [x] `POST /api/login` — 시드 계정이면 **200** `{name}`과 HttpOnly 세션 쿠키를 반환한다
- [x] `POST /api/login` — 이메일/비밀번호 불일치면 **401**, 공통 에러 형태를 반환한다
- [x] `POST /api/login` — 이메일 형식 오류·공백 입력이면 **400**, `errors[]`에 `{field, message}`가 필드별로 들어간다
- [x] `GET /api/me` — 로그인 세션이 있으면 **200** `{email, name}`, 없으면 **401**
- [x] `POST /api/logout` — **204**를 반환하고 세션을 무효화한다 (직후 `GET /api/me`는 401)
- [x] 모든 에러 응답이 `{timestamp, status, message, errors[]}` 형태이고 `status`가 실제 HTTP 코드와 일치한다
- [x] 시간 값(`timestamp`)은 ISO-8601(UTC) 문자열로 직렬화된다
- [x] `fe/` 폴더를 수정하지 않았다 (`git diff --name-only`에 `fe/` 없음)
- [x] 위 각 항목마다 성공·실패 케이스 `@WebMvcTest` 테스트가 존재하고 `./gradlew clean build`가 종료 코드 0으로 끝난다

## Out of scope

- 회원가입, 소셜 로그인, 2FA, 비밀번호 찾기, 사용자 CRUD
- 프론트엔드(`fe/`) — 별도 루프
- 외부 DB·Docker, JWT/OAuth, 배포·CI
