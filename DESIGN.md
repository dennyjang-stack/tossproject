# 토스 스타일 로그인 프론트엔드 기술 설계

## 1. 문서 목적과 사이클 1 범위(재기준 세대)

이 문서는 재생성된 TRD의 프론트엔드 인수 조건 전체를 build 페이즈에서 한 번에 충족하기 위한
기술 설계다. 로그인, 인증 확인, 로그아웃은 하나의 사용자 여정이고 계약 스텁은 그 여정의
실행 기반이므로 쪼개지 않는다. 구현 범위는 `fe/` Next.js 애플리케이션, 계약 스텁 3개,
반응형 로그인·홈 UI, 실백엔드 전환 설정과 검증까지다. `be/`, 회원가입, 외부 인증, 배포와
단위 테스트 도구 도입은 제외한다.

이번 세대의 TRD는 교차검증 정합성(13개 전 항목 pass) 뒤 재생성되며 조건 문구가 더 정밀해졌다.
설계상 대응해야 할 강화점은 네 가지다.

1. **로그아웃 세션 무효화가 독립 인수 조건으로 승격**됐다. 로그아웃 뒤 동일 세션 쿠키를
   재전송한 `GET /api/me`가 반드시 401이어야 한다. 이는 5절의 "스텁 세션 무효화"(서버 측
   활성 세션 레지스트리)로 충족하며, `npm run verify:stub`의 재전송 검사가 회귀를 잡는다.
2. **계약 검사가 응답의 존재 여부를 넘어 정확한 구조를 요구**한다. 성공·로그아웃 쿠키의
   `Path=/`·`HttpOnly`·`SameSite=Lax`·`Max-Age=0`, 오류의 정확한 최상위 키와 필드 오류 키,
   UTC `Z` timestamp를 `verify:stub`에서 독립적으로 단언한다.
3. **브라우저 증거의 격리성과 히스토리 검사가 강화**됐고, 오류 판정 문구가 정밀해졌다. 현재
   체크아웃의 새 서버와 고유 세션을 사용하고, 성공 뒤 뒤로가기로 `/login`에 복귀하지 않는지를
   확인한다. 오류 판정 기준은 `browser_errors`(업케치 JS 예외·페이지 오류) **0건**과 Next.js 오류
   오버레이 부재이며, 경계 입력(400·401)을 검증하는 과정에서 스텁이 의도적으로 반환한 4xx에 대해
   브라우저가 남기는 "Failed to load resource" 네트워크 로그는 정상 동작이라 실패로 보지 않는다.
   포트가 점유된 경우 기존 프로세스는 건드리거나 재사용하지 않는다.
4. **DESIGN.md 관찰 기록에 구체 색값**(`#3182f6`·`#191f28`·`#4e5968`)과 구현 버튼 계산값
   (`rgb(49,130,246)`) 일치가 요구된다. 2절이 이 값을 이미 담고 있고, 구현의 `.primary-button`
   배경이 그 값과 일치함을 verify에서 계산 스타일로 확인한다.
5. **400 필드 오류에 경계 기대가 추가**됐다. 형식 오류 이메일(`bad-email`) 제출 시 이메일 필드에만
   메시지가 나타나고 `#password-error`는 비어 있어야 한다. 6절 로그인 상태 머신의 필드 매핑이 이를
   보장한다.

이번 세대의 계약 스텁·검증 스크립트(`scripts/verify-stub.mjs`)·두 화면 UI는 위 강화 조건을 이미
충족하는 상태로 이 워크트리에 존재한다. 교차검증 정합성에서 13개 인수 조건이 모두 재현·통과했고,
`verify-stub.mjs`는 정확한 오류 키(`assertExactKeys`)·UTC `Z`(`assertUtcTimestamp`)·쿠키 속성
전체와 로그아웃 `Max-Age=0`(`assertCookieAttributes`)·세션 재전송 거부를 이미 단언한다. 따라서
이번 build의 범위는 **재생성된 TRD(정밀화된 11·6번 포함)와 현 구현·검증의 정합을 확인·유지**하는
것이며, 재검증이 실제 불일치를 드러낼 때만 해당 파일을 최소 수정한다. `npm run dev:fresh`는 먼저
`:3000` 사용 가능 여부를 확인하고, 점유 중이면 기존 프로세스를 종료·덮어쓰지 않고 종료 코드 1과
재현 가능한 한국어 안내로 안전하게 실패한다. 포트가 비어 있을 때만 스텁 모드 새 서버를 `.next-dev`로
띄워 `npm run build`의 `.next` 산출물과 충돌하지 않게 한다.

## 2. toss.im 관찰 결과와 재현 원칙

