package xyz.wondang.friendlog.auth.refresh;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * 리프레시 토큰은 액세스 토큰과 달리 서버(DB)에 기록해 둔다 → 로그아웃하면 지워서 바로 무효화할 수 있다.
 * 원문이 아니라 해시만 저장한다.
 */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 연관관계 대신 id만 둔다: 토큰으로 회원 엔티티를 탐색할 일이 없어서
    @Column(nullable = false)
    private Long memberId;

    @Column(nullable = false, length = 64, columnDefinition = "CHAR(64)")
    private String tokenHash;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public RefreshToken(Long memberId, String tokenHash, LocalDateTime expiresAt) {
        this.memberId = memberId;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
    }

    public boolean isExpired(LocalDateTime now) {
        return !expiresAt.isAfter(now);
    }
}
