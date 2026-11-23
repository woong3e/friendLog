package xyz.wondang.friendlog;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

// 앱 전체가 뜨는지(Flyway 적용 + 엔티티 검증 포함) 확인
@Import(TestcontainersConfiguration.class)
@SpringBootTest
class FriendlogServerApplicationTests {

    @Test
    void contextLoads() {
    }
}
