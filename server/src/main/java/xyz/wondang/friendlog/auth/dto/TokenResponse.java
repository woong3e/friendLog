package xyz.wondang.friendlog.auth.dto;

import xyz.wondang.friendlog.member.dto.MemberResponse;

/**
 * 로그인·인증·재발급 응답 본문. 리프레시 토큰은 본문이 아니라 HttpOnly 쿠키로 나간다
 * (자바스크립트가 읽을 수 없어서 XSS로 훔쳐 가기 어렵다).
 */
public record TokenResponse(String accessToken, MemberResponse member) {
}
