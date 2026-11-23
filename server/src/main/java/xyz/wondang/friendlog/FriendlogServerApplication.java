package xyz.wondang.friendlog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration;

// UserDetailsServiceAutoConfiguration 제외: Spring Security가 기본으로 만드는 "user / 랜덤 비밀번호" 계정을 쓰지 않는다
// (로그인은 AuthService가 직접 처리하고, 요청 인증은 JWT 필터가 한다)
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
@ConfigurationPropertiesScan // @ConfigurationProperties 레코드(AuthProperties 등)를 찾아 등록
public class FriendlogServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(FriendlogServerApplication.class, args);
    }
}
