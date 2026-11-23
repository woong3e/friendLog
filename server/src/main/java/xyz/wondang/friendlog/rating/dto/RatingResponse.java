package xyz.wondang.friendlog.rating.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import xyz.wondang.friendlog.member.dto.AuthorResponse;
import xyz.wondang.friendlog.rating.Rating;

public record RatingResponse(
        Long id,
        BigDecimal score,
        String comment,
        AuthorResponse author,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static RatingResponse from(Rating rating) {
        return new RatingResponse(
                rating.getId(),
                rating.getScore(),
                rating.getComment(),
                AuthorResponse.from(rating.getMember()),
                rating.getCreatedAt(),
                rating.getUpdatedAt());
    }
}
