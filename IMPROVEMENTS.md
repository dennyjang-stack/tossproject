# Improvements & findings

_Appended by VERIFY and EVALUATE. Checked off ("- [x]") by IMPLEMENT._
_Open items use "- [ ]". Empty Open list + green verify is the signal to create DONE._

## Open

## Verify

- cycle green: 모든 테스트 통과
- 빌드: `be/`에서 `./gradlew clean build` 실행 → **BUILD SUCCESSFUL**, 종료 코드 **0** 확인 (파이프 없이 `$?` 직접 캡처로 재확인).
- 테스트: `be/build/test-results/test/TEST-com.example.toss.auth.AuthControllerTest.xml` → `tests="13" skipped="0" failures="0" errors="0"`. 인수 조건 A~G마다 성공·실패(400/401) 케이스가 쌍으로 존재.
- 인수 조건 1 (`POST /api/login` 시드 계정 → 200 `{name}` + HttpOnly 세션 쿠키): `AuthControllerTest#로그인_성공`으로 200/`$.name`/세션 생성 확인 + `be/`를 `--server.port=8099`로 실제 기동해 `curl -i` 로 응답 헤더에 `Set-Cookie: JSESSIONID=...; Path=/; HttpOnly` 실제 노출 직접 확인(WebMvcTest는 세션 객체만 검증하고 Set-Cookie 헤더 자체는 검증하지 않으므로 실 서버로 별도 확인). 충족.
- 인수 조건 2 (자격 불일치 → 401 공통 에러): `AuthControllerTest#로그인_비밀번호_불일치`, `#로그인_존재하지않는_이메일` + 실 서버 curl로 401·`errors:[]` 확인. 충족.
- 인수 조건 3 (형식 오류·공백 → 400, `errors[]` 필드별): `#로그인_이메일_형식_오류`, `#로그인_비밀번호_공백` + 실 서버 curl로 `errors:[{"field":"email",...},{"field":"password",...}]` 확인. 충족.
- 인수 조건 4 (`GET /api/me` 세션有 200 / 세션無 401): `#me_세션있음`, `#me_세션없음` + 실 서버에서 쿠키 재사용 흐름(login→me)으로 200 `{email,name}` 확인. 충족.
- 인수 조건 5 (`POST /api/logout` 204 + 세션 무효화, 이후 me 401): `#로그아웃_성공_이후_me_401`(`session.isInvalid()`까지 확인) + 실 서버에서 login→me→logout→me 흐름으로 204 후 401 재현 확인. 충족.
- 인수 조건 6 (에러 응답 `{timestamp,status,message,errors[]}`, `status`=실제 코드): `#에러형태_400`, `#에러형태_401` + 실 서버 curl 응답 바디에서 네 필드 전부 확인. 충족.
- 인수 조건 7 (`timestamp` ISO-8601 UTC 문자열): `#timestamp_ISO8601_UTC`(정규식 `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$` 매칭) + 실 서버 응답 예시 `2026-07-21T09:34:21.856006895Z` 로 직접 확인. `application.yml`의 `spring.jackson.time-zone: UTC`, `write-dates-as-timestamps: false` 설정과 `ErrorResponse.of`가 `Instant.now().toString()`을 사용하는 코드 조합으로 epoch 숫자가 아닌 문자열임을 코드 레벨에서도 확인. 충족.
- 인수 조건 8 (`fe/` 미수정): 이 워크트리(백엔드 루프)에는 `fe/` 폴더 자체가 없음(`ls -d fe` → 없음), `git diff --name-only`·`git status --porcelain` 모두 `fe/` 경로 없이 클린. `git diff --name-only main...HEAD`로 확인한 변경 파일 목록도 `DESIGN.md`, `IMPROVEMENTS.md`, `TRD.md`, `be/**`뿐. 충족.
- 인수 조건 9 (항목별 성공·실패 `@WebMvcTest` + `clean build` 0): 위 테스트 13개 전부 통과 + 빌드 종료 코드 0. 충족.
- 코딩 제약 점검: 생성자 주입/`final`만 사용(`AuthController`, `AuthService`에 필드 `@Autowired` 없음, `grep -rn "@Autowired" src/main` 결과 없음), Lombok 미사용(`build.gradle.kts`·`src/main` 어디에도 `lombok` 없음), DTO 6종 모두 `record`(`LoginRequest`,`LoginResponse`,`MeResponse`,`SeedUser`,`ErrorResponse`,`FieldErrorItem`), 컨트롤러(`AuthController.java`)에 `try`/`catch` 없음, `@RestControllerAdvice`는 `ApiExceptionHandler` 단 하나만 존재, 검증은 `jakarta.validation`의 `@NotBlank`/`@Email` 선언형으로 처리(수동 null 체크 없음). 모두 충족.
- 스택/구조 점검: Java 21 toolchain, Spring Boot 3.5.16, Gradle Kotlin DSL(`build.gradle.kts`/`settings.gradle.kts`, Groovy 없음), 외부 DB·Docker·JWT/OAuth 미사용, 패키지 구조가 `auth/`,`common/` feature-by-package로 DESIGN.md와 일치. 충족.

## Evaluate

- 사이클 1 · evaluate: VERIFY의 `- [x]` 9개를 실제 코드(`AuthController`, `ApiExceptionHandler`, `ErrorResponse`)와 `AuthControllerTest`(13개) 대조로 재검토 → 근거 충실, 되돌릴 항목 없음.
- 인수 조건 A의 HttpOnly 쿠키는 `@WebMvcTest`가 Set-Cookie 헤더를 검증하지 않는 한계가 있으나, VERIFY가 실 Tomcat + `curl -i`로 `HttpOnly` 실측해 보완 → 유효한 근거로 인정.
- TRD.md 인수 조건 9개 전부 `- [x]`, Open 항목 0개, 마지막 VERIFY green → 루프 종료 조건 충족. 저장소 루트에 빈 `DONE` 파일 생성.

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
- [x] pass: 위 각 항목마다 성공·실패 케이스 `@WebMvcTest` 테스트가 존재하고 `./gradlew clean build`가 종료 코드 0으로 끝난다 — `AuthControllerTest`의 한국어 `@DisplayName` 테스트 13개가 `tests="13" skipped="0" failures="0" errors="0"`로 통과했고, 새로 실행한 전체 빌드가 `BUILD SUCCESSFUL`·종료 코드 0으로 끝났다.
