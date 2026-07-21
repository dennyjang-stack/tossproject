package com.example.toss.common;

import com.example.toss.auth.InvalidCredentialsException;
import com.example.toss.auth.UnauthorizedException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 모든 예외를 한 곳에서 공통 {@link ErrorResponse} 형태로 변환한다.
 * 컨트롤러는 예외를 던지기만 하고 try/catch를 하지 않는다.
 */
@RestControllerAdvice
public class ApiExceptionHandler {

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
		List<FieldErrorItem> errors = ex.getBindingResult().getFieldErrors().stream()
				.map(fieldError -> new FieldErrorItem(fieldError.getField(), fieldError.getDefaultMessage()))
				.toList();
		return build(HttpStatus.BAD_REQUEST, "입력값이 올바르지 않습니다.", errors);
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<ErrorResponse> handleNotReadable(HttpMessageNotReadableException ex) {
		return build(HttpStatus.BAD_REQUEST, "요청 본문을 읽을 수 없습니다.", List.of());
	}

	@ExceptionHandler(InvalidCredentialsException.class)
	public ResponseEntity<ErrorResponse> handleInvalidCredentials(InvalidCredentialsException ex) {
		return build(HttpStatus.UNAUTHORIZED, ex.getMessage(), List.of());
	}

	@ExceptionHandler(UnauthorizedException.class)
	public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedException ex) {
		return build(HttpStatus.UNAUTHORIZED, ex.getMessage(), List.of());
	}

	private ResponseEntity<ErrorResponse> build(HttpStatus status, String message, List<FieldErrorItem> errors) {
		return ResponseEntity.status(status).body(ErrorResponse.of(status.value(), message, errors));
	}
}
