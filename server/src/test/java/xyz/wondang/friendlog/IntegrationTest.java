package xyz.wondang.friendlog;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * API 통합 테스트의 공통 부모.
 * - 실제 앱 전체 + Testcontainers MySQL로 실행 (Flyway 스키마 그대로)
 * - MockMvc로 HTTP 요청을 흉내 낸다 (실제 포트를 열지 않음)
 * - @Transactional: 테스트가 끝나면 롤백되어 테스트끼리 데이터가 섞이지 않는다
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@Transactional
public abstract class IntegrationTest {

    @Autowired
    protected MockMvc mockMvc;
}
