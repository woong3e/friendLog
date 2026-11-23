package xyz.wondang.friendlog.image;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.endsWith;
import static org.hamcrest.Matchers.startsWith;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.persistence.EntityManager;
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

class ImageApiTest extends IntegrationTest {

    private static final String BASE = "http://localhost:9090/friendlog/";

    @Autowired MemberRepository memberRepository;
    @Autowired PostRepository postRepository;
    @Autowired UploadedImageRepository uploadedImageRepository;
    @Autowired ImageService imageService;
    @Autowired EntityManager em;

    Member member;

    @BeforeEach
    void setUp() {
        member = memberRepository.save(new Member("img@test.com", "hash", "사진"));
    }

    private ResultActions requestUrl(String body) throws Exception {
        return mockMvc.perform(post("/images/presigned-url")
                .header("Authorization", bearer(member))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body));
    }

    // ---------- Presigned URL ----------

    @Test
    void 업로드용_서명된_URL과_저장할_이미지_주소를_준다() throws Exception {
        requestUrl("""
                { "folder": "thumbnail", "contentType": "image/webp" }
                """)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.uploadUrl", allOf(
                        startsWith(BASE + "thumbnail/"),
                        containsString("X-Amz-Signature="),
                        containsString("X-Amz-Expires=300"))))
                .andExpect(jsonPath("$.imageUrl", allOf(startsWith(BASE + "thumbnail/"), endsWith(".webp"))));

        assertThat(uploadedImageRepository.count()).isEqualTo(1);
    }

    @Test
    void jpeg는_jpg_확장자로() throws Exception {
        requestUrl("""
                { "folder": "content", "contentType": "image/jpeg" }
                """)
                .andExpect(jsonPath("$.imageUrl", endsWith(".jpg")));
    }

    @Test
    void 허용하지_않는_위치나_형식은_400() throws Exception {
        requestUrl("{ \"folder\": \"etc\", \"contentType\": \"image/webp\" }").andExpect(status().isBadRequest());
        requestUrl("{ \"folder\": \"avatar\", \"contentType\": \"text/html\" }").andExpect(status().isBadRequest());
        requestUrl("{ \"folder\": \"avatar\", \"contentType\": \"image/svg+xml\" }").andExpect(status().isBadRequest());
    }

    @Test
    void 로그인하지_않으면_401() throws Exception {
        mockMvc.perform(post("/images/presigned-url")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"folder\": \"avatar\", \"contentType\": \"image/webp\" }"))
                .andExpect(status().isUnauthorized());
    }

    // ---------- 정리 ----------

    @Test
    void 오래됐고_어디에도_쓰이지_않는_이미지만_지운다() {
        doNothing().when(imageStorage).delete(anyString());

        UploadedImage unused = upload("content/unused.webp");
        UploadedImage thumbnail = upload("thumbnail/used.webp");
        UploadedImage contentImage = upload("content/used.webp");
        UploadedImage avatar = upload("avatar/used.webp");
        UploadedImage fresh = upload("content/fresh.webp");

        Post post = new Post(member, "글", "본문", null, thumbnail.getUrl(), LocalDateTime.now());
        post.addImage(contentImage.getUrl());
        postRepository.save(post);
        member.changeAvatarUrl(avatar.getUrl());

        makeOld(unused, thumbnail, contentImage, avatar); // fresh만 최근 업로드

        int deleted = imageService.cleanupUnused(LocalDateTime.now());

        assertThat(deleted).isEqualTo(1);
        verify(imageStorage).delete("content/unused.webp");
        verify(imageStorage, never()).delete("thumbnail/used.webp");
        verify(imageStorage, never()).delete("content/fresh.webp");
        assertThat(uploadedImageRepository.findAll())
                .extracting(UploadedImage::getObjectKey)
                .containsExactlyInAnyOrder("thumbnail/used.webp", "content/used.webp", "avatar/used.webp", "content/fresh.webp");
    }

    @Test
    void S3_삭제가_실패하면_기록을_남겨_다음에_다시_시도한다() {
        doThrow(new RuntimeException("S3 장애")).when(imageStorage).delete(anyString());
        UploadedImage unused = upload("content/retry.webp");
        makeOld(unused);

        int deleted = imageService.cleanupUnused(LocalDateTime.now());

        assertThat(deleted).isZero();
        assertThat(uploadedImageRepository.count()).isEqualTo(1);
    }

    private UploadedImage upload(String key) {
        return uploadedImageRepository.save(new UploadedImage(member.getId(), key, BASE + key));
    }

    // 업로드 시각은 Auditing이 현재 시각으로 채우므로, 정리 대상이 되도록 이틀 전으로 바꾼다
    private void makeOld(UploadedImage... images) {
        em.flush();
        for (UploadedImage image : images) {
            em.createQuery("update UploadedImage u set u.createdAt = :old where u.id = :id")
                    .setParameter("old", LocalDateTime.now().minusDays(2))
                    .setParameter("id", image.getId())
                    .executeUpdate();
        }
        em.clear();
    }
}
