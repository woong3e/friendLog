package xyz.wondang.friendlog.auth;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

// application.yml의 friendlog.auth.* 값을 타입이 있는 객체로 받는다
@ConfigurationProperties("friendlog.auth")
public record AuthProperties(
        String jwtSecret,
        Duration accessTokenTtl,
        Duration refreshTokenTtl,
        boolean refreshCookieSecure
) {
}
