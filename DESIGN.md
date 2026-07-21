# DESIGN — 토스 로그인 백엔드 (Spring Boot 인증 API)

> 사이클 1 · design 페이즈 산출물. 대응 TRD = `TRD.md`.
> **`be/`만 다룬다. `fe/`는 건드리지 않는다.** 프론트 없이 MockMvc 테스트로 검증을 완결한다.

## 1. 이번 사이클 범위

TRD의 인수 조건 전체가 "세션 로그인 API 3종 + 공통 에러 처리"라는 하나의 응집된 묶음이다.
잘게 쪼개면 오히려 세션 흐름(로그인→me→logout)을 끊어 검증하기 어렵다. 따라서 **이번 사이클에서
백엔드 전체를 한 번에 구현·테스트**한다.

- `POST /api/login`, `GET /api/me`, `POST /api/logout` 3개 엔드포인트
- `HttpSession` + HttpOnly 쿠키 기반 세션
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
    application.yml             Jackson 날짜 직렬화 설정
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
- `timestamp`는 ISO-8601(UTC) 문자열. `Instant.now()`를 Jackson `JavaTimeModule`로 직렬화하되
  `application.yml`에 `spring.jackson.serialization.write-dates-as-timestamps: false`,
  `spring.jackson.time-zone: UTC` 를 두어 epoch 숫자가 아닌 `2026-07-21T09:00:00Z` 형태로 나오게 한다.
  (record 직렬화 안정성을 위해 핸들러에서 `Instant.now().toString()`으로 문자열을 만들어 담는 방식도 대안으로 검토 —
  구현 단계에서 테스트로 형태를 고정한다.)

## 6. 데이터 흐름

### 로그인 성공
```
POST /api/login {email,password}
 → @Valid 통과
 → AuthService.authenticate → SeedUser 반환
 → request.getSession(true) 생성, 세션 속성 LOGIN_USER = {email,name} 저장
 → 200 {name:"토스사용자"} + Set-Cookie: JSESSIONID=…; HttpOnly
```
톰캣 기본 세션 쿠키(`JSESSIONID`)는 기본적으로 `HttpOnly`. 별도 커스터마이징 없이 계약 충족.

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

전부 `AuthControllerTest`(`@WebMvcTest(AuthController.class)` + `@Import({AuthService.class, UserRepository.class})`,
`ApiExceptionHandler`는 advice로 자동 스캔)에서 `MockMvc`로 검증한다. 세션은 `MockHttpSession` 및
`andReturn().getRequest().getSession()`으로 다룬다. `@DisplayName`은 한국어 문장.

| # | 인수 조건 | 충족 방법 | 테스트 (성공/실패) |
|---|-----------|-----------|--------------------|
| A | 시드 계정 로그인 → 200 `{name}` + HttpOnly 세션 쿠키 | authenticate 성공 후 세션 저장, `{name}` 반환 | 성공: 200 + `$.name=토스사용자` + `Set-Cookie` HttpOnly 검증. 실패쌍은 B로 |
| B | 자격 불일치 → 401 공통 에러 | `InvalidCredentialsException` → 핸들러 401 | 실패: 틀린 비밀번호로 401 + `$.status=401` + `$.errors` 빈 배열 |
| C | 형식 오류·공백 → 400, `errors[]` 필드별 | `@Valid` 검증 실패 → 400, BindingResult 매핑 | 실패: `email` 무효/`password` 공백 요청 → 400 + `$.errors[*].field` 에 `email`,`password` 포함. 성공쌍은 A |
| D | me: 세션有 200 `{email,name}` / 세션無 401 | 세션 속성 조회, 없으면 `UnauthorizedException` | 성공: 세션 주입 후 200 + `$.email`,`$.name`. 실패: 세션 없이 401 |
| E | logout: 204 + 세션 무효화, 직후 me 401 | `session.invalidate()` 후 204 | 성공: 204 + 세션 `isInvalid()`. 실패측: 무효화된 세션으로 me 호출 → 401 |
| F | 모든 에러가 `{timestamp,status,message,errors[]}`, `status`=실제 코드 | 모든 예외를 `ErrorResponse`로 통일 | 400·401 각각에서 네 필드 존재 + `$.status` 값이 HTTP 코드와 일치 검증 |
| G | `timestamp` ISO-8601(UTC) 문자열 | Jackson UTC + non-timestamp 설정 | 에러 응답 `$.timestamp` 가 `…Z`(또는 오프셋) ISO 패턴 정규식 매칭 |
| H | `fe/` 미수정 | 작업을 `be/`에 국한 | 검증: `git diff --name-only` 에 `fe/` 경로 없음 (VERIFY 단계 확인) |
| I | 항목별 성공·실패 `@WebMvcTest` + `clean build` 0 | 위 테스트 일체 + Gradle 빌드 | `./gradlew clean build` 종료 코드 0 |

## 8. 핵심 결정 (근거)

1. **세션 저장 값은 최소 DTO(email, name)** — `SeedUser`(비밀번호 포함)를 세션에 직접 넣지 않는다.
   me 응답에 필요한 값만 담아 노출면을 줄인다.
2. **HttpOnly 쿠키는 서블릿 컨테이너 기본(JSESSIONID)에 위임** — 계약이 요구하는 HttpOnly가 기본값이라
   추가 설정 없이 충족. Spring Security 도입 없이 단순 유지(TRD Out of scope: 복잡 인증 금지).
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
- 각 인수 조건마다 성공·실패(400/401) 케이스를 모두 둔다.
- 세션 시나리오: 로그인 성공 응답의 세션을 재사용해 me 200 → logout 204 → me 401 로 이어지는 흐름을 별도 테스트로도 확인.
- 프론트·통합 실행은 이 루프 범위 밖. 별도 통합 실행 테스트를 추가하지 않는다.

## 10. 다음 페이즈(implement)로 넘기는 작업 목록

1. `be/` Gradle Kotlin DSL 스캐폴드 + Wrapper 생성, `TossApplication`.
2. `AuthControllerTest` 부터 작성(실패하는 테스트) → 각 인수 조건 성공/실패 케이스.
3. DTO `record` 4종 + 예외 2종 + `ErrorResponse`/`FieldErrorItem`.
4. `UserRepository`(시드), `AuthService`, `AuthController`, `ApiExceptionHandler` 구현.
5. `application.yml` Jackson UTC 설정.
6. `./gradlew clean build` 녹색 확인.
