package xyz.wondang.friendlog.post;

import java.util.Arrays;
import xyz.wondang.friendlog.common.exception.BusinessException;
import xyz.wondang.friendlog.common.exception.ErrorCode;

/**
 * 목록 정렬. 값이 같을 때 순서가 흔들리지 않도록(페이지 사이 중복·누락 방지) 항상 id를 마지막 기준으로 둔다.
 * 평점순에서 평가가 없는 글(평균 null)은 맨 뒤.
 */
public enum PostSort {

    LATEST("latest", "p.eventAt desc, p.id desc"),
    OLDEST("oldest", "p.eventAt asc, p.id asc"),
    RATING_HIGH("rating_high", "avg(r.score) desc nulls last, p.eventAt desc, p.id desc"),
    RATING_LOW("rating_low", "avg(r.score) asc nulls last, p.eventAt desc, p.id desc");

    private final String value;
    private final String orderBy;

    PostSort(String value, String orderBy) {
        this.value = value;
        this.orderBy = orderBy;
    }

    public String orderBy() {
        return orderBy;
    }

    // 쿼리 파라미터 "latest" 등을 enum으로. 모르는 값이면 400
    public static PostSort from(String value) {
        return Arrays.stream(values())
                .filter(sort -> sort.value.equals(value))
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_INPUT));
    }
}
