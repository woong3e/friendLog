package xyz.wondang.friendlog.image.dto;

/**
 * uploadUrl: 브라우저가 파일을 PUT 할 주소 (5분 유효, 요청한 Content-Type 헤더를 그대로 붙여야 함)
 * imageUrl: 업로드 후 글·프로필에 저장할 공개 주소
 */
public record PresignedUrlResponse(String uploadUrl, String imageUrl) {
}
