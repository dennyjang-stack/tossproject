package com.example.toss.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.toss.common.ApiExceptionHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.core.env.Environment;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

/**
 * TRD 인수 조건 A~G를 검증하는 웹 계층 테스트.
 * 세션은 {@link MockHttpSession}과 요청 간 세션 재사용으로 로그인→me→logout 흐름을 확인한다.
 */
@WebMvcTest(AuthController.class)
@Import({AuthService.class, UserRepository.class, ApiExceptionHandler.class})
class AuthControllerTest {

	private static final String SEED_EMAIL = "user@toss.local";
	private static final String SEED_PASSWORD = "toss1234!";
	private static final String SEED_NAME = "토스사용자";
	private static final String ISO_8601_UTC_REGEX =
			"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?Z$";

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private Environment environment;

	// ---------- A. 로그인 성공 ----------

	@Test
	@DisplayName("A-성공: 시드 계정으로 로그인하면 200과 이름, HttpOnly 세션 쿠키를 반환한다")
	void 로그인_성공() throws Exception {
		MvcResult result = mockMvc.perform(post("/api/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(new LoginRequest(SEED_EMAIL, SEED_PASSWORD))))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.name").value(SEED_NAME))
				.andReturn();

		MockHttpSession session = (MockHttpSession) result.getRequest().getSession(false);
		assertThat(session).isNotNull();
		assertThat(session.isNew()).isTrue();
		assertThat(session.getAttribute(AuthService.SESSION_USER))
				.isEqualTo(new MeResponse(SEED_EMAIL, SEED_NAME));
	}

	@Test
	@DisplayName("A-형태: 로그인 성공 응답은 다른 키 없이 name 하나만 갖는다")
	void 로그인_성공_응답필드_하나뿐() throws Exception {
		mockMvc.perform(post("/api/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(new LoginRequest(SEED_EMAIL, SEED_PASSWORD))))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$").value(org.hamcrest.Matchers.aMapWithSize(1)));
	}

	@Test
	@DisplayName("A-설정: 세션 쿠키의 HttpOnly 설정이 명시적으로 true다")
	void 세션쿠키_HttpOnly_명시설정() {
		assertThat(environment.getProperty("server.servlet.session.cookie.http-only"))
				.isEqualTo("true");
	}

	// ---------- B. 자격 불일치 ----------

	@Test
	@DisplayName("B-실패: 비밀번호가 틀리면 401과 공통 에러 형태를 반환한다")
	void 로그인_비밀번호_불일치() throws Exception {
		mockMvc.perform(post("/api/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(new LoginRequest(SEED_EMAIL, "wrongPassword1!"))))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.status").value(401))
				.andExpect(jsonPath("$.message").value("이메일 또는 비밀번호가 올바르지 않습니다."))
				.andExpect(jsonPath("$.errors").isArray())
				.andExpect(jsonPath("$.errors").isEmpty())
				.andExpect(jsonPath("$.timestamp").value(org.hamcrest.Matchers.matchesPattern(ISO_8601_UTC_REGEX)));
	}