2026-07-21 design 페이즈에 agent-browser로 `https://toss.im/`을 다시 열고 1280×720과
360×800 뷰포트에서 접근성 스냅샷, 스크린샷, 읽기 전용 계산 스타일 조회를 실행했다.
스냅샷에서 내비게이션, 히어로 제목, 앱 다운로드 링크의 의미 구조를 확인하고 계산 스타일로
다음 값을 교차 확인했다. 스크린샷은 검증용 임시 경로에만 두며 저장소에는 포함하지 않는다.

- 데스크톱 첫 화면은 흰 내비게이션과 아주 옅은 청회색 히어로 배경, 큰 이미지 영역, 넉넉한
  여백을 사용한다. 모바일은 60px 높이의 헤더와 콘텐츠 중심의 단순한 한 열 구성을 쓴다.
- 기본 본문은 16px/400이고 짙은 본문색은 `rgb(33, 37, 41)`이다. 주요 제목은
  `rgb(25, 31, 40)`(`#191f28`), 700 굵기와 여유 있는 행간을 사용한다.
- 보조 내비게이션 텍스트는 `rgb(78, 89, 104)`(`#4e5968`)이며, 강조 파랑은
  `rgb(49, 130, 246)`(`#3182f6`)이다.
- 헤더의 파란 "앱 다운로드" 액션은 계산값 `rgb(49, 130, 246)`, 12px/600, 15px 모서리이고,
  히어로의 어두운 스토어 액션은 17px/600, 7px 모서리다. 흰색에 가까운 글자색은
  `rgb(249, 250, 251)`이다. 로그인 화면은 헤더 액션의 파랑과 넉넉한 터치 높이를 결합한다.
- 360px 화면의 첫 제목은 33px/700, `rgb(25, 31, 40)`, 46.2px 행간이며 문구가 여러 줄로
  자연스럽게 흐른다. 문서 너비는 뷰포트와 같은 360px로 가로 스크롤이 없다.
- 원본의 전용 글꼴과 이미지·로고는 복제하지 않는다. 로컬 시스템 글꼴 스택과 색, 굵기,
  여백, 버튼의 촉감만 재현해 독립 서비스라는 경계를 지킨다.

로그인 화면에는 위 관찰을 다음처럼 번역한다. 페이지 배경은 `#f2f4f6`, 카드와 입력 배경은
흰색, 기본 글자는 `#191f28`, 보조 글자는 `#4e5968`, 프라이머리는 `#3182f6`, hover는
`#1b64da`, 경계선은 `#e5e8eb`을 사용한다. 카드 최대 너비는 420px, 모서리는 24px,
데스크톱 안쪽 여백은 32px이다. 입력과 버튼은 최소 52px 높이와 12px 모서리를 가져
터치하기 쉽게 한다. 제목은 28px/700, 본문과 필드는 15~16px을 기본으로 한다.

## 3. 설계 대안과 결정

### 검토한 대안

1. **클라이언트 인증 화면 + 동일 출처 Route Handler**: 로그인과 홈이 상대 경로 API를
   `fetch`하고 클라이언트에서 이동한다. 스텁과 실백엔드의 전환이 투명하고
   `router.replace` 요구를 그대로 만족한다.
2. **서버 컴포넌트에서 홈 인증 선조회**: 첫 화면 깜빡임은 줄지만 서버 컴포넌트가 요청 쿠키를
   직접 전달하고 API 절대 주소까지 조립해야 한다. 상대 경로만 호출한다는 규칙과 스텁/실서버
   이중 실행을 불필요하게 복잡하게 만든다.
3. **Next.js middleware에서 쿠키 존재만 검사**: 빠른 리다이렉트는 가능하지만 단순 쿠키 존재를
   인증으로 오인하며 `/api/me`가 세션의 권위라는 원칙을 약화한다.

1안을 채택한다. 홈은 로딩 상태에서 `GET /api/me`의 판정을 기다리고, 401일 때만
`router.replace('/login')`한다. 따라서 인증 여부의 단일 판정자는 API이며 쿠키를 UI에서
해석하지 않는다. 네트워크 오류는 로그인으로 오인해 보내지 않고 현재 화면에 재시도 가능한
오류로 표시한다.

스타일은 전역 CSS 한 파일을 채택한다. 화면이 두 개이고 디자인 토큰을 공유하므로 CSS Modules를
나누는 것보다 `globals.css`의 짧고 명시적인 클래스가 중복을 줄인다. UI·상태관리 라이브러리는
도입하지 않는다.

## 4. 목표 파일과 컴포넌트

