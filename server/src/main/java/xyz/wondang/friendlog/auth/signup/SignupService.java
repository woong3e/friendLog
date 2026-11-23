package xyz.wondang.friendlog.auth.signup;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.wondang.friendlog.common.exception.BusinessException;
import xyz.wondang.friendlog.common.exception.ErrorCode;
import xyz.wondang.friendlog.member.Member;
import xyz.wondang.friendlog.member.MemberRepository;

/**
 * 회원가입 흐름: 가입 신청(코드 메일 발송) → 코드 확인(회원 생성) / 코드 재전송
 */
@Service
@RequiredArgsConstructor
public class SignupService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final SignupVerificationRepository verificationRepository;
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final VerificationMailSender mailSender;
    private final SignupProperties properties;

    @Transactional
    public void requestSignup(String email, String rawPassword, String nickname) {
        // 친구 모임 서비스라 "이미 가입된 이메일"을 숨기지 않고 알려 준다 (편의 > 계정 존재 여부 노출 위험)
        if (memberRepository.existsByEmail(email)) {
            throw new BusinessException(ErrorCode.EMAIL_DUPLICATED);
        }

        LocalDateTime now = LocalDateTime.now();
        String code = newCode();
        String passwordHash = passwordEncoder.encode(rawPassword);

        verificationRepository.findByEmail(email).ifPresentOrElse(
                pending -> {
                    checkResendCooldown(pending, now);
                    pending.renew(passwordHash, nickname, code, now, properties.codeTtl());
                },
                () -> verificationRepository.save(
                        new SignupVerification(email, passwordHash, nickname, code, now, properties.codeTtl()))
        );
        mailSender.send(email, code);
    }

    @Transactional
    public void resend(String email) {
        SignupVerification pending = findPending(email);
        LocalDateTime now = LocalDateTime.now();
        checkResendCooldown(pending, now);

        String code = newCode();
        pending.issueCode(code, now, properties.codeTtl());
        mailSender.send(email, code);
    }

    /**
     * 코드가 맞으면 회원을 만들고 돌려준다.
     *
     * noRollbackFor: 코드가 틀리면 "틀린 횟수 +1"을 저장한 뒤 예외를 던진다.
     * 기본 설정이면 예외 때문에 트랜잭션이 롤백되어 +1도 사라진다 → 횟수 제한이 동작하지 않는다.
     * 그래서 BusinessException이 나도 커밋하도록 했다. (이 메서드에서 예외 전에 쓰는 건 횟수뿐이다)
     */
    @Transactional(noRollbackFor = BusinessException.class)
    public Member verify(String email, String code) {
        SignupVerification pending = findPending(email);
        LocalDateTime now = LocalDateTime.now();

        if (pending.isAttemptsExceeded(properties.maxAttempts())) {
            throw new BusinessException(ErrorCode.VERIFICATION_ATTEMPTS_EXCEEDED);
        }
        if (pending.isExpired(now)) {
            throw new BusinessException(ErrorCode.VERIFICATION_CODE_EXPIRED);
        }
        if (!pending.matches(code)) {
            pending.recordFailure();
            throw new BusinessException(pending.isAttemptsExceeded(properties.maxAttempts())
                    ? ErrorCode.VERIFICATION_ATTEMPTS_EXCEEDED
                    : ErrorCode.INVALID_VERIFICATION_CODE);
        }
        // 코드 확인 사이에 같은 이메일로 가입이 끝났을 수도 있다 (member.email 유니크 제약이 최종 방어선)
        if (memberRepository.existsByEmail(email)) {
            throw new BusinessException(ErrorCode.EMAIL_DUPLICATED);
        }

        Member member = memberRepository.save(new Member(email, pending.getPassword(), pending.getNickname()));
        verificationRepository.delete(pending);
        return member;
    }

    private SignupVerification findPending(String email) {
        return verificationRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.VERIFICATION_NOT_FOUND));
    }

    private void checkResendCooldown(SignupVerification pending, LocalDateTime now) {
        if (!pending.canResend(now, properties.resendCooldown())) {
            throw new BusinessException(ErrorCode.TOO_MANY_REQUESTS);
        }
    }

    // 000000 ~ 999999. 예측할 수 없어야 해서 Random이 아니라 SecureRandom
    private static String newCode() {
        return String.format("%06d", RANDOM.nextInt(1_000_000));
    }
}
