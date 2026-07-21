package com.example.toss.common;

import java.time.Instant;
import java.util.List;

/**
 * 모든 API 에러 응답의 공통 형태. {@code timestamp}는 ISO-8601(UTC) 문자열이다.
 */
public record ErrorResponse(String timestamp, int status, String message, List<FieldErrorItem> errors) {

	public static ErrorResponse of(int status, String message, List<FieldErrorItem> errors) {
		return new ErrorResponse(Instant.now().toString(), status, message, errors);
	}
}
