-- 4단계: 업로드 기록
-- Presigned URL을 발급할 때마다 한 줄 남긴다. 정리 스케줄러가 이 목록을 보고
-- "일정 시간이 지났는데 글·썸네일·아바타 어디에도 쓰이지 않는 파일"을 S3에서 지운다.
-- (글을 쓰다 나가면 업로드한 이미지가 남던 기존 문제 해결)
-- 7단계에서 옮겨 올 기존 이미지는 여기에 기록하지 않으므로 정리 대상이 되지 않는다.
CREATE TABLE uploaded_image
(
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    member_id  BIGINT       NOT NULL,
    object_key VARCHAR(300) NOT NULL,
    url        VARCHAR(500) NOT NULL,
    created_at DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_uploaded_image_key UNIQUE (object_key),
    INDEX idx_uploaded_image_created_at (created_at)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;
