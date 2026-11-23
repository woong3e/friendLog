package xyz.wondang.friendlog.post.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 글 등록(POST)과 수정(PUT)에 같이 쓰는 요청 본문.
 * PUT은 "통째로 교체"라서 등록과 같은 필드를 모두 받는다.
 */
public record PostRequest(
        @NotBlank(message = "제목을 입력해주세요.")
        @Size(max = 100, message = "제목은 100자 이하로 입력해주세요.")
        String title,

        @NotBlank(message = "내용을 입력해주세요.")
        String content,

        @Size(max = 500, message = "요약은 500자 이하로 입력해주세요.")
        String summary,

        @Size(max = 500, message = "썸네일 주소가 너무 깁니다.")
        String thumbnailUrl,

        @NotNull(message = "모임 날짜를 입력해주세요.")
        LocalDateTime eventAt,

        List<@NotBlank @Size(max = 500) String> imageUrls
) {
    // imageUrls를 보내지 않으면 빈 목록으로 취급
    public List<String> imageUrlsOrEmpty() {
        return imageUrls == null ? List.of() : imageUrls;
    }
}
