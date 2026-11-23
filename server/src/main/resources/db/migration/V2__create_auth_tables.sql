-- 2단계: 인증

-- 가입 대기: 인증 코드를 확인하기 전까지 가입 정보를 여기에 둔다.
-- 코드가 맞으면 member로 옮기고 이 행은 지운다 → member 테이블에는 인증된 회원만 있다.
CREATE TABLE signup_verification
(
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    email           VARCHAR(255) NOT NULL,
    password        VARCHAR(255) NOT NULL, -- 이미 bcrypt로 해시한 값
    nickname        VARCHAR(30)  NOT NULL,
    code            CHAR(6)      NOT NULL,
    expires_at      DATETIME(6)  NOT NULL,
    failed_attempts INT          NOT NULL,
    last_sent_at    DATETIME(6)  NOT NULL, -- 재전송 간격 제한용
    created_at      DATETIME(6)  NOT NULL,
    updated_at      DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_signup_verification_email UNIQUE (email)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

-- 리프레시 토큰: 원문은 쿠키로만 주고 DB에는 SHA-256 해시만 저장한다 (DB가 유출돼도 토큰을 쓸 수 없게).
-- 재발급할 때마다 기존 행을 지우고 새로 만든다 (rotation).
CREATE TABLE refresh_token
(
    id         BIGINT      NOT NULL AUTO_INCREMENT,
    member_id  BIGINT      NOT NULL,
    token_hash CHAR(64)    NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_refresh_token_hash UNIQUE (token_hash),
    CONSTRAINT fk_refresh_token_member FOREIGN KEY (member_id) REFERENCES member (id),
    INDEX idx_refresh_token_member (member_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;
