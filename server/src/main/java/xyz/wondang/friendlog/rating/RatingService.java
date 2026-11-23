package xyz.wondang.friendlog.rating;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import xyz.wondang.friendlog.common.exception.BusinessException;
import xyz.wondang.friendlog.common.exception.ErrorCode;
import xyz.wondang.friendlog.post.PostRepository;
import xyz.wondang.friendlog.rating.dto.RatingRequest;
import xyz.wondang.friendlog.rating.dto.RatingResponse;
import xyz.wondang.friendlog.rating.dto.RatingSummaryResponse;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RatingService {

    private static final int DISTRIBUTION_SIZE = 10; // 0.5 ~ 5.0, 0.5 단위

    private final RatingRepository ratingRepository;
    private final PostRepository postRepository;

    public List<RatingResponse> getRatings(Long postId) {
        checkPostExists(postId);
        return ratingRepository.findAllWithMemberByPostId(postId).stream()
                .map(RatingResponse::from)
                .toList();
    }

    /**
     * 평균 평점은 저장하지 않고 조회할 때 계산한다 (1단계 결정).
     * 점수별 인원을 GROUP BY로 한 번에 받아서 평균·분포를 함께 만든다.
     */
    public RatingSummaryResponse getSummary(Long postId) {
        checkPostExists(postId);

        List<Long> distribution = new ArrayList<>(Collections.nCopies(DISTRIBUTION_SIZE, 0L));
        long count = 0;
        BigDecimal sum = BigDecimal.ZERO;

        for (Object[] row : ratingRepository.countByScore(postId)) {
            BigDecimal score = (BigDecimal) row[0];
            long people = (Long) row[1];
            int index = score.multiply(BigDecimal.TWO).intValueExact() - 1; // 0.5 → 0, 5.0 → 9
            distribution.set(index, people);
            count += people;
            sum = sum.add(score.multiply(BigDecimal.valueOf(people)));
        }

        Double average = count == 0 ? null : sum.doubleValue() / count;
        return new RatingSummaryResponse(average, count, distribution);
    }

    /**
     * 격리 수준 READ_COMMITTED인 이유 (동시성 테스트에서 실제로 실패했던 문제):
     * MySQL 기본값 REPEATABLE READ에서는 트랜잭션의 첫 조회(checkPostExists) 시점의 스냅샷으로 이후 SELECT를 읽는다.
     * 다른 요청이 그 사이에 평가를 INSERT하고 커밋하면, 이 요청의 upsert는 UPDATE로 바뀌는데
     * 값이 같아서 실제로 바뀐 게 없으면 마지막 SELECT가 옛 스냅샷을 보고 "평가 없음"이 되어 500이 났다.
     * READ_COMMITTED는 SELECT마다 그 시점에 커밋된 최신 데이터를 읽는다.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public RatingResponse upsertMine(Long memberId, Long postId, RatingRequest request) {
        checkPostExists(postId);
        ratingRepository.upsert(postId, memberId, request.score(), request.comment(), LocalDateTime.now());

        // upsert는 엔티티를 거치지 않는 문장이라, 저장된 결과를 다시 읽어서 응답한다
        Rating saved = ratingRepository.findByPostIdAndMemberId(postId, memberId).orElseThrow();
        return RatingResponse.from(saved);
    }

    private void checkPostExists(Long postId) {
        if (!postRepository.existsById(postId)) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }
    }
}
