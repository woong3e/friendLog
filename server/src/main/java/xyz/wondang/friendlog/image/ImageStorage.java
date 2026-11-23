package xyz.wondang.friendlog.image;

/**
 * 파일 저장소. 서비스는 S3인지 모르고 이 인터페이스만 쓴다.
 * 테스트에서는 가짜 구현으로 바꿔 끼운다 (실제 S3에 요청하지 않게).
 */
public interface ImageStorage {

    // 브라우저가 이 주소로 파일을 직접 PUT 한다. contentType이 서명에 포함되어 다른 형식으로는 못 올린다
    String presignUpload(String key, String contentType);

    void delete(String key);
}
