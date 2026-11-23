package xyz.wondang.friendlog.common;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

// @Scheduled 메서드(ImageCleanupScheduler)가 동작하도록 스케줄링을 켠다
@Configuration
@EnableScheduling
public class SchedulingConfig {
}
