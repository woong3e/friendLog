package xyz.wondang.friendlog.image.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record PresignedUrlRequest(
        @NotBlank(message = "업로드 위치를 입력해주세요.")
        String folder, // thumbnail | avatar | content

        // 프론트가 WebP로 압축해서 올리지만, GIF는 압축하지 않으므로 함께 허용
        @NotBlank
        @Pattern(regexp = "image/(webp|jpeg|png|gif)", message = "webp, jpeg, png, gif 이미지만 올릴 수 있습니다.")
        String contentType
) {
}
