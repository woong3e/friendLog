package xyz.wondang.friendlog.post.dto;

import java.time.LocalDateTime;
import java.util.List;
import xyz.wondang.friendlog.member.dto.AuthorResponse;
import xyz.wondang.friendlog.post.Post;

// GET /posts/{id} 응답. 엔티티를 그대로 내보내지 않고 응답 전용 객체로 바꾼다.
public record PostDetailResponse(
        Long id,
        String title,
        String content,
        String summary,
        String thumbnailUrl,
        LocalDateTime eventAt,
        List<String> imageUrls,
        AuthorResponse author,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static PostDetailResponse from(Post post) {
        return new PostDetailResponse(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getSummary(),
                post.getThumbnailUrl(),
                post.getEventAt(),
                post.getImageUrls(),
                AuthorResponse.from(post.getMember()),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}
