package xyz.wondang.friendlog.rating;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.RepeatedTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import xyz.wondang.friendlog.IntegrationTest;
import xyz.wondang.friendlog.member.Member;
import xyz.wondang.friendlog.member.MemberRepository;
import xyz.wondang.friendlog.post.Post;
import xyz.wondang.friendlog.post.PostRepository;

/**
 * 같은 사람이 평가 버튼을 동시에 여러 번 눌렀을 때 (더블 클릭, 네트워크 재시도).
 * 요청마다 실제 트랜잭션이 커밋되어야 경쟁 상황이 재현되므로 테스트 트랜잭션을 끈다.
 */
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class RatingConcurrencyTest extends IntegrationTest {

    @Autowired MemberRepository memberRepository;
    @Autowired PostRepository postRepository;
    @Autowired JdbcTemplate jdbcTemplate;

    @AfterEach
    void cleanUp() {
        jdbcTemplate.update("delete from rating");
        jdbcTemplate.update("delete from post");
        jdbcTemplate.update("delete from member where email = 'race@test.com'");
    }

    // 경쟁 상황은 매번 재현되지 않아서 여러 번 반복한다
    @RepeatedTest(10)
    void 동시에_10번_보내도_모두_성공하고_평가는_하나() throws Exception {
        Member member = memberRepository.save(new Member("race@test.com", "hash", "경쟁"));
        Post post = postRepository.save(new Post(member, "모임", "본문", null, null, LocalDateTime.now()));
        String token = bearer(member);

        int threads = 10;
        ExecutorService pool = Executors.newFixedThreadPool(threads);
        CountDownLatch start = new CountDownLatch(1);
        List<Future<Integer>> results = new ArrayList<>();
        for (int i = 0; i < threads; i++) {
            Callable<Integer> request = () -> {
                start.await(); // 모든 스레드가 준비된 뒤 한꺼번에 출발
                return mockMvc.perform(put("/posts/{id}/ratings/me", post.getId())
                                .header("Authorization", token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{ \"score\": 4.0 }"))
                        .andReturn().getResponse().getStatus();
            };
            results.add(pool.submit(request));
        }
        start.countDown();

        for (Future<Integer> result : results) {
            assertThat(result.get()).isEqualTo(200);
        }
        pool.shutdown();

        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from rating where post_id = ?", Integer.class, post.getId());
        assertThat(count).isEqualTo(1);
    }
}
