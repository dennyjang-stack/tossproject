package com.example.toss.auth;

/**
 * 로그인 시 이메일/비밀번호가 시드 계정과 일치하지 않을 때 발생한다. (401 신호)
 */
public class InvalidCredentialsException extends RuntimeException {

	public InvalidCredentialsException() {
		super("이메일 또는 비밀번호가 올바르지 않습니다.");
	}
}
