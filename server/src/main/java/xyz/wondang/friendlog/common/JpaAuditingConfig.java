package xyz.wondang.friendlog.common;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

// @CreatedDate, @LastModifiedDate 가 동작하도록 Auditing을 켠다.
@Configuration
@EnableJpaAuditing
public class JpaAuditingConfig {
}
