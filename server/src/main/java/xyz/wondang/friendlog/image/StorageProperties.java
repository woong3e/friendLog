package xyz.wondang.friendlog.image;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("friendlog.storage")
public record StorageProperties(
        String bucket,
        String region,
        String endpoint,      // 로컬 가짜 S3 주소. 비어 있으면 실제 AWS
        String accessKey,     // 비어 있으면 AWS 기본 자격 증명(IAM 역할, 환경 변수 등)
        String secretKey,
        String publicBaseUrl,
        Duration presignTtl,
        Duration cleanupGrace
) {
    public boolean hasEndpoint() {
        return endpoint != null && !endpoint.isBlank();
    }

    public boolean hasStaticCredentials() {
        return accessKey != null && !accessKey.isBlank();
    }
}
