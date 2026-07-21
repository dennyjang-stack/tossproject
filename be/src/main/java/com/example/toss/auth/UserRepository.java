package com.example.toss.auth;

import java.util.Optional;
import org.springframework.stereotype.Repository;

/**
 * 인메모리 시드 계정 저장소. 외부 DB 없이 하드코딩된 계정 1개만 보관한다.
 */
@Repository
public class UserRepository {

	private static final SeedUser SEED_USER =
			new SeedUser("user@toss.local", "toss1234!", "토스사용자");

	public Optional<SeedUser> findByEmail(String email) {
		if (SEED_USER.email().equalsIgnoreCase(email)) {
			return Optional.of(SEED_USER);
		}
		return Optional.empty();
	}
}
