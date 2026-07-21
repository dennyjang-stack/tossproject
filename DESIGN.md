# DESIGN — 토스 로그인 백엔드 (Spring Boot 인증 API)

> 사이클 1 · design 페이즈 산출물. 대응 TRD = `TRD.md`.
> **`be/`만 다룬다. `fe/`는 건드리지 않는다.** 프론트 없이 MockMvc 테스트로 검증을 완결한다.

## 1. 이번 사이클 범위

TRD의 인수 조건 전체가 "세션 로그인 API 3종 + 공통 에러 처리"라는 하나의 응집된 묶음이다.
현재 구현은 기본 흐름을 이미 갖추고 있으므로 구조를 다시 만들지 않는다. 이번 사이클은 재생성된
TRD에 맞춰 **HttpOnly 정책을 명시 설정하고, 누락된 경계 조건을 테스트로 고정한 뒤 전체 계약을
재검증**한다.

- `POST /api/login`, `GET /api/me`, `POST /api/logout` 3개 엔드포인트
- `HttpSession` + 명시적으로 HttpOnly가 설정된 `JSESSIONID` 쿠키 기반 세션
- 인메모리 시드 계정 1개
- `@RestControllerAdvice` 단일 예외 처리기 + 공통 에러 형태
- 위 항목별 성공·실패 `@WebMvcTest` 테스트, `./gradlew clean build` 종료 코드 0

## 2. 스택 · 빌드

- **Java 21** (Gradle toolchain 고정), **Spring Boot 3.5.x**
- 의존성: `spring-boot-starter-web`, `spring-boot-starter-validation`, `spring-boot-starter-test`
- **Gradle Kotlin DSL**(`build.gradle.kts`, `settings.gradle.kts`) — Groovy DSL 금지
- Gradle Wrapper(`./gradlew`)만 사용. 외부 DB·Docker·Lombok 없음.

### 판정 기준

`./gradlew clean build`(종료 코드 0) = 백엔드 VERIFY 통과.

## 3. 패키지 구조 (feature by package)

```
be/
  build.gradle.kts
  settings.gradle.kts
  gradle/wrapper/…              (Wrapper 포함)
  gradlew, gradlew.bat
  src/main/java/com/example/toss/
    TossApplication.java        @SpringBootApplication 진입점
    auth/
      AuthController.java       3개 엔드포인트
      AuthService.java          자격 검증 + 세션 발급/조회
      UserRepository.java       인메모리 시드 계정 저장소
      SeedUser.java             내부 사용자 표현 (email, password, name)
      LoginRequest.java         record {email, password} + 검증 애너테이션
      LoginResponse.java        record {name}
      MeResponse.java           record {email, name}
      InvalidCredentialsException.java   401 신호 (자격 불일치)
      UnauthorizedException.java         401 신호 (미로그인 세션)
    common/
      ApiExceptionHandler.java  @RestControllerAdvice — 모든 에러 일원화
      ErrorResponse.java        record {timestamp, status, message, errors[]}
      FieldErrorItem.java       record {field, message}   (errors[] 항목)
  src/main/resources/
    application.yml             Jackson 날짜 직렬화 + HttpOnly 세션 쿠키 설정
  src/test/java/com/example/toss/
    auth/AuthControllerTest.java    @WebMvcTest 기반 인수 테스트
```

- `controller/`, `service/` 계층 폴더로 나누지 않는다. auth 기능은 `auth/` 한 패키지.
- 컨트롤러 try/catch 금지 — 예외는 던지고 `ApiExceptionHandler`가 잡는다.
- 생성자 주입만, 필드 `final`. Lombok 금지, DTO는 `record`.

## 4. 컴포넌트 책임

### AuthController
- `POST /api/login`
  - `@Valid @RequestBody LoginRequest` — 검증 실패 시 `MethodArgumentNotValidException` 자동 발생(400).
  - `AuthService.authenticate(email, password)` 호출 → 실패 시 `InvalidCredentialsException`(401).
  - 성공 시 `HttpServletRequest.getSession(true)`에 로그인 사용자 정보 저장 → `200 LoginResponse{name}`.
- `GET /api/me`
  - `AuthService.currentUser(session)` — 세션 속성 없으면 `UnauthorizedException`(401).
  - 있으면 `200 MeResponse{email, name}`.
- `POST /api/logout`
  - 존재하는 세션이 있으면 `HttpSession.invalidate()`. 세션 유무와 무관하게 `204 No Content`.

### AuthService
- `authenticate(email, password)` → `UserRepository`에서 시드 계정과 대조. 불일치면 `InvalidCredentialsException`.
- 세션 속성 키 상수 `SESSION_USER = "LOGIN_USER"` 를 소유. 세션에 저장할 값은 표시용 최소 정보(email, name).
- 컨트롤러가 세션 저장/조회 시 이 서비스의 헬퍼를 거쳐 키·형식을 한곳에 모은다.