```text
fe/
├── app/
│   ├── api/
│   │   ├── login/route.ts
│   │   ├── logout/route.ts
│   │   └── me/route.ts
│   ├── login/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── api-types.ts
│   └── stub-auth.ts
├── next.config.js
├── next-env.d.ts
├── package-lock.json
├── package.json
└── tsconfig.json
```

- `layout.tsx`: 한국어 메타데이터, 전역 CSS, 문서 언어만 담당하는 서버 컴포넌트다.
- `login/page.tsx`: `'use client'` 컴포넌트다. 입력값, 필드 오류, 폼 오류, 제출 중 상태만
  보유하고 `POST /api/login` 성공 후 `router.replace('/')`를 호출한다.
- `page.tsx`: `'use client'` 홈이다. 마운트 시 `GET /api/me`를 호출해 로딩·인증·오류 상태를
  구분한다. 인증 성공 시 이름과 이메일, 로그아웃 버튼을 보여준다.
- `api-types.ts`: `LoginSuccess`, `MeResponse`, `ErrorResponse`, `FieldError` 타입만 둔다.
  런타임 의존성이나 상태는 두지 않는다.
- `stub-auth.ts`: 시드 계정, 쿠키 이름, 세션 식별자 발급·검증·무효화, 오류 응답 생성기,
  로그인 입력 검증을 모은다.
  각 Route Handler는 HTTP 처리만 맡아 계약 문구와 검증이 흩어지지 않게 한다.
- 세 Route Handler는 스텁의 실행 가능한 계약 사본이다. UI와 공유하는 것은 응답 타입뿐이며,
  UI가 시드 비밀번호나 쿠키 값을 가져오지 않는다.

`package.json`에는 `dev`, `build`, `start` 스크립트와 Next.js 14+, React, TypeScript 및 필요한
타입 패키지만 둔다. `tsconfig.json`은 `strict: true`를 명시한다.

## 5. API 계약의 실행 설계

### 공통 응답

모든 오류는 아래 구조이고 `timestamp`는 응답 생성 시점의 `new Date().toISOString()`으로 만든다.

```ts
type ErrorResponse = {
  timestamp: string;
  status: number;
  message: string;
  errors: Array<{ field: string; message: string }>;
};
```

오류 객체는 위 네 키만 만들고 각 필드 오류도 `field`·`message` 두 키만 만든다.
`new Date().toISOString()`은 UTC를 나타내는 `Z`로 끝나므로 검증에서는 문자열 파싱 가능 여부와
`Z` 접미사를 함께 단언한다.

스텁 세션 쿠키 이름은 `toss_session`이고 값은 `crypto.randomUUID()`로 발급한 비결정적 식별자다.
로그인 성공 응답에서 `Path=/`, `HttpOnly`, `SameSite=Lax`를 설정하고 유효 기간을 생략해 브라우저
세션 쿠키로 만든다. 운영 모드에서만 `Secure`를 추가한다. 이는 보안 세션 구현이 아니라 프론트의
계약 자립 검증용 모사이며, 실제 모드에서는 Next rewrite가 Spring HttpSession 쿠키를 전달한다.

### `POST /api/login`

JSON 본문을 `{ email, password }`로 읽는다. JSON이 아니거나 객체가 아니면 400을 반환한다.
문자열 입력은 다음 순서로 검증하며 모든 필드 오류를 한 번에 수집한다.

- `email`이 없거나 trim 결과가 비면 `{field: "email", message: "이메일을 입력해 주세요."}`
- 비어 있지 않지만 일반적인 이메일 패턴에 맞지 않으면
  `{field: "email", message: "올바른 이메일 형식이 아닙니다."}`
- `password`가 없거나 trim 결과가 비면
  `{field: "password", message: "비밀번호를 입력해 주세요."}`

400의 최상위 메시지는 `요청 값이 올바르지 않습니다.`다. 검증 통과 뒤 email은 trim한 값,
password는 원문 그대로 `user@toss.local` / `toss1234!`와 비교한다. 불일치하면 401,
메시지 `이메일 또는 비밀번호가 올바르지 않습니다.`, 빈 `errors`를 반환한다. 일치하면 200
`{"name":"토스사용자"}`와 HttpOnly 쿠키를 반환한다.

### `GET /api/me`

쿠키 이름과 값이 모두 맞으면 200
`{"email":"user@toss.local","name":"토스사용자"}`를 반환한다. 그 외에는 401,
메시지 `로그인이 필요합니다.`, 빈 `errors`를 반환한다.

### `POST /api/logout`

인증 여부와 관계없이 쿠키에 빈 값, `Max-Age=0`, `HttpOnly`, `SameSite=Lax`, `Path=/`를
설정하고 본문 없는 204를 반환한다. 반복 호출도 같은 결과를 내므로 멱등적이다.

### 스텁 세션 무효화

