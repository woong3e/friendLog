-- FRIENDLOG 초기 테이블 (docs/design/ERD.md)
-- 한 번 실행된 파일은 절대 수정하지 않는다. 바꿀 게 있으면 V2, V3... 새 파일로 추가한다.

CREATE TABLE member
(
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    email      VARCHAR(255) NOT NULL,
    password   VARCHAR(255) NOT NULL,
    nickname   VARCHAR(30)  NOT NULL,
    avatar_url VARCHAR(500) NULL,
    created_at DATETIME(6)  NOT NULL,
    updated_at DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_member_email UNIQUE (email)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE post
(
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    member_id     BIGINT       NOT NULL,
    title         VARCHAR(100) NOT NULL,
    content       TEXT         NOT NULL,
    summary       VARCHAR(500) NULL,
    thumbnail_url VARCHAR(500) NULL,
    event_at      DATETIME     NOT NULL,
    created_at    DATETIME(6)  NOT NULL,
    updated_at    DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_post_member FOREIGN KEY (member_id) REFERENCES member (id),
    INDEX idx_post_event_at (event_at)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE rating
(
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    post_id    BIGINT       NOT NULL,
    member_id  BIGINT       NOT NULL,
    score      DECIMAL(2, 1) NOT NULL,
    comment    VARCHAR(500) NULL,
    created_at DATETIME(6)  NOT NULL,
    updated_at DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_rating_post FOREIGN KEY (post_id) REFERENCES post (id),
    CONSTRAINT fk_rating_member FOREIGN KEY (member_id) REFERENCES member (id),
    CONSTRAINT uk_rating_post_member UNIQUE (post_id, member_id),
    CONSTRAINT ck_rating_score CHECK (score BETWEEN 0.5 AND 5.0)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE post_image
(
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    post_id    BIGINT       NOT NULL,
    url        VARCHAR(500) NOT NULL,
    created_at DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_post_image_post FOREIGN KEY (post_id) REFERENCES post (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;
