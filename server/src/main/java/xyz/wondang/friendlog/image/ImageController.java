package xyz.wondang.friendlog.image;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.wondang.friendlog.auth.security.LoginMember;
import xyz.wondang.friendlog.image.dto.PresignedUrlRequest;
import xyz.wondang.friendlog.image.dto.PresignedUrlResponse;

@RestController
@RequestMapping("/images")
@RequiredArgsConstructor
public class ImageController {

    private final ImageService imageService;

    /**
     * 업로드 흐름:
     * 1) 프론트: 이미지 압축(WebP) → POST /images/presigned-url
     * 2) 프론트: 받은 uploadUrl로 S3에 직접 PUT (Content-Type 헤더 일치 필요)
     * 3) 프론트: imageUrl을 글·프로필 저장 API에 담아 보냄
     */
    @PostMapping("/presigned-url")
    public PresignedUrlResponse issue(@AuthenticationPrincipal LoginMember loginMember,
                                      @Valid @RequestBody PresignedUrlRequest request) {
        return imageService.issueUploadUrl(loginMember.id(), ImageFolder.from(request.folder()), request.contentType());
    }
}
