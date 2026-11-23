package xyz.wondang.friendlog.post;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {

    // 상세 조회: 작성자를 같은 쿼리로 가져온다 (fetch join). 이미지는 접근할 때 한 번 더 조회.
    @Query("select p from Post p join fetch p.member where p.id = :id")
    Optional<Post> findWithMemberById(@Param("id") Long id);
}
