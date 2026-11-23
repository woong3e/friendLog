package xyz.wondang.friendlog.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import jakarta.persistence.EntityManager;
import jakarta.servlet.http.Cookie;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MvcResult;
import xyz.wondang.friendlog.IntegrationTest;
import xyz.wondang.friendlog.member.Member;
import xyz.wondang.friendlog.member.MemberRepository;

class AuthApiTest extends IntegrationTest {

    @Autowired MemberRepository memberRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired EntityManager em;

    // ---------- 회원가입 ----------

    @Test
    void 가입을_신청하면_메일로_받은_코드로_인증하고_바로_로그인된다() throws Exception {
        signup("new@test.com");
        String code = lastMailedCode("new@test.com");

        MvcResult result = mockMvc.perform(post("/auth/signup/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "email": "new@test.com", "code": "%s" }
                                """.formatted(code)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.member.email").value("new@test.com"))
                .andExpect(jsonPath("$.member.nickname").value("새친구"))
                .andExpect(cookie().exists("refresh_token"))
                .andExpect(cookie().httpOnly("refresh_token", true))
                .andReturn();

        String accessToken = JsonPath.read(result.getResponse().getContentAsString(), "$.accessToken");
        mockMvc.perform(get("/members/me").header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("new@test.com"));

        Member member = memberRepository.findByEmail("new@test.com").orElseThrow();
        assertThat(member.getPassword()).isNotEqualTo("password123").startsWith("$2"); // bcrypt 해시로 저장
    }

    @Test
    void 이미_가입된_이메일은_409() throws Exception {
        memberRepository.save(new Member("dup@test.com", "hash", "기존"));

        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(signupBody("dup@test.com")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("EMAIL_DUPLICATED"));
        verify(mailSender, never()).send(org.mockito.ArgumentMatchers.any(SimpleMailMessage.class));
    }

    @Test
    void 코드는_60초가_지나야_다시_받을_수_있다() throws Exception {
        signup("cool@test.com");

        mockMvc.perform(post("/auth/signup/resend")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "email": "cool@test.com" }
                                """))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("TOO_MANY_REQUESTS"));
    }

    @Test
    void 만료된_코드는_400() throws Exception {
        signup("late@test.com");
        String code = lastMailedCode("late@test.com");
        // 벌크 update는 영속성 컨텍스트를 거치지 않고 DB에 바로 간다.
        // 그래서 clear()로 1차 캐시를 비우지 않으면, 서비스가 캐시에 남은 "만료 전" 객체를 읽는다.
        em.flush();
        em.createQuery("update SignupVerification v set v.expiresAt = :past where v.email = :email")
                .setParameter("past", java.time.LocalDateTime.now().minusMinutes(1))
                .setParameter("email", "late@test.com")
                .executeUpdate();
        em.clear();

        verifyCode("late@test.com", code)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VERIFICATION_CODE_EXPIRED"));
    }

    @Test
    void 가입_입력값_검증() throws Exception {
        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "email": "not-an-email", "password": "short", "nickname": "" }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.length()").value(3));
    }

    // ---------- 로그인 ----------

    @Test
    void 이메일과_비밀번호로_로그인한다() throws Exception {
        saveMember("login@test.com", "password123");

        login("login@test.com", "password123")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(cookie().exists("refresh_token"));
    }

    @Test
    void 비밀번호가_틀리거나_없는_이메일이면_같은_401() throws Exception {
        saveMember("login@test.com", "password123");

        login("login@test.com", "wrong-password")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
        login("nobody@test.com", "password123")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
    }

    // ---------- 토큰 ----------

    @Test
    void 리프레시_토큰은_한_번_쓰면_새것으로_바뀐다() throws Exception {
        saveMember("r@test.com", "password123");
        Cookie first = login("r@test.com", "password123").andReturn().getResponse().getCookie("refresh_token");

        Cookie second = mockMvc.perform(post("/auth/refresh").cookie(first))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andReturn().getResponse().getCookie("refresh_token");
        assertThat(second.getValue()).isNotEqualTo(first.getValue());

        // 이미 쓴 토큰은 다시 못 쓴다
        mockMvc.perform(post("/auth/refresh").cookie(first))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_REFRESH_TOKEN"));
        // 새 토큰은 된다
        mockMvc.perform(post("/auth/refresh").cookie(second))
                .andExpect(status().isOk());
    }

    @Test
    void 로그아웃하면_리프레시_토큰을_쓸_수_없다() throws Exception {
        saveMember("out@test.com", "password123");
        Cookie refresh = login("out@test.com", "password123").andReturn().getResponse().getCookie("refresh_token");

        mockMvc.perform(post("/auth/logout").cookie(refresh))
                .andExpect(status().isNoContent())
                .andExpect(cookie().maxAge("refresh_token", 0));
        mockMvc.perform(post("/auth/refresh").cookie(refresh))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void 토큰이_없거나_틀리면_401() throws Exception {
        mockMvc.perform(get("/posts"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
        mockMvc.perform(get("/members/me").header("Authorization", "Bearer not-a-jwt"))
                .andExpect(status().isUnauthorized());
    }

    // ---------- 도우미 ----------

    private void signup(String email) throws Exception {
        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(signupBody(email)))
                .andExpect(status().isAccepted());
    }

    private static String signupBody(String email) {
        return """
                { "email": "%s", "password": "password123", "nickname": "새친구" }
                """.formatted(email);
    }

    private org.springframework.test.web.servlet.ResultActions verifyCode(String email, String code) throws Exception {
        return mockMvc.perform(post("/auth/signup/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        { "email": "%s", "code": "%s" }
                        """.formatted(email, code)));
    }

    private org.springframework.test.web.servlet.ResultActions login(String email, String password) throws Exception {
        return mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        { "email": "%s", "password": "%s" }
                        """.formatted(email, password)));
    }

    private void saveMember(String email, String rawPassword) {
        memberRepository.save(new Member(email, passwordEncoder.encode(rawPassword), "회원"));
    }

    // 가짜 메일 발송기에 넘어간 메일에서 6자리 코드를 꺼낸다
    private String lastMailedCode(String to) {
        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender, org.mockito.Mockito.atLeastOnce()).send(captor.capture());
        SimpleMailMessage mail = captor.getValue();
        assertThat(mail.getTo()).containsExactly(to);
        Matcher m = Pattern.compile("\\b(\\d{6})\\b").matcher(mail.getText());
        assertThat(m.find()).isTrue();
        return m.group(1);
    }
}
