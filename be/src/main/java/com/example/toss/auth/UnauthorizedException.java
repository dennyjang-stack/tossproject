package com.example.toss.auth;

/**
 * 로그인이 필요한 요청에 유효한 세션이 없을 때 발생한다. (401 신호)
 */
public class UnauthorizedException extends RuntimeException {

	public UnauthorizedException() {
		super("로그인이 필요합니다.");
	}
}
