package xyz.wondang.friendlog.rating;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    // 글 삭제 전에 그 글의 평가를 한 번의 DELETE로 지운다 (평가 수만큼 DELETE가 나가지 않게)
    @Modifying(clearAutomatically = true)
    @Query("delete from Rating r where r.post.id = :postId")
    void deleteAllByPostId(@Param("postId") Long postId);

    // 한줄평 목록: 작성자를 함께 가져온다 (평가마다 작성자를 따로 조회하는 N+1 방지)
    @Query("select r from Rating r join fetch r.member where r.post.id = :postId order by r.createdAt desc, r.id desc")
    List<Rating> findAllWithMemberByPostId(@Param("postId") Long postId);

    Optional<Rating> findByPostIdAndMemberId(Long postId, Long memberId);

    // 점수별 인원: [점수, 인원] 목록. 평균과 분포를 여기서 함께 계산한다
    @Query("select r.score, count(r) from Rating r where r.post.id = :postId group by r.score")
    List<Object[]> countByScore(@Param("postId") Long postId);

    /**
     * "내 평가"를 없으면 INSERT, 있으면 UPDATE 하는 MySQL 전용 문장 (upsert).
     *
     * 자바에서 "조회 → 없으면 저장"으로 짜면, 같은 사람이 버튼을 빠르게 두 번 누를 때
     * 두 요청이 모두 "없음"을 보고 둘 다 INSERT 하다가 유니크 제약 (post_id, member_id)에 걸려 500이 난다.
     * 이 문장은 DB가 한 번에 처리하므로 동시에 와도 평가는 하나로 남는다.
     * (JPQL에는 upsert가 없어서 nativeQuery)
     */
    @Modifying(clearAutomatically = true)
    @Query(nativeQuery = true, value = """
            insert into rating (post_id, member_id, score, comment, created_at, updated_at)
            values (:postId, :memberId, :score, :comment, :now, :now) as new
            on duplicate key update
                score = new.score,
                comment = new.comment,
                updated_at = new.updated_at
            """)
    void upsert(@Param("postId") Long postId,
                @Param("memberId") Long memberId,
                @Param("score") BigDecimal score,
                @Param("comment") String comment,
                @Param("now") LocalDateTime now);
}
