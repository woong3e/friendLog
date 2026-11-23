package xyz.wondang.friendlog.image;

import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 매일 새벽 4시에 쓰이지 않는 이미지를 지운다.
 * 서버가 한 대라 중복 실행 걱정이 없다. 여러 대가 되면 한 대에서만 돌도록 잠금(ShedLock 등)이 필요하다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ImageCleanupScheduler {

    private final ImageService imageService;

    @Scheduled(cron = "${friendlog.storage.cleanup-cron}", zone = "Asia/Seoul")
    public void cleanup() {
        int deleted = imageService.cleanupUnused(LocalDateTime.now());
        log.info("쓰이지 않는 이미지 {}개 삭제", deleted);
    }
}
