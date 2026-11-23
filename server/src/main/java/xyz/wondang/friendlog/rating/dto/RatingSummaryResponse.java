package xyz.wondang.friendlog.rating.dto;

import java.util.List;

/**
 * 평균과 점수 분포.
 * distribution: [0.5점 인원, 1.0점 인원, ..., 5.0점 인원] 10칸
 */
public record RatingSummaryResponse(Double average, long count, List<Long> distribution) {
}
