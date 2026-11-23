package xyz.wondang.friendlog.auth.signup;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import xyz.wondang.friendlog.common.BaseTimeEntity;

/**
 * 인증 코드 확인 전의 가입 정보. 코드가 맞으면 Member로 옮기고 삭제한다.
 * 규칙(만료, 재전송 간격, 시도 횟수)을 이 클래스 안에 모아 서비스가 단순해지게 했다.
 */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SignupVerification extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password; // bcrypt 해시

    @Column(nullable = false, length = 30)
    private String nickname;

    @Column(nullable = false, length = 6, columnDefinition = "CHAR(6)")
    private String code;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private int failedAttempts;

    @Column(nullable = false)
    private LocalDateTime lastSentAt;

    public SignupVerification(String email, String passwordHash, String nickname,
                              String code, LocalDateTime now, Duration codeTtl) {
        this.email = email;
        this.password = passwordHash;
        this.nickname = nickname;
        issueCode(code, now, codeTtl);
    }

    // 같은 이메일로 다시 가입 신청: 입력값을 새로 받고 코드도 새로
    public void renew(String passwordHash, String nickname, String code, LocalDateTime now, Duration codeTtl) {
        this.password = passwordHash;
        this.nickname = nickname;
        issueCode(code, now, codeTtl);
    }

    // 새 코드 발급: 만료 시각과 틀린 횟수를 초기화
    public void issueCode(String code, LocalDateTime now, Duration codeTtl) {
        this.code = code;
        this.expiresAt = now.plus(codeTtl);
        this.failedAttempts = 0;
        this.lastSentAt = now;
    }

    public boolean canResend(LocalDateTime now, Duration cooldown) {
        return !now.isBefore(lastSentAt.plus(cooldown));
    }

    public boolean isExpired(LocalDateTime now) {
        return !expiresAt.isAfter(now);
    }

    public boolean isAttemptsExceeded(int maxAttempts) {
        return failedAttempts >= maxAttempts;
    }

    // 문자열을 앞에서부터 비교하다 다른 곳에서 멈추면 걸린 시간으로 코드를 추측할 수 있어서, 항상 끝까지 비교한다
    public boolean matches(String input) {
        return input != null && MessageDigest.isEqual(
                code.getBytes(StandardCharsets.UTF_8), input.getBytes(StandardCharsets.UTF_8));
    }

    public void recordFailure() {
        this.failedAttempts++;
    }
}
