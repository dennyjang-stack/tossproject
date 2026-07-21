# DESIGN — 토스 로그인 백엔드 (Spring Boot 인증 API)

> 사이클 1 · design 페이즈 산출물. 대응 TRD = `TRD.md`.
> **`be/`만 다룬다. `fe/`는 건드리지 않는다.** 프론트 없이 MockMvc 테스트로 검증을 완결한다.

## 1. 이번 사이클 범위

TRD의 인수 조건 전체가 "세션 로그인 API 3종 + 공통 에러 처리"라는 하나의 응집된 묶음이다.
현재 구현은 기본 흐름을 이미 갖추고 있으므로 구조를 다시 만들지 않는다. 이번 사이클은 **재생성된
(trd-regen) TRD**에 맞춰 강화된 인수 조건을 충족·검증하는 것이 목표다. 재생성에서 바뀐 핵심은
다음과 같으며, 설계도 이를 우선 반영한다.

- **인수 조건 7 (timestamp 정규식)** — 직전 교차검증에서 유일한 `fail`. TRD 정규식이 초(`ss`)
  그룹을 빠뜨려 `Instant.now().toString()`의 실제 출력(초 항상 포함)과 불일치했고, 테스트는 다른
  정규식으로 우회하고 있었다. 재생성 TRD는 초를 포함한
  `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$`로 고쳤고, **TRD의 정규식과 테스트 정규식 상수가
  글자 단위로 동일**해야 함을 명시했다. 설계의 핵심 불변식으로 이 동일성을 고정한다(§5·§8).
- **인수 조건 1·3·4** — 검증 방법과 경계 케이스를 더 엄격히 요구한다: HttpOnly 프로퍼티를
  `@WebMvcTest`로 직접 검증, `errors[]`의 `field` 정확 일치·동시 오류 시 두 필드 항목, me 401의 두
  경계(세션 없음 / 세션은 있으나 로그인 속성 없음)를 각각 별도 테스트.

범위(하나의 응집 묶음):

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
  문자열 필드에 담아 초를 포함한 `2026-07-21T09:00:00.123Z` 형태를 확정한다(`Instant`의 문자열화는
  초를 항상 포함하고, 나노초가 있으면 소수부가 붙는다). `application.yml`의
  `spring.jackson.serialization.write-dates-as-timestamps: false`와 `spring.jackson.time-zone: UTC`도
  전역 날짜 직렬화 정책으로 유지한다.
- **정규식 동일성 불변식**: 테스트가 검증에 쓰는 정규식 상수는 TRD 인수 조건 7의
  `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$`와 **글자 단위로 동일**해야 한다. 초 그룹(`:\d{2}`)을
  빠뜨리거나 TRD와 다른 정규식으로 우회하지 않는다. implement 페이즈에서 이 상수를 TRD 문구에서
  그대로 옮겨 적는다.

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
| G | `timestamp`가 초 포함 ISO-8601 UTC 문자열, **TRD 정규식과 테스트 정규식 상수가 글자 단위 동일** | `Instant.now().toString()`으로 생성(초 항상 포함) | TRD와 동일한 `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$` 상수로 매칭시켜 숫자 epoch·비 UTC 오프셋·초 누락 우회를 배제. 400·401 두 응답 모두에서 확인 |
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
7. **정규식 동일성 불변식(재생성 반영)** — 교차검증에서 드러난 우회(TRD는 초 없는 정규식, 테스트는
   초 있는 정규식)를 재발하지 않도록, TRD 인수 조건 7의 정규식과 테스트의 정규식 상수를 글자 단위로
   동일하게 유지한다. `Instant.now().toString()`이 초를 항상 포함하므로 정규식도 초 그룹을 반드시
   포함한다. 이 불변식 덕분에 "TRD가 문자 그대로 요구한 조건"과 "테스트가 실제 검증하는 것"이 어긋나지
   않는다.

## 9. 테스트 전략 요약

- 프레임워크: JUnit 5 + AssertJ, 웹 계층 `@WebMvcTest` + `MockMvc`. **테스트 먼저 작성**(implement 페이즈).
- 기존 테스트를 먼저 강화해 새 TRD와의 차이가 실패로 드러나는지 확인한 뒤 설정을 최소 수정한다.
- 경계 입력은 잘못된 이메일 형식, 이메일 공백, 비밀번호 공백을 각각 독립 테스트한다.
- 세션 오류는 세션 없음과 세션은 있으나 `LOGIN_USER` 속성이 없는 경우를 각각 테스트한다.
- 응답의 "정확히"는 기대 필드 값뿐 아니라 최상위 필드 개수까지 검사해 여분 필드 회귀를 막는다.
- 세션 시나리오: 로그인 성공 응답의 세션을 재사용해 me 200 → logout 204 → me 401 로 이어지는 흐름을 별도 테스트로도 확인.
- 프론트·통합 실행은 이 루프 범위 밖. 별도 통합 실행 테스트를 추가하지 않는다.

## 10. 다음 페이즈(implement)로 넘기는 작업 목록

현재 구현·테스트는 직전 세대의 기본 흐름을 이미 갖추고 있다. 재생성 TRD 대비 **점검·고정**이 핵심이며,
새로 만들 구조는 없다.

1. **정규식 동일성 확인(최우선)** — `AuthControllerTest`의 `ISO_8601_UTC_REGEX` 상수가 TRD 인수
   조건 7의 `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$`와 글자 단위로 동일한지 확인한다. 다르면
   TRD 문구를 정본으로 삼아 테스트 상수를 맞춘다. 400·401 두 응답 모두에서 이 정규식 매칭을 검증한다.
2. **HttpOnly 명시 설정 검증** — `application.yml`의 `server.servlet.session.cookie.http-only: true`가
   존재하고, `Environment` 프로퍼티가 `"true"`임을 확인하는 `@WebMvcTest`가 있는지 점검한다.
3. **경계 케이스 테스트 존재 확인** — (a) 세션 없음 401, (b) 세션은 있으나 로그인 속성 없음 401을
   각각 별도 테스트로 검증한다(현재 (a)는 있으나 (b) 전용 테스트가 없으면 추가). 이메일 공백·비밀번호
   공백, 이메일+비밀번호 동시 오류 시 `errors[]`에 두 필드가 모두 담기는지, 로그아웃 세션 유무 두 경우
   204 빈 본문을 각각 확인한다.
4. **정확한 응답 형태** — 로그인 200은 `name` 키 하나, me 200은 `email`·`name` 두 키만인지(여분 필드
   회귀 방지) 확인한다. 자격 오류 2종·입력 오류에서 공통 에러 4필드와 `status`=HTTP 코드, `errors`
   배열, `message` 비어 있지 않음을 검증한다.
5. `git diff --name-only main...HEAD`와 `git status --porcelain`에서 `fe/` 변경이 없음을 확인한다.
6. `./gradlew clean build`를 새로 실행해 테스트 실패 없이 `BUILD SUCCESSFUL`·종료 코드 0인지 확인한다.
