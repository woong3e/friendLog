package xyz.wondang.friendlog.rating;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    // 글 삭제 전에 그 글의 평가를 한 번의 DELETE로 지운다 (평가 수만큼 DELETE가 나가지 않게)
    @Modifying(clearAutomatically = true)
    @Query("delete from Rating r where r.post.id = :postId")
    void deleteAllByPostId(@Param("postId") Long postId);
}