기존 구현의 취약점은 쿠키 값이 고정된 문자열이라 로그아웃 뒤에도 같은 값을 다시 보내면
`GET /api/me`가 200을 반환한다는 점이었다. 이번 구현에서는 이 동작을 서버 측 세션
레지스트리로 바꿨다.

- 로그인 성공 시 `toss_session` 쿠키에 고정 문자열 대신 비결정적 세션 식별자를 발급한다.
- 식별자는 인메모리 활성 세션 집합에 저장하고, `GET /api/me`는 쿠키 값이 집합에 남아 있을
  때만 200을 반환한다.
- `POST /api/logout`은 현재 쿠키를 집합에서 제거하고, 같은 값의 쿠키를 재전송해도 401이
  되도록 만든다.
- 구현은 여전히 단일 프로세스 인메모리여야 하며, 외부 저장소·DB·JWT는 도입하지 않는다.

### 실백엔드 전환

`next.config.js`의 `rewrites()`는 `process.env.NEXT_PUBLIC_API_MODE === 'real'`일 때만
`/api/:path*`를 `http://localhost:8080/api/:path*`로 보낸다. 그 외에는 빈 배열을 반환해
Route Handler를 사용한다. 화면 코드는 모드 분기나 호스트 문자열 없이 항상 `/api/login`,
`/api/me`, `/api/logout`만 호출하고, 세 요청 모두 `credentials: 'same-origin'`을 명시한다.

## 6. 사용자 흐름과 상태

### 로그인

1. 사용자가 이메일과 비밀번호를 입력하고 제출한다. 브라우저 기본 검증 대신 `noValidate`를
   사용해 400 계약 응답이 필드 오류의 권위가 되게 한다.
2. 기존 오류를 지우고 제출 버튼을 비활성화한 뒤 `/api/login`에 JSON을 보낸다.
3. 200이면 `router.replace('/')`한다. 홈이 이어서 `/api/me`를 조회하므로 로그인 응답의 이름은
   화면 상태로 중복 보관하지 않는다.
4. 400이면 `errors[]`를 `email`, `password`별로 매핑해 각 입력 바로 아래에 표시한다.
5. 401이면 최상위 `message`를 버튼 위 `role="alert"` 영역에 표시한다.
6. 예기치 않은 상태, 파싱 실패, 네트워크 오류는 `잠시 후 다시 시도해 주세요.`로 표시한다.
   모든 종료 경로에서 제출 가능 상태로 복구한다.

각 입력은 화면에 보이는 `<label>`과 연결하고 오류가 있으면 `aria-invalid`와
`aria-describedby`를 부여한다. 이메일은 `type="email"`, `autoComplete="username"`,
비밀번호는 `type="password"`, `autoComplete="current-password"`를 사용한다. 제출 중 버튼
문구는 `로그인 중...`으로 바꿔 중복 요청을 막는다.

### 홈과 로그아웃

1. 홈 진입 직후 중립적인 `로그인 정보를 확인하고 있어요.` 상태를 보여주고 `/api/me`를 호출한다.
2. 200이면 `토스사용자님, 반가워요`와 이메일을 표시한다. 응답이 늦게 돌아온 뒤 언마운트된
   컴포넌트 상태를 바꾸지 않도록 effect cleanup 플래그를 둔다.
3. 401이면 `router.replace('/login')`한다. 미인증 상태로 연 보호 대상 `/`을 브라우저
   히스토리에 남기지 않는다.
4. 그 밖의 오류는 홈 카드 안에 오류와 `다시 시도` 버튼을 보여준다.
5. 로그아웃 버튼은 중복 클릭을 막고 `/api/logout`의 204를 확인한 뒤
   `router.replace('/login')`한다. 실패하면 홈을 유지하고 인라인 오류를 표시한다.

로그인 페이지에서 이미 인증된 사용자를 자동으로 홈으로 보내는 동작은 TRD 범위에 없으므로
추가하지 않는다. 이 선택은 불필요한 `/api/me` 요청과 리다이렉트 경합을 피한다.

## 7. 반응형·접근성 설계

- `body`는 최소 높이 `100dvh`이고 카드를 가로·세로 중앙 정렬한다. 페이지 좌우 여백은 20px,
  카드 너비는 `min(100%, 420px)`라서 360px에서도 가로 스크롤이 생기지 않는다.
- 480px 이하에서는 카드 안쪽 여백을 24px, 모서리를 20px로 줄인다. 1280px에서는 카드가
  과도하게 넓어지지 않는다. `box-sizing: border-box`를 전역 적용한다.
