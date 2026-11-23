package xyz.wondang.friendlog.auth.security;

/**
 * 인증된 요청의 "누구인지". JwtAuthenticationFilter가 토큰에서 꺼내 SecurityContext에 넣고,
 * 컨트롤러에서는 @AuthenticationPrincipal LoginMember loginMember 로 받는다.
 */
public record LoginMember(Long id) {
}
