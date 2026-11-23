package xyz.wondang.friendlog.auth.signup;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;
import xyz.wondang.friendlog.common.exception.BusinessException;
import xyz.wondang.friendlog.common.exception.ErrorCode;

@Slf4j
@Component
@RequiredArgsConstructor
public class VerificationMailSender {

    private final JavaMailSender mailSender;
    private final SignupProperties properties;

    /**
     * 트랜잭션 안에서 호출된다. 발송에 실패하면 예외 → 트랜잭션 롤백 → 가입 대기 정보도 저장되지 않는다.
     * (사용자는 메일을 못 받았으니 다시 시도하면 되고, 받지 못한 코드가 DB에 남지 않는다)
     */
    public void send(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(properties.mailFrom());
        message.setTo(to);
        message.setSubject("[FRIENDLOG] 회원가입 인증 코드");
        message.setText("""
                FRIENDLOG 회원가입 인증 코드입니다.

                %s

                %d분 안에 입력해주세요.
                """.formatted(code, properties.codeTtl().toMinutes()));
        try {
            mailSender.send(message);
        } catch (MailException e) {
            log.error("인증 메일 발송 실패: {}", to, e);
            throw new BusinessException(ErrorCode.MAIL_SEND_FAILED);
        }
    }
}
