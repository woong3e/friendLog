package xyz.wondang.friendlog.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.wondang.friendlog.auth.jwt.JwtProvider;
import xyz.wondang.friendlog.auth.refresh.RefreshTokenService;
import xyz.wondang.friendlog.common.exception.BusinessException;
import xyz.wondang.friendlog.common.exception.ErrorCode;
import xyz.wondang.friendlog.member.Member;
import xyz.wondang.friendlog.member.MemberRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final RefreshTokenService refreshTokenService;

    // 컨트롤러가 본문(accessToken, member)과 쿠키(refreshToken)로 나눠 담는다
    public record IssuedTokens(String accessToken, String refreshToken, Member member) {
    }

    /**
     * 이메일이 없을 때와 비밀번호가 틀릴 때 같은 에러를 준다.
     * 다르게 주면 "이 이메일은 가입되어 있다"는 정보가 새기 때문.
     */
    @Transactional
    public IssuedTokens login(String email, String rawPassword) {
        Member member = memberRepository.findByEmail(email)
                .filter(m -> passwordEncoder.matches(rawPassword, m.getPassword()))
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));
        return issue(member);
    }

    @Transactional
    public IssuedTokens issue(Member member) {
        return new IssuedTokens(
                jwtProvider.createAccessToken(member.getId()),
                refreshTokenService.issue(member.getId()),
                member);
    }

    /**
     * 리프레시 토큰으로 새 토큰 한 쌍을 받는다 (기존 리프레시 토큰은 사용 처리되어 다시 못 씀).
     * consume()과 issue()가 각자 트랜잭션이라, 토큰이 틀려서 consume()이 실패해도 삭제는 커밋된다.
     */
    public IssuedTokens refresh(String rawRefreshToken) {
        Long memberId = refreshTokenService.consume(rawRefreshToken);
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN));
        return issue(member);
    }

    public void logout(String rawRefreshToken) {
        refreshTokenService.revoke(rawRefreshToken);
    }
}
