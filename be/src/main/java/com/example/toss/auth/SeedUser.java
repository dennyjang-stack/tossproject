package com.example.toss.auth;

/**
 * 인메모리 시드 계정의 내부 표현. 비밀번호를 포함하므로 세션에는 절대 직접 저장하지 않는다.
 */
public record SeedUser(String email, String password, String name) {
}
