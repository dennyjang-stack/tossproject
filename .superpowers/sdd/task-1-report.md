# 구현 작업 1 보고서

## 완료 내용

- `POST /api/login`의 세션 쿠키가 `HttpOnly`가 되도록 `be/src/main/resources/application.yml`에 `server.servlet.session.cookie.http-only: true`를 명시했다.
- `be/src/test/java/com/example/toss/auth/AuthControllerTest.java`에 해당 설정을 고정하는 실패 테스트를 먼저 추가한 뒤, 설정을 반영해 통과시켰다.
- `TRD.md`의 재생성용 체크박스를 구현 상태에 맞게 모두 `[x]`로 갱신했다.
- `IMPROVEMENTS.md`의 테스트 수치와 검증 근거를 최신 상태인 14개 테스트 기준으로 정리했다.

## 검증

- `cd be && ./gradlew test --tests com.example.toss.auth.AuthControllerTest.세션쿠키_HttpOnly_명시설정`
- `cd be && ./gradlew clean build`

둘 다 성공했다.

## 참고

- 전체 웹 계층 테스트 수: 14개
- 실패 없이 통과: `tests="14" skipped="0" failures="0" errors="0"`
- 변경 범위: `be/`와 루프 문서만 수정했다.
