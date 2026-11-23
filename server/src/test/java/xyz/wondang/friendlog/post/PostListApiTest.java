package xyz.wondang.friendlog.post;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import xyz.wondang.friendlog.IntegrationTest;
import xyz.wondang.friendlog.member.Member;
import xyz.wondang.friendlog.member.MemberRepository;
import xyz.wondang.friendlog.rating.Rating;
import xyz.wondang.friendlog.rating.RatingRepository;

class PostListApiTest extends IntegrationTest {

    @Autowired MemberRepository memberRepository;
    @Autowired PostRepository postRepository;
    @Autowired RatingRepository ratingRepository;
    @Autowired EntityManager em;

    Member a;
    Member b;
    Post jan;   // 평균 3.0
    Post feb;   // 평균 5.0
    Post mar;   // 평가 없음

    @BeforeEach
    void setUp() {
        a = memberRepository.save(new Member("a@test.com", "hash", "에이"));
        b = memberRepository.save(new Member("b@test.com", "hash", "비"));

        jan = postRepository.save(new Post(a, "1월 모임", "본문", null, null, LocalDateTime.of(2025, 1, 25, 12, 0)));
        feb = postRepository.save(new Post(b, "2월 모임", "본문", null, null, LocalDateTime.of(2025, 2, 22, 12, 0)));
        mar = postRepository.save(new Post(a, "3월 모임", "본문", null, null, LocalDateTime.of(2025, 3, 29, 12, 0)));

        ratingRepository.save(new Rating(jan, a, new BigDecimal("2.0"), null));
        ratingRepository.save(new Rating(jan, b, new BigDecimal("4.0"), null));
        ratingRepository.save(new Rating(feb, a, new BigDecimal("5.0"), "최고"));

        em.flush();
        em.clear();
    }

    @Test
    void 기본은_모임_최신순() throws Exception {
        mockMvc.perform(get("/posts").header("Authorization", bearer(a)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].title", contains("3월 모임", "2월 모임", "1월 모임")))
                .andExpect(jsonPath("$.hasNext").value(false));
    }

    @Test
    void 오래된순() throws Exception {
        mockMvc.perform(get("/posts").header("Authorization", bearer(a)).param("sort", "oldest"))
                .andExpect(jsonPath("$.content[*].title", contains("1월 모임", "2월 모임", "3월 모임")));
    }

    @Test
    void 평점_높은순_평가없는_글은_맨_뒤() throws Exception {
        mockMvc.perform(get("/posts").header("Authorization", bearer(a)).param("sort", "rating_high"))
                .andExpect(jsonPath("$.content[*].title", contains("2월 모임", "1월 모임", "3월 모임")))
                .andExpect(jsonPath("$.content[0].averageScore").value(5.0))
                .andExpect(jsonPath("$.content[1].averageScore").value(3.0))
                .andExpect(jsonPath("$.content[2].averageScore").doesNotExist());
    }

    @Test
    void 평점_낮은순_평가없는_글은_맨_뒤() throws Exception {
        mockMvc.perform(get("/posts").header("Authorization", bearer(a)).param("sort", "rating_low"))
                .andExpect(jsonPath("$.content[*].title", contains("1월 모임", "2월 모임", "3월 모임")));
    }

    @Test
    void 페이지를_나누고_다음_페이지_여부를_알려준다() throws Exception {
        mockMvc.perform(get("/posts").header("Authorization", bearer(a)).param("size", "2"))
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.hasNext").value(true));

        mockMvc.perform(get("/posts").header("Authorization", bearer(a)).param("size", "2").param("page", "1"))
                .andExpect(jsonPath("$.content[*].title", contains("1월 모임")))
                .andExpect(jsonPath("$.hasNext").value(false));
    }

    @Test
    void 작성자와_내가_평가했는지를_함께_준다() throws Exception {
        mockMvc.perform(get("/posts").header("Authorization", bearer(b)))
                .andExpect(jsonPath("$.content[*].author.nickname", contains("에이", "비", "에이")))
                .andExpect(jsonPath("$.content[*].ratedByMe", contains(false, false, true)));
    }

    @Test
    void 모르는_정렬값이나_잘못된_size는_400() throws Exception {
        mockMvc.perform(get("/posts").header("Authorization", bearer(a)).param("sort", "popular"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(get("/posts").header("Authorization", bearer(a)).param("size", "0"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void 글이_많아도_쿼리는_3번() throws Exception {
        for (int i = 0; i < 10; i++) {
            Member m = memberRepository.save(new Member("m" + i + "@test.com", "hash", "회원" + i));
            postRepository.save(new Post(m, "글" + i, "본문", null, null, LocalDateTime.of(2024, 1, 1, 0, 0).plusDays(i)));
        }
        em.flush();
        em.clear();

        Statistics stats = em.getEntityManagerFactory().unwrap(SessionFactory.class).getStatistics();
        stats.setStatisticsEnabled(true);
        stats.clear();

        mockMvc.perform(get("/posts").param("size", "8").header("Authorization", bearer(a)))
                .andExpect(jsonPath("$.content", hasSize(8)));

        // 1) id+평균  2) 글+작성자  3) 내가 평가한 글. 작성자가 8명이어도 늘어나지 않는다
        assertThat(stats.getPrepareStatementCount()).isEqualTo(3);
        stats.setStatisticsEnabled(false);
    }
}
