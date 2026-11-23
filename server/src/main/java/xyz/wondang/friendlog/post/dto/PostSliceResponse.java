package xyz.wondang.friendlog.post.dto;

import java.util.List;

// 무한 스크롤용 응답. 전체 개수 대신 다음 페이지가 있는지만 알려 준다.
public record PostSliceResponse(List<PostSummaryResponse> content, boolean hasNext) {
}
