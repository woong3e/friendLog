package xyz.wondang.friendlog.post;

import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

/**
 * 메인 목록 조회 쿼리 모음.
 *
 * 카드 하나에 필요한 것: 글 + 작성자 + 평균 평점 + 내가 평가했는지.
 * 글마다 작성자·평점을 따로 조회하면 카드 8개에 쿼리가 1 + 8 + 8 + ... 번 나간다 (N+1 문제).
 * 그래서 페이지 단위로 쿼리 3번에 끝낸다:
 *   1) 정렬·페이징된 글 id + 평균 평점   (GROUP BY)
 *   2) 그 id들의 글 + 작성자             (fetch join, IN)
 *   3) 그 id들 중 내가 평가한 글 id       (IN)
 */
@Repository
@RequiredArgsConstructor
public class PostListQuery {

    private final EntityManager em;

    public record PostScore(Long postId, Double averageScore) {
    }

    // size + 1개를 가져와서, 남는 1개로 "다음 페이지가 있는지"만 판단한다 (전체 개수 COUNT 쿼리 없음 = Slice)
    public List<PostScore> findPostScores(PostSort sort, int page, int size) {
        String jpql = "select new xyz.wondang.friendlog.post.PostListQuery$PostScore(p.id, avg(r.score)) "
                + "from Post p left join Rating r on r.post = p "
                + "group by p.id, p.eventAt "
                + "order by " + sort.orderBy();
        return em.createQuery(jpql, PostScore.class)
                .setFirstResult(page * size)
                .setMaxResults(size + 1)
                .getResultList();
    }

    public Map<Long, Post> findPostsWithMember(List<Long> postIds) {
        if (postIds.isEmpty()) {
            return Map.of();
        }
        return em.createQuery("select p from Post p join fetch p.member where p.id in :ids", Post.class)
                .setParameter("ids", postIds)
                .getResultStream()
                .collect(Collectors.toMap(Post::getId, Function.identity()));
    }

    public List<Long> findRatedPostIds(Long memberId, List<Long> postIds) {
        if (memberId == null || postIds.isEmpty()) {
            return List.of();
        }
        return em.createQuery(
                        "select r.post.id from Rating r where r.member.id = :memberId and r.post.id in :ids", Long.class)
                .setParameter("memberId", memberId)
                .setParameter("ids", postIds)
                .getResultList();
    }
}