- 폰트는 `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Apple SD Gothic Neo`,
  `Malgun Gothic`, sans-serif 순서의 시스템 스택만 사용한다. 외부 CDN, `@font-face`, 원격 이미지,
  토스 로고를 사용하지 않는다.
- 입력과 버튼은 최소 44px 터치 영역을 넘기고, `:focus-visible`에 파란 외곽선을 제공한다.
  오류는 색만이 아니라 텍스트와 ARIA 속성으로 전달하며 동적 메시지는 `aria-live`로 알린다.
- `prefers-reduced-motion: reduce`에서는 전환 효과를 끈다. 장식 애니메이션은 만들지 않는다.

## 8. 검증 전략과 인수 조건 추적

단위 테스트 프레임워크는 추가하지 않는다. build 페이즈 구현 뒤 아래 순서로 계약, 정적 빌드,
실사용 흐름을 검증한다.

아래 표의 13개 행은 재생성된 TRD의 인수 조건 순서와 1:1로 맞춘다.

| TRD 인수 조건 | 설계상 충족 방법 | 검증 방법(기대값) |
|---|---|---|
| toss.im 관찰·구체 색값 기록 | 2절에 MCP 스냅샷·스크린샷과 계산 스타일로 `#3182f6`·`#191f28`·`#4e5968`·카드 여백 기록 | DESIGN.md 2절 검토 + 구현 `.primary-button` 배경 `rgb(49,130,246)` 계산값 확인 |
| 계약 스텁 3개 계약 일치 | 공통 `stub-auth`와 세 Route Handler, 고정 응답 문구·쿠키 정책 | `npm run verify:stub` 종료 0: 400·401·200·204와 응답 값, 성공 쿠키의 `Path=/`·`HttpOnly`·`SameSite=Lax`, 로그아웃 쿠키의 빈 값·동일 속성·`Max-Age=0`, 오류의 정확한 키·UTC `Z` 검사 |
| 로그아웃 세션 무효화 | 5절 활성 세션 레지스트리, 로그아웃 시 식별자 제거 | `npm run verify:stub`의 재전송 검사: 로그아웃 뒤 동일 쿠키의 `GET /api/me`가 401 |
| 미니멀 로그인 폼 | 420px 카드, 시스템 글꼴, 파란 52px 버튼(`#email`/`#password`/"로그인") | agent-browser DOM 조회로 입력·버튼 존재와 버튼 배경 `rgb(49,130,246)` 확인 |
| 성공 `router.replace`·401 인라인 | 로그인 상태 머신의 200/401 분기 | 시드 제출 후 URL `/`·`토스사용자` 표시와 뒤로가기 시 `/login` 미복귀, 틀린 자격 후 `/login` 유지 + 경고 문구 |
| 400 필드 오류 | `noValidate`, `errors[]` 필드 매핑 | 공백 제출 → `#email-error`·`#password-error` 둘 다 채움, `bad-email` → 이메일만 "올바른 이메일 형식이 아닙니다."이고 `#password-error`는 비어 있음 |
| 홈 이름·이메일·로그아웃 | `/api/me` 응답 렌더, 204 뒤 replace | `토스사용자`·`user@toss.local` 표시 후 로그아웃 클릭 → `/login` 확인 |
| 미로그인 홈 차단 | 홈의 최초 `/api/me`, 401 replace | 쿠키 없는 새 컨텍스트로 `/` 열고 `/login` 대체 확인 |
| 360~1280px·외부 자산 없음 | 유동 너비, 480px 미디어 쿼리, 시스템 자산만 사용 | 360·1280px 모두 `scrollWidth === innerWidth`, 소스 검색에서 외부 `http(s)`/`@import`/원격 이미지 부재 |
| real rewrite·상대 경로 | 환경 조건부 rewrite, UI의 상대 URL 상수 | `NEXT_PUBLIC_API_MODE=real`→매핑 반환, 기본→`[]`; UI fetch 모두 `/api/...` |
| 전체 브라우저 흐름 | `dev:fresh` 포트 가드와 스텁 세션 기반 로그인→홈→로그아웃 | 현재 체크아웃의 새 서버·고유 agent-browser 세션에서 400·401·성공·로그아웃 실제 입력/클릭, URL·DOM·API 상태 일치와 Next.js 오류 오버레이 부재·`browser_errors` 0건 확인(경계 입력이 유발한 400·401 "Failed to load resource" 네트워크 로그는 정상이라 제외); 포트 점유 시 기존 프로세스 미접촉과 종료 코드 1의 안전한 실패 기록 |
| `be/` 미수정 | 모든 구현을 `fe/`로 제한 | `git diff --name-only`에서 `be/` 부재 확인 |
| strict 빌드·취약점 0 | 엄격한 TypeScript와 최소 의존성 | `cd fe && npm ci`, `npm audit --omit=dev`, `npm run build` 각각 종료 0; 감사 0건과 `/`·`/login`·API Route 3개 빌드 출력 확인 |

