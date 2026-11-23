package xyz.wondang.friendlog.image;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Limit;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.wondang.friendlog.image.dto.PresignedUrlResponse;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageService {

    private static final int CLEANUP_BATCH = 100;

    private final ImageStorage storage;
    private final UploadedImageRepository uploadedImageRepository;
    private final StorageProperties properties;

    /**
     * 업로드용 URL 발급. 파일 이름은 서버가 정한다 (사용자가 보낸 이름을 쓰면 덮어쓰기·경로 조작 위험).
     * 실제로 업로드했는지는 알 수 없지만, 발급 기록을 남겨 두고 쓰이지 않으면 정리 때 지운다.
     */
    @Transactional
    public PresignedUrlResponse issueUploadUrl(Long memberId, ImageFolder folder, String contentType) {
        String extension = contentType.substring("image/".length()).replace("jpeg", "jpg");
        String key = folder.value() + "/" + UUID.randomUUID() + "." + extension;
        String imageUrl = properties.publicBaseUrl() + "/" + key;

        uploadedImageRepository.save(new UploadedImage(memberId, key, imageUrl));
        return new PresignedUrlResponse(storage.presignUpload(key, contentType), imageUrl);
    }

    /**
     * 쓰이지 않는 이미지 정리. 한 번에 100개씩, 개수를 돌려준다.
     * S3 삭제가 실패한 파일은 기록을 남겨 두어 다음 실행 때 다시 시도한다.
     */
    public int cleanupUnused(LocalDateTime now) {
        LocalDateTime cutoff = now.minus(properties.cleanupGrace());
        List<UploadedImage> unused = uploadedImageRepository.findUnused(cutoff, Limit.of(CLEANUP_BATCH));

        int deleted = 0;
        for (UploadedImage image : unused) {
            try {
                storage.delete(image.getObjectKey());
                uploadedImageRepository.delete(image);
                deleted++;
            } catch (RuntimeException e) {
                log.warn("이미지 삭제 실패, 다음에 다시 시도: {}", image.getObjectKey(), e);
            }
        }
        return deleted;
    }
}
