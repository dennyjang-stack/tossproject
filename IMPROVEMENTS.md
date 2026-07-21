# Improvements & findings

_Appended by VERIFY and EVALUATE. Checked off ("- [x]") by IMPLEMENT._
_Open items use "- [ ]". Empty Open list + green verify is the signal to create DONE._

## Open

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