`verify-stub.mjs`에는 다음 단언을 한곳에 모은다.

- `assertExactKeys(value, keys)`: 정렬한 `Object.keys`가 기대 키와 정확히 같은지 검사한다. 오류
  최상위 객체에는 `timestamp`·`status`·`message`·`errors`, 각 필드 오류에는 `field`·`message`만 허용한다.
- `assertUtcTimestamp(value)`: 문자열이고 `Date.parse`가 성공하며 `Z`로 끝나는지 검사한다.
- `assertCookieAttributes(header, logout)`: 쿠키 이름, `Path=/`, `HttpOnly`, `SameSite=Lax`를
  대소문자에 안전하게 확인한다. 로그아웃이면 값이 비었고 `Max-Age=0`인지도 검사한다.

계약 점검 순서는 빈 쿠키의 `/api/me` 401, 공백 입력 400, 잘못된 자격의 `/api/login` 401,
시드 계정 로그인 200과 쿠키 저장, 같은 쿠키의 `/api/me` 200, `/api/logout` 204, 로그아웃 뒤
같은 쿠키를 수동 재전송한 `/api/me` 401이다. 400의 두 필드 오류는 필드명뿐 아니라 정확한
메시지와 객체 키까지 단언하고, 모든 400·401 응답에 공통 오류 검사를 적용한다.

브라우저 검증은 별도 상태에서 현재 체크아웃의 새 `npm run dev:fresh` 인스턴스와 고유 세션을
대상으로 `/` 직접 접근 → `/login` 이동 → 공백·형식·자격 오류 표시 → 시드 계정 로그인 → `/`와
사용자 이름 확인 → 뒤로가기 시 `/login` 미복귀 확인 → 홈 재진입 → 로그아웃 → `/login` → 다시
`/` 접근 시 차단의 단일 여정으로 한다. 각 상태 전환 뒤 새 스냅샷이나 URL·DOM 조회를 남기고,
네트워크 기록에서 400·401·200·204를 확인한다. 1280×720과 360×800에서 계산 스타일과
`scrollWidth === innerWidth`를 확인하고, 마지막에 Next.js 오류 오버레이 부재와 `browser_errors`
(업케치 JS 예외·페이지 오류) 0건을 조회한다. 이때 경계 입력(400·401)을 검증하며 발생한
"Failed to load resource" 네트워크 로그는 스텁이 의도적으로 반환한 상태코드에 대한 정상 기록이므로
실패로 보지 않고, 그 밖의 `console.error`나 애플리케이션 오류가 없는지만 판정한다.

`:3000`이 점유됐다면 `dev:fresh`가 비정상 종료 코드와 한국어 안내로 안전하게 실패하는지만
기록하고, 기존 서버를 종료하거나 이번 체크아웃의 증거로 재사용하지 않는다. 포트가 확보된 환경에서
브라우저 여정을 다시 수행하기 전에는 해당 조건을 통과로 표시하지 않는다. 계약 검사는 같은 새 서버에
`VERIFY_BASE_URL`을 지정한다. 마지막으로 소스 검색을 통해 `http://localhost:8080`이 rewrite
외부에 없고, 외부 `http(s)` 자산과 `be/` 변경이 없는지 확인한다.

## 9. 완료 경계

사이클 1 build가 끝났다고 판단하려면 강화된 `verify:stub`이 정확한 키·UTC `Z`·쿠키 속성·세션
재전송 거부를 모두 자동 검사하고, 세 Route Handler의 모든 계약 분기, 두 화면의 정상·오류 상태,
조건부 rewrite, 반응형 스타일이 구현돼 있어야 한다. 이어지는 verify에서 `npm ci`,
`npm audit --omit=dev`, `npm run build`, 강화된 계약 검사와 고유 agent-browser 세션의 전체 여정이
모두 통과해야 한다. 스텁 세션 식별자는 단일 프로세스 인메모리 계약 모사용이며 실제 인증 보안으로
확장하지 않는다.
# DESIGN — 토스 로그인 백엔드 (Spring Boot 인증 API)

> 사이클 1 · design 페이즈 갱신. 대응 TRD = `TRD.md`(정합성 수렴 후 재생성된 인수 조건 9개, 전부 `- [ ]`).
> **`be/`만 다룬다. `fe/`는 건드리지 않는다.** 프론트 없이 MockMvc 테스트로 검증을 완결한다.

## 0. 사이클 1 상태 요약