### UserRepository
- 인메모리 하드코딩 시드 계정 1개: `user@toss.local` / `toss1234!` / 표시 이름 `토스사용자`.
- `findByEmail(email)` → `Optional<SeedUser>`. 비밀번호 대조는 서비스에서 수행(평문 비교, 시드 데모 목적).

### ApiExceptionHandler (`@RestControllerAdvice`, 단 하나)
- `MethodArgumentNotValidException` → **400**. `BindingResult`의 필드 오류를 `errors[] {field, message}`로 변환.
- `InvalidCredentialsException` → **401**, `message` = "이메일 또는 비밀번호가 올바르지 않습니다.", `errors` = `[]`.
- `UnauthorizedException` → **401**, `message` = "로그인이 필요합니다.", `errors` = `[]`.
- `HttpMessageNotReadableException`(빈 바디/깨진 JSON) → **400** 방어적으로 처리, `errors` = `[]`.
- 모든 응답 바디는 `ErrorResponse` 공통 형태. `status` 필드에 실제 HTTP 상태 코드 정수를 넣는다.

## 5. DTO · 에러 계약 (계약 표와 글자 단위 일치)

```
LoginRequest  { String email, String password }
  email    : @NotBlank + @Email
  password : @NotBlank
LoginResponse { String name }
MeResponse    { String email, String name }

ErrorResponse { String timestamp, int status, String message, List<FieldErrorItem> errors }
FieldErrorItem { String field, String message }
```

- `errors[]`는 항상 존재하는 배열(자격/세션 오류에서도 빈 배열 `[]`).
- `timestamp`는 ISO-8601(UTC) 문자열이다. `ErrorResponse.of`가 `Instant.now().toString()` 결과를
  문자열 필드에 담아 `2026-07-21T09:00:00Z` 형태를 확정한다. `application.yml`의
  `spring.jackson.serialization.write-dates-as-timestamps: false`와 `spring.jackson.time-zone: UTC`도
  전역 날짜 직렬화 정책으로 유지한다.

## 6. 데이터 흐름

### 로그인 성공
```
POST /api/login {email,password}
 → @Valid 통과
 → AuthService.authenticate → SeedUser 반환
 → request.getSession(true) 생성, 세션 속성 LOGIN_USER = {email,name} 저장
 → 200 {name:"토스사용자"} + Set-Cookie: JSESSIONID=…; HttpOnly
```
`application.yml`에 `server.servlet.session.cookie.http-only: true`를 명시해 컨테이너 기본값 변화와
무관하게 쿠키 정책을 고정한다. `MockMvc`에서는 생성된 세션과 해당 설정값을 함께 검증한다.

### 로그인 실패 (자격 불일치 / 형식 오류)
```
불일치  → InvalidCredentialsException → 401 ErrorResponse(errors:[])
형식오류 → MethodArgumentNotValidException → 400 ErrorResponse(errors:[{field,message}, …])
```

### me / logout
```
GET  /api/me   세션有 → 200 {email,name}       세션無 → 401 ErrorResponse
POST /api/logout  → session.invalidate() → 204 (바디 없음)   이후 /api/me → 401
```

## 7. 인수 조건 → 충족 방법 → 테스트 매핑

전부 `AuthControllerTest`(`@WebMvcTest(AuthController.class)` +
`@Import({AuthService.class, UserRepository.class, ApiExceptionHandler.class})`)에서 `MockMvc`로 검증한다.
세션은 `MockHttpSession` 및 `andReturn().getRequest().getSession()`으로 다루고, 쿠키 정책은 테스트
컨텍스트의 `Environment`에서 `server.servlet.session.cookie.http-only`를 읽어 검증한다.
`@DisplayName`은 한국어 문장으로 작성한다.

