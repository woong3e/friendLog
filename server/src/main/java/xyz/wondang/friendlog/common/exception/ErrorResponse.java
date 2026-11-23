package xyz.wondang.friendlog.common.exception;

import java.util.List;

/**
 * 모든 실패 응답의 모양: { "code": "...", "message": "...", "errors": [...] }
 * errors는 입력 검증 실패(400)일 때만 채운다.
 */
public record ErrorResponse(String code, String message, List<FieldError> errors) {

    public record FieldError(String field, String reason) {
    }

    public static ErrorResponse of(ErrorCode errorCode) {
        return new ErrorResponse(errorCode.name(), errorCode.getMessage(), List.of());
    }

    public static ErrorResponse of(ErrorCode errorCode, List<FieldError> errors) {
        return new ErrorResponse(errorCode.name(), errorCode.getMessage(), errors);
    }
}