직전 교차검증에서 기존 인수 조건 9개는 모두 pass였고, 제품 구현과 17개 `AuthControllerTest`는
기존 계약을 충족했다. 이어진 TRD 재생성은 기능 범위와 조건 수를 유지하면서 검증 증거를 세 곳
강화했다. 현재 구현 동작은 새 조건에도 부합하지만 테스트 소스에는 다음 증거 공백이 있다.

- 공백 이메일만 보낸 400 응답을 독립적으로 검증하는 테스트가 없다.
- 세션 있음·없음 로그아웃 테스트는 204 상태만 확인하고 본문 바이트 길이 0을 직접 단언하지 않는다.
- 400·401 공통 에러 테스트는 필드 존재를 확인하지만 최상위 키가 정확히 4개인지와 `message`가
  비어 있지 않은지를 함께 고정하지 않는다.

따라서 이번 사이클은 **제품 구조와 런타임 코드는 유지하고 테스트 증거만 최소 보강**하는 범위다.
새 테스트가 기존 구현의 실제 불일치를 드러내는 경우에만 해당 제품 코드를 좁게 수정한다.

## 1. 이번 사이클 범위

TRD의 인수 조건 전체가 "세션 로그인 API 3종 + 공통 에러 처리"라는 하나의 응집된 묶음이다.
현재 구현은 이 묶음의 기능을 이미 완성했으므로 구조를 다시 만들지 않는다. 이번 사이클의 설계
목표는 **재생성된 TRD**가 요구하는 더 엄격한 검증 증거를 `AuthControllerTest`에 고정하는 것이다.
재생성에서 강화된 핵심은 다음과 같다.

- **인수 조건 3** — 잘못된 이메일 형식, 공백 이메일, 공백 비밀번호, 두 필드 동시 오류를 각각
  독립 테스트로 둔다. 기존 세 종류에 공백 이메일 전용 케이스를 하나 추가한다.
- **인수 조건 5** — 세션 있음·없음의 두 204 응답에서 응답 본문 바이트 배열 길이가 0인지 직접 단언한다.
- **인수 조건 6** — 400·401 각각의 최상위 객체 크기가 정확히 4이고 `message`가 비어 있지 않은지
  검증한다. 기존 필드 값·타입 단언은 유지한다.
- **인수 조건 7** — 이미 고정된 초 포함 정규식과 테스트 상수의 글자 단위 동일성을 그대로 보존한다.

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
| A | 시드 계정 로그인 → 200 정확한 `{name}` + 세션 생성 + HttpOnly 명시 설정 | 기존 로그인 흐름과 `application.yml`의 `server.servlet.session.cookie.http-only: true` 유지 | 200, `$.name=토스사용자`, 최상위 필드 1개, 새 세션과 `LOGIN_USER` 확인, `Environment` 설정값이 `true`인지 검증 |
| B | 미등록 이메일·틀린 비밀번호 → 각각 401 공통 에러 | `InvalidCredentialsException` → 핸들러 401 | 두 입력을 독립 테스트하고 HTTP 401, `$.status=401`, `$.errors`가 빈 배열인지 모두 검증 |
| C | 잘못된 이메일 형식·이메일 공백·비밀번호 공백 → 각각 400와 필드 오류 | `@Valid` 검증 실패 → 400, `BindingResult`를 `{field,message}`로 매핑 | 세 단일 입력과 두 필드 동시 오류를 네 테스트로 분리하고, 대상 `field`와 비어 있지 않은 `message`를 검증 |
| D | me: 로그인 세션은 정확한 `{email,name}`, 세션/사용자 속성 부재는 401 | 세션의 `LOGIN_USER` 조회, 없으면 `UnauthorizedException` | 성공 응답 최상위 필드 2개와 값을 확인. 세션 자체 없음과 속성 없는 세션을 각각 401 공통 에러로 검증 |
| E | logout: 세션 유무와 무관하게 빈 본문 204, 기존 세션 무효화 | 세션이 있을 때만 `invalidate()`, 항상 204 | 세션 있음/없음 각각 204와 빈 본문 확인. 기존 세션 `isInvalid()` 및 후속 me 401 검증 |
| F | 400·401 모두 정확한 공통 에러 구조 | 알려진 계약 예외를 `ApiExceptionHandler`에서 `ErrorResponse`로 통일 | 각 상태에서 최상위 필드가 정확히 4개인지, `status`와 HTTP 코드가 같은지, `message`가 비어 있지 않은지, `errors`가 배열인지 검증 |
| G | `timestamp`가 초 포함 ISO-8601 UTC 문자열, **TRD 정규식과 테스트 정규식 상수가 글자 단위 동일** | `Instant.now().toString()`으로 생성(초 항상 포함) | TRD와 동일한 `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$` 상수로 매칭시켜 숫자 epoch·비 UTC 오프셋·초 누락 우회를 배제. 400·401 두 응답 모두에서 확인 |
| H | `fe/` 미수정 | 구현 변경을 `be/`와 루프 문서로 제한 | `git diff --name-only main...HEAD`와 `git status --porcelain`에서 `fe/` 경로가 없는지 확인 |
| I | 강화된 요청 행렬 전체를 `@WebMvcTest`로 검증 + `clean build` 0 | 기존 17개에 공백 이메일 전용 테스트 1개를 더하고 기존 테스트의 단언을 강화 | 최소 18개 테스트, 테스트 XML의 failures/errors 0 및 `./gradlew clean build`의 `BUILD SUCCESSFUL`·종료 코드 0 확인 |

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
8. **기존 `AuthControllerTest` 최소 확장** — 선택지는 (a) 기존 테스트 클래스에 케이스·단언 추가,
   (b) 계약별 테스트 클래스 분리, (c) 실제 서버 통합 테스트 추가다. 강화점은 기존 엔드포인트의
   검증 정밀도이고 `@WebMvcTest`가 명시된 판정 수단이므로 (a)를 선택한다. (b)는 작은 테스트 묶음에
   불필요한 구조 변경을 만들고, (c)는 프론트 없이 MockMvc로 완결한다는 범위를 넘어선다.

