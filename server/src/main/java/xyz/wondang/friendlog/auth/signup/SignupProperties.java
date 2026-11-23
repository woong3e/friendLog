package xyz.wondang.friendlog.auth.signup;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("friendlog.signup")
public record SignupProperties(
        Duration codeTtl,
        Duration resendCooldown,
        int maxAttempts,
        String mailFrom
) {
}
