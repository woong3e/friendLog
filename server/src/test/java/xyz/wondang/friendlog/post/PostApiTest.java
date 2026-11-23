package xyz.wondang.friendlog.post;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import xyz.wondang.friendlog.IntegrationTest;
import xyz.wondang.friendlog.member.Member;
import xyz.wondang.friendlog.member.MemberRepository;

class PostApiTest extends IntegrationTest {

    @Autowired
    MemberRepository memberRepository;

    @Autowired
    EntityManager em;

    Member writer;
    Member other;

    @BeforeEach
    void setUp() {
        writer = memberRepository.save(new Member("writer@test.com", "hash", "작성자"));
        other = memberRepository.save(new Member("other@test.com", "hash", "다른사람"));
    }

    private static final String BODY = """
            {
              "title": "독서 퀴즈",
              "content": "### 주제: 지리의 힘",
              "summary": "독서 퀴즈",
              "thumbnailUrl": "https://img/thumb.webp",
              "eventAt": "2025-08-30T18:00:00",
              "imageUrls": ["https://img/a.webp", "https://img/b.webp"]
            }
            """;

    private Long createPost() throws Exception {
        String response = mockMvc.perform(post("/posts")
                        .header("Authorization", bearer(writer))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(BODY))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(response, "$.id")).longValue();
    }

    // 1차 캐시(영속성 컨텍스트)를 비워서, 다음 조회가 실제 DB에서 읽히게 한다
    private void flushAndClear() {
        em.flush();
        em.clear();
    }

    @Test
    void 글을_등록하고_조회한다() throws Exception {
        Long id = createPost();
        flushAndClear();

        mockMvc.perform(get("/posts/{id}", id).header("Authorization", bearer(writer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("독서 퀴즈"))
                .andExpect(jsonPath("$.eventAt").value("2025-08-30T18:00:00"))
                .andExpect(jsonPath("$.imageUrls", containsInAnyOrder("https://img/a.webp", "https://img/b.webp")))
                .andExpect(jsonPath("$.author.nickname").value("작성자"))
                .andExpect(jsonPath("$.createdAt").exists());
    }

    @Test
    void 등록하면_Location_헤더에_새_글_주소를_준다() throws Exception {
        mockMvc.perform(post("/posts")
                        .header("Authorization", bearer(writer))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(BODY))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", org.hamcrest.Matchers.startsWith("/posts/")));
    }

    @Test
    void 작성자는_글을_수정하고_이미지_목록이_새_목록으로_바뀐다() throws Exception {
        Long id = createPost();
        flushAndClear();

        mockMvc.perform(put("/posts/{id}", id)
                        .header("Authorization", bearer(writer))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "수정된 제목",
                                  "content": "수정된 본문",
                                  "eventAt": "2025-08-31T11:00:00",
                                  "imageUrls": ["https://img/b.webp", "https://img/c.webp"]
                                }
                                """))
                .andExpect(status().isNoContent());
        flushAndClear();

        mockMvc.perform(get("/posts/{id}", id).header("Authorization", bearer(writer)))
                .andExpect(jsonPath("$.title").value("수정된 제목"))
                .andExpect(jsonPath("$.summary").doesNotExist())
                .andExpect(jsonPath("$.imageUrls", containsInAnyOrder("https://img/b.webp", "https://img/c.webp")));
    }

    @Test
    void 작성자가_아니면_수정할_수_없다() throws Exception {
        Long id = createPost();

        mockMvc.perform(put("/posts/{id}", id)
                        .header("Authorization", bearer(other))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(BODY))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("POST_FORBIDDEN"));
    }

    @Test
    void 작성자는_글을_삭제한다() throws Exception {
        Long id = createPost();
        flushAndClear();

        mockMvc.perform(delete("/posts/{id}", id).header("Authorization", bearer(writer)))
                .andExpect(status().isNoContent());
        flushAndClear();

        mockMvc.perform(get("/posts/{id}", id).header("Authorization", bearer(writer)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("POST_NOT_FOUND"));
        Long imageCount = em.createQuery("select count(i) from PostImage i", Long.class).getSingleResult();
        assertThat(imageCount).isZero();
    }

    @Test
    void 작성자가_아니면_삭제할_수_없다() throws Exception {
        Long id = createPost();

        mockMvc.perform(delete("/posts/{id}", id).header("Authorization", bearer(other)))
                .andExpect(status().isForbidden());
    }

    @Test
    void 없는_글은_404() throws Exception {
        mockMvc.perform(get("/posts/{id}", 999_999).header("Authorization", bearer(writer)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("POST_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("게시글을 찾을 수 없습니다."));
    }

    @Test
    void 필수값이_없으면_어떤_필드가_틀렸는지_알려준다() throws Exception {
        mockMvc.perform(post("/posts")
                        .header("Authorization", bearer(writer))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "title": "", "content": "본문" }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT"))
                .andExpect(jsonPath("$.errors", hasSize(2)))
                .andExpect(jsonPath("$.errors[*].field", containsInAnyOrder("title", "eventAt")));
    }

    @Test
    void 날짜_형식이_틀리면_400() throws Exception {
        mockMvc.perform(post("/posts")
                        .header("Authorization", bearer(writer))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "title": "a", "content": "b", "eventAt": "2025/08/30" }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT"));
    }
}
