package xyz.wondang.friendlog;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import xyz.wondang.friendlog.auth.jwt.JwtProvider;
import xyz.wondang.friendlog.image.ImageStorage;
import xyz.wondang.friendlog.member.Member;

/**
 * API 통합 테스트의 공통 부모.
 * - 실제 앱 전체 + Testcontainers MySQL로 실행 (Flyway 스키마 그대로)
 * - MockMvc로 HTTP 요청을 흉내 낸다 (실제 포트를 열지 않음)
 * - @Transactional: 테스트가 끝나면 롤백되어 테스트끼리 데이터가 섞이지 않는다
 * - 메일은 실제로 보내지 않고 가짜(mock)로 바꿔서, 보낸 내용을 검사한다
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@Transactional
public abstract class IntegrationTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected JwtProvider jwtProvider;

    @MockitoBean
    protected JavaMailSender mailSender;

    // 실제 S3 구현을 감싼 스파이: Presigned URL 서명은 진짜로 계산하고(네트워크 없음), 삭제는 테스트에서 가짜로 바꾼다
    @MockitoSpyBean
    protected ImageStorage imageStorage;

    // Authorization 헤더 값
    protected String bearer(Member member) {
        return "Bearer " + jwtProvider.createAccessToken(member.getId());
    }
}
