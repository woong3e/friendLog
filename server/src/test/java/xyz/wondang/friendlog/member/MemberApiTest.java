package xyz.wondang.friendlog.member;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;
import xyz.wondang.friendlog.IntegrationTest;

class MemberApiTest extends IntegrationTest {

    @Autowired MemberRepository memberRepository;

    Member me;

    @BeforeEach
    void setUp() {
        me = new Member("me@test.com", "hash", "원래닉");
        me.changeAvatarUrl("https://img/old.webp");
        memberRepository.save(me);
    }

    private ResultActions patchMe(String body) throws Exception {
        return mockMvc.perform(patch("/members/me")
                .header("Authorization", bearer(me))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body));
    }

    @Test
    void 닉네임만_보내면_닉네임만_바뀐다() throws Exception {
        patchMe("""
                { "nickname": "새닉" }
                """)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nickname").value("새닉"))
                .andExpect(jsonPath("$.avatarUrl").value("https://img/old.webp"));
    }

    @Test
    void 아바타에_null을_보내면_삭제된다() throws Exception {
        patchMe("""
                { "avatarUrl": null }
                """)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nickname").value("원래닉"))
                .andExpect(jsonPath("$.avatarUrl").doesNotExist());
    }

    @Test
    void 아바타를_바꾼다() throws Exception {
        patchMe("""
                { "avatarUrl": "https://img/new.webp" }
                """)
                .andExpect(jsonPath("$.avatarUrl").value("https://img/new.webp"));
    }

    @Test
    void 빈_닉네임이나_너무_긴_닉네임은_400() throws Exception {
        patchMe("{ \"nickname\": \"\" }").andExpect(status().isBadRequest());
        patchMe("{ \"nickname\": \"" + "가".repeat(31) + "\" }").andExpect(status().isBadRequest());
        patchMe("{ \"nickname\": null }").andExpect(status().isBadRequest()); // 닉네임은 지울 수 없음
    }
}
