package xyz.wondang.friendlog.auth.jwt;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Component;
import xyz.wondang.friendlog.auth.AuthProperties;

/**
 * 액세스 토큰(JWT) 발급·검증.
 *
 * JWT = header.payload.signature. payload에 회원 id(sub)와 만료 시각(exp)을 담고,
 * 서버만 아는 비밀 키로 서명한다. 서버는 DB를 보지 않고 서명과 만료만 확인해서 "누구인지" 안다 (stateless).
 * 대신 한 번 발급하면 만료 전까지 취소할 수 없어서 수명을 짧게(30분) 둔다.
 */
@Component
public class JwtProvider {

    private final SecretKey key;
    private final AuthProperties properties;

    public JwtProvider(AuthProperties properties) {
        this.properties = properties;
        this.key = Keys.hmacShaKeyFor(properties.jwtSecret().getBytes(StandardCharsets.UTF_8));
    }

    public String createAccessToken(Long memberId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(memberId))
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(properties.accessTokenTtl())))
                .signWith(key)
                .compact();
    }

    // 서명이 틀리거나, 만료됐거나, 형식이 이상하면 empty
    public Optional<Long> parseMemberId(String token) {
        try {
            String subject = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
            return Optional.of(Long.valueOf(subject));
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
