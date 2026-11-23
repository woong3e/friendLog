package xyz.wondang.friendlog.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * API 에러 코드 목록 (docs/design/API.md "에러 코드").
 * 프론트는 message가 아니라 code로 분기한다.
 */
@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 공통
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "입력값이 올바르지 않습니다."),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "권한이 없습니다."),
    NOT_FOUND(HttpStatus.NOT_FOUND, "요청한 주소를 찾을 수 없습니다."),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "지원하지 않는 요청 방식입니다."),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."),

    TOO_MANY_REQUESTS(HttpStatus.TOO_MANY_REQUESTS, "잠시 후 다시 시도해주세요."),

    // 인증
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다."),
    INVALID_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "로그인이 만료되었습니다. 다시 로그인해주세요."),
    EMAIL_DUPLICATED(HttpStatus.CONFLICT, "이미 가입된 이메일입니다."),
    VERIFICATION_NOT_FOUND(HttpStatus.BAD_REQUEST, "인증 요청을 찾을 수 없습니다. 회원가입을 다시 진행해주세요."),
    INVALID_VERIFICATION_CODE(HttpStatus.BAD_REQUEST, "인증 코드가 올바르지 않습니다."),
    VERIFICATION_CODE_EXPIRED(HttpStatus.BAD_REQUEST, "인증 코드가 만료되었습니다. 코드를 다시 받아주세요."),
    VERIFICATION_ATTEMPTS_EXCEEDED(HttpStatus.TOO_MANY_REQUESTS, "인증 코드를 여러 번 틀렸습니다. 코드를 다시 받아주세요."),
    MAIL_SEND_FAILED(HttpStatus.SERVICE_UNAVAILABLE, "메일을 보내지 못했습니다. 잠시 후 다시 시도해주세요."),

    // 회원
    MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다."),

    // 게시글
    POST_NOT_FOUND(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."),
    POST_FORBIDDEN(HttpStatus.FORBIDDEN, "작성자만 수정·삭제할 수 있습니다.");

    private final HttpStatus status;
    private final String message;
}
