package xyz.wondang.friendlog.image;

import java.util.Arrays;
import xyz.wondang.friendlog.common.exception.BusinessException;
import xyz.wondang.friendlog.common.exception.ErrorCode;

// 업로드 위치. S3 키의 앞부분이 된다 (thumbnail/550e8400-....webp)
public enum ImageFolder {
    THUMBNAIL("thumbnail"),
    AVATAR("avatar"),
    CONTENT("content");

    private final String value;

    ImageFolder(String value) {
        this.value = value;
    }

    public String value() {
        return value;
    }

    public static ImageFolder from(String value) {
        return Arrays.stream(values())
                .filter(folder -> folder.value.equals(value))
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_INPUT));
    }
}