| # | 인수 조건 | 충족 방법 | 테스트 (성공/실패) |
|---|-----------|-----------|--------------------|
| A | 시드 계정 로그인 → 200 정확한 `{name}` + 세션 생성 + HttpOnly 명시 설정 | 기존 로그인 흐름 유지, `application.yml`에 `server.servlet.session.cookie.http-only: true` 추가 | 200, `$.name=토스사용자`, 최상위 필드 1개, 새 세션과 `LOGIN_USER` 확인, `Environment` 설정값이 `true`인지 검증 |
| B | 미등록 이메일·틀린 비밀번호 → 각각 401 공통 에러 | `InvalidCredentialsException` → 핸들러 401 | 두 입력을 독립 테스트하고 HTTP 401, `$.status=401`, `$.errors`가 빈 배열인지 모두 검증 |
| C | 잘못된 이메일 형식·이메일 공백·비밀번호 공백 → 각각 400와 필드 오류 | `@Valid` 검증 실패 → 400, `BindingResult`를 `{field,message}`로 매핑 | 세 입력을 독립 테스트하고 대상 `field`가 존재하며 대응 `message`가 빈 문자열이 아닌지 검증 |
| D | me: 로그인 세션은 정확한 `{email,name}`, 세션/사용자 속성 부재는 401 | 세션의 `LOGIN_USER` 조회, 없으면 `UnauthorizedException` | 성공 응답 최상위 필드 2개와 값을 확인. 세션 자체 없음과 속성 없는 세션을 각각 401 공통 에러로 검증 |
| E | logout: 세션 유무와 무관하게 빈 본문 204, 기존 세션 무효화 | 세션이 있을 때만 `invalidate()`, 항상 204 | 세션 있음/없음 각각 204와 빈 본문 확인. 기존 세션 `isInvalid()` 및 후속 me 401 검증 |
| F | 400·401 모두 정확한 공통 에러 구조 | 알려진 계약 예외를 `ApiExceptionHandler`에서 `ErrorResponse`로 통일 | 각 상태에서 최상위 필드가 정확히 4개인지, `status`와 HTTP 코드가 같은지, `errors`가 배열인지 검증 |
| G | `timestamp`가 ISO-8601 UTC 문자열 | `Instant.now().toString()`으로 생성 | `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$` 정규식과 일치시켜 숫자 epoch·비 UTC 오프셋을 배제 |
| H | `fe/` 미수정 | 구현 변경을 `be/`와 루프 문서로 제한 | `git diff --name-only main...HEAD`와 `git status --short`에서 `fe/` 경로가 없는지 확인 |
| I | 강화된 요청 행렬 전체를 `@WebMvcTest`로 검증 + `clean build` 0 | 위 테스트 일체와 Gradle Wrapper 빌드 | 테스트 XML의 failures/errors 0 및 `./gradlew clean build`의 `BUILD SUCCESSFUL`·종료 코드 0 확인 |

## 8. 핵심 결정 (근거)

1. **세션 저장 값은 최소 DTO(email, name)** — `SeedUser`(비밀번호 포함)를 세션에 직접 넣지 않는다.
   me 응답에 필요한 값만 담아 노출면을 줄인다.
2. **HttpOnly 정책을 설정 파일에 명시** — `server.servlet.session.cookie.http-only: true`로 프레임워크
   기본값에 의존하지 않는다. Spring Security를 추가하지 않고 기존 `HttpSession` 구조를 유지한다.
3. **`@RestControllerAdvice` 단일 핸들러** — 컨트롤러 try/catch·수동 null 체크를 없애고 에러 형태를 한곳에 고정.
   401은 커스텀 예외 2종(`InvalidCredentials`/`Unauthorized`)으로 의미를 구분하되 응답 형태는 동일.
4. **검증은 선언형(`jakarta.validation`)** — `@Email`,`@NotBlank`로 400을 자동화. 필드별 메시지가
   `errors[]`로 그대로 흘러 인수 조건 C를 자연스럽게 만족.
5. **`@WebMvcTest` + 실제 서비스 `@Import`** — 서비스 로직이 단순하고 시드 대조가 핵심이라 Mock보다
   실 빈을 넣어 로그인 성공/실패를 진짜로 검증. 웹 계층만 로드해 테스트를 가볍게 유지.
6. **`timestamp` 직렬화는 테스트로 고정** — Jackson 설정과 응답 형태를 테스트가 못 박아, 구현이 epoch
   숫자로 새는 회귀를 방지(인수 조건 G).

## 9. 테스트 전략 요약

- 프레임워크: JUnit 5 + AssertJ, 웹 계층 `@WebMvcTest` + `MockMvc`. **테스트 먼저 작성**(implement 페이즈).
- 기존 테스트를 먼저 강화해 새 TRD와의 차이가 실패로 드러나는지 확인한 뒤 설정을 최소 수정한다.
- 경계 입력은 잘못된 이메일 형식, 이메일 공백, 비밀번호 공백을 각각 독립 테스트한다.
- 세션 오류는 세션 없음과 세션은 있으나 `LOGIN_USER` 속성이 없는 경우를 각각 테스트한다.
- 응답의 "정확히"는 기대 필드 값뿐 아니라 최상위 필드 개수까지 검사해 여분 필드 회귀를 막는다.
- 세션 시나리오: 로그인 성공 응답의 세션을 재사용해 me 200 → logout 204 → me 401 로 이어지는 흐름을 별도 테스트로도 확인.
- 프론트·통합 실행은 이 루프 범위 밖. 별도 통합 실행 테스트를 추가하지 않는다.

## 10. 다음 페이즈(implement)로 넘기는 작업 목록

1. `AuthControllerTest`에 HttpOnly 설정 검증을 먼저 추가해 실패를 확인한다.
2. `application.yml`에 `server.servlet.session.cookie.http-only: true`를 추가해 테스트를 통과시킨다.
3. 이메일 공백, 사용자 속성 없는 세션, 정확한 응답 필드 수, 204 빈 본문 테스트를 보강한다.
4. 자격 오류 2종과 입력 오류 3종 각각에서 공통 에러 구조·필드 메시지를 빠짐없이 검증한다.
5. `git diff --name-only main...HEAD`와 작업 트리에서 `fe/` 변경이 없음을 확인한다.
6. `./gradlew clean build`를 새로 실행해 테스트 실패 없이 종료 코드 0인지 확인한다.
