package xyz.wondang.friendlog.post.dto;

import java.time.LocalDateTime;
import xyz.wondang.friendlog.member.dto.AuthorResponse;
import xyz.wondang.friendlog.post.Post;

// 메인 목록의 카드 하나. 본문(content)은 무거워서 목록에는 넣지 않는다.
public record PostSummaryResponse(
        Long id,
        String title,
        String summary,
        String thumbnailUrl,
        LocalDateTime eventAt,
        Double averageScore, // 평가가 없으면 null
        boolean ratedByMe,
        AuthorResponse author
) {
    public static PostSummaryResponse of(Post post, Double averageScore, boolean ratedByMe) {
        return new PostSummaryResponse(
                post.getId(),
                post.getTitle(),
                post.getSummary(),
                post.getThumbnailUrl(),
                post.getEventAt(),
                averageScore,
                ratedByMe,
                AuthorResponse.from(post.getMember())
        );
    }
}