	@Test
	@DisplayName("B-실패: 존재하지 않는 이메일이면 401과 공통 에러 형태를 반환한다")
	void 로그인_존재하지않는_이메일() throws Exception {
		mockMvc.perform(post("/api/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(
								new LoginRequest("nobody@toss.local", SEED_PASSWORD))))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.status").value(401))
				.andExpect(jsonPath("$.message").value("이메일 또는 비밀번호가 올바르지 않습니다."))
				.andExpect(jsonPath("$.errors").isArray())
				.andExpect(jsonPath("$.errors").isEmpty())
				.andExpect(jsonPath("$.timestamp").value(org.hamcrest.Matchers.matchesPattern(ISO_8601_UTC_REGEX)));
	}

	// ---------- C. 형식 오류 ----------

	@Test
	@DisplayName("C-실패: 이메일 형식이 올바르지 않으면 400과 email 필드 오류를 반환한다")
	void 로그인_이메일_형식_오류() throws Exception {
		mockMvc.perform(post("/api/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(
								new LoginRequest("not-an-email", SEED_PASSWORD))))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.errors[*].field", org.hamcrest.Matchers.hasItem("email")))
				.andExpect(jsonPath("$.timestamp").value(org.hamcrest.Matchers.matchesPattern(ISO_8601_UTC_REGEX)));
	}

	@Test
	@DisplayName("C-실패: 비밀번호가 공백이면 400과 password 필드 오류를 반환한다")
	void 로그인_비밀번호_공백() throws Exception {
		mockMvc.perform(post("/api/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(new LoginRequest(SEED_EMAIL, "  "))))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.errors[*].field", org.hamcrest.Matchers.hasItem("password")));
	}

	@Test
	@DisplayName("C-실패: 이메일과 비밀번호가 동시에 잘못되면 errors에 두 필드 항목이 모두 담긴다")
	void 로그인_이메일_비밀번호_동시_형식오류() throws Exception {
		mockMvc.perform(post("/api/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(new LoginRequest("not-an-email", "  "))))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.errors[*].field",
						org.hamcrest.Matchers.containsInAnyOrder("email", "password")))
				.andExpect(jsonPath("$.errors[*].message",
						org.hamcrest.Matchers.everyItem(org.hamcrest.Matchers.not(
								org.hamcrest.Matchers.emptyOrNullString()))));
	}

	@Test
	@DisplayName("C-성공: 형식이 올바르면 400 대신 정상 로그인 흐름을 탄다")
	void 로그인_형식_올바름_성공쌍() throws Exception {
		mockMvc.perform(post("/api/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(new LoginRequest(SEED_EMAIL, SEED_PASSWORD))))
				.andExpect(status().isOk());
	}

	// ---------- D. me ----------

	@Test
	@DisplayName("D-성공: 로그인 세션이 있으면 me는 200과 이메일·이름을 반환한다")
	void me_세션있음() throws Exception {
		MockHttpSession session = loginAndGetSession();

		mockMvc.perform(get("/api/me").session(session))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.email").value(SEED_EMAIL))
				.andExpect(jsonPath("$.name").value(SEED_NAME))
				.andExpect(jsonPath("$").value(org.hamcrest.Matchers.aMapWithSize(2)));
	}

	@Test
	@DisplayName("D-실패(경계a): 세션 쿠키 자체가 없으면 me는 401을 반환한다")
	void me_세션없음() throws Exception {
		mockMvc.perform(get("/api/me"))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.status").value(401))
				.andExpect(jsonPath("$.message").value("로그인이 필요합니다."))
				.andExpect(jsonPath("$.errors").isEmpty());
	}

	@Test
	@DisplayName("D-실패(경계b): 세션은 있으나 로그인 사용자 속성이 없으면 me는 401을 반환한다")
	void me_세션있으나_로그인속성없음() throws Exception {
		MockHttpSession sessionWithoutLoginAttribute = new MockHttpSession();

		mockMvc.perform(get("/api/me").session(sessionWithoutLoginAttribute))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.status").value(401))
				.andExpect(jsonPath("$.message").value("로그인이 필요합니다."))
				.andExpect(jsonPath("$.errors").isEmpty());
	}

	// ---------- E. logout ----------

	@Test
	@DisplayName("E-성공: 로그아웃하면 204를 반환하고 세션을 무효화해 이후 me는 401이 된다")
	void 로그아웃_성공_이후_me_401() throws Exception {
		MockHttpSession session = loginAndGetSession();

		mockMvc.perform(post("/api/logout").session(session))
				.andExpect(status().isNoContent());

		assertThat(session.isInvalid()).isTrue();

		mockMvc.perform(get("/api/me").session(session))
				.andExpect(status().isUnauthorized());
	}

	@Test
	@DisplayName("E-실패쪽: 세션이 없는 상태로 로그아웃해도 204를 반환한다")
	void 로그아웃_세션없어도_204() throws Exception {
		mockMvc.perform(post("/api/logout"))
				.andExpect(status().isNoContent());
	}

	// ---------- F. 공통 에러 형태 ----------

	@Test
	@DisplayName("F: 400 에러 응답은 timestamp,status,message,errors 필드를 모두 갖고 status가 400과 일치한다")
	void 에러형태_400() throws Exception {
		mockMvc.perform(post("/api/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(new LoginRequest("bad-email", ""))))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.timestamp").exists())
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.message").exists())
				.andExpect(jsonPath("$.errors").isArray());
	}

	@Test
	@DisplayName("F: 401 에러 응답은 timestamp,status,message,errors 필드를 모두 갖고 status가 401과 일치한다")
	void 에러형태_401() throws Exception {
		mockMvc.perform(get("/api/me"))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.timestamp").exists())
				.andExpect(jsonPath("$.status").value(401))
				.andExpect(jsonPath("$.message").exists())
				.andExpect(jsonPath("$.errors").isArray());
	}

	// ---------- G. timestamp ISO-8601 UTC ----------

	@Test
	@DisplayName("G: 에러 응답의 timestamp는 ISO-8601(UTC) 문자열 형태다")
	void timestamp_ISO8601_UTC() throws Exception {
		mockMvc.perform(get("/api/me"))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.timestamp").value(org.hamcrest.Matchers.matchesPattern(ISO_8601_UTC_REGEX)));
	}

	private MockHttpSession loginAndGetSession() throws Exception {
		MvcResult result = mockMvc.perform(post("/api/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(new LoginRequest(SEED_EMAIL, SEED_PASSWORD))))
				.andExpect(status().isOk())
				.andReturn();
		return (MockHttpSession) result.getRequest().getSession(false);
	}
}
