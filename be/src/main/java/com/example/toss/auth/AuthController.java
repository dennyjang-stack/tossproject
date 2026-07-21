package com.example.toss.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/login")
	public ResponseEntity<LoginResponse> login(
			@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
		SeedUser user = authService.authenticate(loginRequest.email(), loginRequest.password());
		authService.login(request, user);
		return ResponseEntity.ok(new LoginResponse(user.name()));
	}

	@GetMapping("/me")
	public ResponseEntity<MeResponse> me(HttpServletRequest request) {
		HttpSession session = request.getSession(false);
		return ResponseEntity.ok(authService.currentUser(session));
	}

	@PostMapping("/logout")
	public ResponseEntity<Void> logout(HttpServletRequest request) {
		HttpSession session = request.getSession(false);
		if (session != null) {
			session.invalidate();
		}
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}
}
