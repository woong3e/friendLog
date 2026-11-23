package xyz.wondang.friendlog.common.exception;

import lombok.Getter;

/**
 * 서비스 로직에서 "예상한 실패"를 표현하는 예외. 예: 글이 없음, 작성자가 아님.
 * GlobalExceptionHandler가 ErrorCode의 상태 코드와 메시지로 응답을 만든다.
 */
@Getter
public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}
