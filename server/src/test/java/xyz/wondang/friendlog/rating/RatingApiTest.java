package xyz.wondang.friendlog.rating;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;
import xyz.wondang.friendlog.IntegrationTest;
import xyz.wondang.friendlog.member.Member;
import xyz.wondang.friendlog.member.MemberRepository;
import xyz.wondang.friendlog.post.Post;
import xyz.wondang.friendlog.post.PostRepository;

class RatingApiTest extends IntegrationTest {

    @Autowired MemberRepository memberRepository;
    @Autowired PostRepository postRepository;
    @Autowired RatingRepository ratingRepository;

    Member writer;
    Member friend;
    Post post;

    @BeforeEach
    void setUp() {
        writer = memberRepository.save(new Member("w@test.com", "hash", "작성자"));
        friend = memberRepository.save(new Member("f@test.com", "hash", "친구"));
        post = postRepository.save(new Post(writer, "모임", "본문", null, null, LocalDateTime.of(2025, 8, 30, 18, 0)));
    }

    private ResultActions rate(Member member, String body) throws Exception {
        return mockMvc.perform(put("/posts/{id}/ratings/me", post.getId())
                .header("Authorization", bearer(member))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body));
    }

    @Test
    void 평가를_등록하고_다시_보내면_같은_평가가_수정된다() throws Exception {
        rate(friend, """
                { "score": 4.5, "comment": "재밌었다" }
                """)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").value(4.5))
                .andExpect(jsonPath("$.author.nickname").value("친구"));

        rate(friend, """
                { "score": 3.0, "comment": "다시 생각해보니" }
                """)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").value(3.0))
                .andExpect(jsonPath("$.comment").value("다시 생각해보니"));

        assertThat(ratingRepository.count()).isEqualTo(1);
    }

    @Test
    void 별점은_0_5부터_5_0까지_0_5_단위() throws Exception {
        for (String bad : new String[]{"0", "5.5", "4.3", "null"}) {
            rate(friend, "{ \"score\": " + bad + " }")
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("INVALID_INPUT"));
        }
        rate(friend, "{ \"score\": 0.5 }").andExpect(status().isOk());
        rate(friend, "{ \"score\": 5 }").andExpect(status().isOk());
    }

    @Test
    void 한줄평_목록은_최신순이고_작성자_정보를_담는다() throws Exception {
        rate(writer, "{ \"score\": 5.0, \"comment\": \"먼저\" }");
        rate(friend, "{ \"score\": 4.0, \"comment\": \"나중\" }");

        mockMvc.perform(get("/posts/{id}/ratings", post.getId()).header("Authorization", bearer(writer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].comment", contains("나중", "먼저")))
                .andExpect(jsonPath("$[*].author.nickname", contains("친구", "작성자")));
    }

    @Test
    void 평균과_분포() throws Exception {
        rate(writer, "{ \"score\": 5.0 }");
        rate(friend, "{ \"score\": 4.0 }");
        Member third = memberRepository.save(new Member("t@test.com", "hash", "셋째"));
        rate(third, "{ \"score\": 4.0 }");

        mockMvc.perform(get("/posts/{id}/ratings/summary", post.getId()).header("Authorization", bearer(writer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(3))
                .andExpect(jsonPath("$.average").value(org.hamcrest.Matchers.closeTo(4.333, 0.001)))
                // [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]
                .andExpect(jsonPath("$.distribution", contains(0, 0, 0, 0, 0, 0, 0, 2, 0, 1)));
    }

    @Test
    void 평가가_없으면_평균은_null() throws Exception {
        mockMvc.perform(get("/posts/{id}/ratings/summary", post.getId()).header("Authorization", bearer(writer)))
                .andExpect(jsonPath("$.count").value(0))
                .andExpect(jsonPath("$.average").doesNotExist());
    }

    @Test
    void 평가하면_목록의_평균과_ratedByMe에_반영된다() throws Exception {
        rate(friend, "{ \"score\": 4.0 }");

        mockMvc.perform(get("/posts").header("Authorization", bearer(friend)))
                .andExpect(jsonPath("$.content[0].averageScore").value(4.0))
                .andExpect(jsonPath("$.content[0].ratedByMe").value(true));
    }

    @Test
    void 없는_글이면_404() throws Exception {
        mockMvc.perform(put("/posts/{id}/ratings/me", 999_999)
                        .header("Authorization", bearer(friend))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"score\": 4.0 }"))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/posts/{id}/ratings", 999_999).header("Authorization", bearer(friend)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("POST_NOT_FOUND"));
    }

    @Test
    void 평가가_있는_글도_삭제된다() throws Exception {
        rate(friend, "{ \"score\": 4.0 }");

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .delete("/posts/{id}", post.getId()).header("Authorization", bearer(writer)))
                .andExpect(status().isNoContent());
        assertThat(ratingRepository.count()).isZero();
    }
}
