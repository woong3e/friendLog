package xyz.wondang.friendlog.auth.refresh;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.wondang.friendlog.auth.AuthProperties;
import xyz.wondang.friendlog.common.exception.BusinessException;
import xyz.wondang.friendlog.common.exception.ErrorCode;

/**
 * 리프레시 토큰: 액세스 토큰(30분)이 만료됐을 때 다시 로그인하지 않고 새 액세스 토큰을 받는 용도 (14일).
 *
 * - JWT가 아닌 무작위 문자열: 서버가 DB에서 찾아보는 토큰이라 내용을 담을 필요가 없다
 * - 회전(rotation): 쓸 때마다 기존 토큰을 지우고 새 토큰을 준다. 탈취된 토큰은 한 번 쓰이면 끝
 */
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final RefreshTokenRepository repository;
    private final AuthProperties properties;

    // 새 토큰을 만들어 해시를 저장하고, 원문을 돌려준다 (원문은 쿠키로만 나간다)
    @Transactional
    public String issue(Long memberId) {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        LocalDateTime expiresAt = LocalDateTime.now().plus(properties.refreshTokenTtl());
        repository.save(new RefreshToken(memberId, hash(rawToken), expiresAt));
        return rawToken;
    }

    /**
     * 토큰을 확인하고 지운다(사용 처리). 회원 id를 돌려주면 호출한 쪽이 새 토큰을 발급한다.
     * 없거나 만료된 토큰이면 401.
     */
    @Transactional(noRollbackFor = BusinessException.class)
    public Long consume(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
        }
        RefreshToken token = repository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN));

        repository.delete(token); // 만료된 토큰도 지운다 (noRollbackFor: 예외가 나도 삭제는 커밋)
        if (token.isExpired(LocalDateTime.now())) {
            throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
        }
        return token.getMemberId();
    }

    @Transactional
    public void revoke(String rawToken) {
        if (rawToken != null && !rawToken.isBlank()) {
            repository.deleteByTokenHash(hash(rawToken));
        }
    }

    private static String hash(String rawToken) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
