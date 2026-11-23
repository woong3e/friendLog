package xyz.wondang.friendlog.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import xyz.wondang.friendlog.IntegrationTest;

/**
 * 틀린 횟수 제한이 "요청과 요청 사이에" 실제로 쌓이는지 확인한다.
 *
 * 다른 테스트처럼 테스트 전체를 트랜잭션 하나로 묶으면, 서비스가 롤백하든 말든 같은 트랜잭션 안에서
 * 값이 보여서 noRollbackFor가 빠져도 테스트가 통과해 버린다.
 * 그래서 여기서는 트랜잭션을 끄고(NOT_SUPPORTED) 요청마다 실제로 커밋·롤백되게 한 뒤, 끝나고 직접 지운다.
 */
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class VerificationAttemptsTest extends IntegrationTest {

    @Autowired JdbcTemplate jdbcTemplate;

    @AfterEach
    void cleanUp() {
        jdbcTemplate.update("delete from signup_verification where email = 'try@test.com'");
    }

    @Test
    void 코드를_5번_틀리면_맞는_코드도_거절하고_재발급을_요구한다() throws Exception {
        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "email": "try@test.com", "password": "password123", "nickname": "시도" }
                                """))
                .andExpect(status().isAccepted());
        String realCode = jdbcTemplate.queryForObject(
                "select code from signup_verification where email = 'try@test.com'", String.class);
        String wrongCode = realCode.equals("000000") ? "111111" : "000000";

        for (int i = 1; i <= 4; i++) {
            verify(wrongCode)
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("INVALID_VERIFICATION_CODE"));
        }
        verify(wrongCode)
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("VERIFICATION_ATTEMPTS_EXCEEDED"));
        verify(realCode)
                .andExpect(status().isTooManyRequests());
    }

    private org.springframework.test.web.servlet.ResultActions verify(String code) throws Exception {
        return mockMvc.perform(post("/auth/signup/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        { "email": "try@test.com", "code": "%s" }
                        """.formatted(code)));
    }
}
