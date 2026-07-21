package com.example.toss.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Service;

/**
 * 자격 검증과 세션 발급/조회를 담당한다. 세션에 저장하는 값과 속성 키를
 * 이 서비스가 소유해, 컨트롤러는 세션 형식을 직접 다루지 않는다.
 */
@Service
public class AuthService {

	public static final String SESSION_USER = "LOGIN_USER";

	private final UserRepository userRepository;

	public AuthService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	public SeedUser authenticate(String email, String password) {
		return userRepository.findByEmail(email)
				.filter(user -> user.password().equals(password))
				.orElseThrow(InvalidCredentialsException::new);
	}

	public void login(HttpServletRequest request, SeedUser user) {
		HttpSession session = request.getSession(true);
		session.setAttribute(SESSION_USER, new MeResponse(user.email(), user.name()));
	}

	public MeResponse currentUser(HttpSession session) {
		if (session == null) {
			throw new UnauthorizedException();
		}
		Object attribute = session.getAttribute(SESSION_USER);
		if (!(attribute instanceof MeResponse meResponse)) {
			throw new UnauthorizedException();
		}
		return meResponse;
	}
}