## 9. 테스트 전략 요약

- 프레임워크: JUnit 5 + AssertJ, 웹 계층 `@WebMvcTest` + `MockMvc`. **테스트 먼저 작성**(implement 페이즈).
- 현재 17개 테스트의 green을 기준선으로 확인한 뒤 테스트를 먼저 수정한다. 공백 이메일 테스트가
  기존 구현에서 즉시 통과하면 기능은 이미 충족된 것으로 보고 제품 코드는 바꾸지 않는다.
- 경계 입력은 잘못된 이메일 형식, 이메일 공백, 비밀번호 공백, 두 필드 동시 오류를 각각 독립 테스트한다.
- 세션 오류는 세션 없음과 세션은 있으나 `LOGIN_USER` 속성이 없는 경우를 각각 테스트한다.
- 응답의 "정확히"는 기대 필드 값뿐 아니라 최상위 필드 개수까지 검사해 여분 필드 회귀를 막는다.
- 로그아웃의 "본문 없음"은 `content().bytes(new byte[0])`처럼 응답 바이트 길이 0을 직접 비교해
  세션 있음·없음 두 테스트 모두에서 고정한다.
- 공통 에러의 `message`는 존재 여부가 아니라 `not(emptyOrNullString())`로 검증하고, 400·401 모두
  `aMapWithSize(4)`로 여분 키가 없음을 단언한다.
- 세션 시나리오: 로그인 성공 응답의 세션을 재사용해 me 200 → logout 204 → me 401 로 이어지는 흐름을 별도 테스트로도 확인.
- 프론트·통합 실행은 이 루프 범위 밖. 별도 통합 실행 테스트를 추가하지 않는다.

## 10. 다음 페이즈(implement)로 넘기는 작업 목록

이번 implement는 인증 API 전체를 한 묶음으로 다루되, 변경 대상은 원칙적으로
`be/src/test/java/com/example/toss/auth/AuthControllerTest.java` 한 파일이다.

1. 현재 `./gradlew test`로 17개 테스트 green 기준선을 확인한다.
2. 공백 이메일만 입력한 로그인 요청이 400을 반환하고 `errors[]`에 `field=email`과 비어 있지 않은
   `message`를 담는 한국어 `@DisplayName` 테스트를 추가한다.
3. 세션 있음·없음 로그아웃 테스트 각각에 빈 바이트 본문 단언을 추가한다.
4. 400·401 공통 에러 테스트 각각에 최상위 객체 크기 4와 비어 있지 않은 `message` 단언을 추가한다.
5. 관련 테스트를 실행한다. 기존 제품 코드로 통과하면 테스트 외 코드는 수정하지 않고, 실패하면
   실패한 계약에 직접 관련된 제품 코드만 최소 수정한다.
6. TRD 정규식과 `ISO_8601_UTC_REGEX`의 글자 단위 동일성, HttpOnly 설정 테스트, 기존 세션 경계
   테스트가 보존됐는지 확인한다. 전체 테스트 수는 최소 18개여야 한다.
7. `git diff --name-only main...HEAD`와 `git status --porcelain`에서 `fe/` 변경이 없음을 확인한다.
8. `be/`에서 `./gradlew clean build`를 새로 실행해 `BUILD SUCCESSFUL`·종료 코드 0과 테스트 XML의
   `failures="0" errors="0"`을 확인한다.
