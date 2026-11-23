package xyz.wondang.friendlog.auth;

import jakarta.validation.Valid;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.wondang.friendlog.auth.dto.AuthRequests;
import xyz.wondang.friendlog.auth.dto.TokenResponse;
import xyz.wondang.friendlog.auth.signup.SignupService;
import xyz.wondang.friendlog.member.Member;
import xyz.wondang.friendlog.member.dto.MemberResponse;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    static final String REFRESH_COOKIE = "refresh_token";

    private final SignupService signupService;
    private final AuthService authService;
    private final AuthProperties properties;

    // 가입 신청 → 인증 코드 메일 발송. 아직 회원이 생기지 않았으므로 202 Accepted
    @PostMapping("/signup")
    public ResponseEntity<Void> signup(@Valid @RequestBody AuthRequests.Signup request) {
        signupService.requestSignup(request.email(), request.password(), request.nickname());
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/signup/resend")
    public ResponseEntity<Void> resend(@Valid @RequestBody AuthRequests.Resend request) {
        signupService.resend(request.email());
        return ResponseEntity.accepted().build();
    }

    // 코드 확인 → 회원 생성 + 바로 로그인
    @PostMapping("/signup/verify")
    public ResponseEntity<TokenResponse> verify(@Valid @RequestBody AuthRequests.Verify request) {
        Member member = signupService.verify(request.email(), request.code());
        return withTokens(authService.issue(member));
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody AuthRequests.Login request) {
        return withTokens(authService.login(request.email(), request.password()));
    }

    // 리프레시 토큰은 쿠키로 받는다 (브라우저가 자동으로 붙임)
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(
            @CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken) {
        return withTokens(authService.refresh(refreshToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken) {
        authService.logout(refreshToken);
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, refreshCookie("", Duration.ZERO).toString()) // 쿠키 삭제
                .build();
    }

    private ResponseEntity<TokenResponse> withTokens(AuthService.IssuedTokens tokens) {
        ResponseCookie cookie = refreshCookie(tokens.refreshToken(), properties.refreshTokenTtl());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new TokenResponse(tokens.accessToken(), MemberResponse.from(tokens.member())));
    }

    /**
     * HttpOnly: 자바스크립트에서 읽을 수 없음 (XSS로 탈취 방지)
     * Secure: https에서만 전송 (운영 true, 로컬 http는 false)
     * SameSite=Lax: 다른 사이트에서 보낸 POST에는 붙지 않음 (CSRF 방지).
     *   wondang.xyz ↔ api.wondang.xyz 는 같은 사이트라 정상적으로 붙는다
     * Path=/auth: 재발급·로그아웃 요청에만 붙고 다른 API 요청에는 안 붙음
     */
    private ResponseCookie refreshCookie(String value, Duration maxAge) {
        return ResponseCookie.from(REFRESH_COOKIE, value)
                .httpOnly(true)
                .secure(properties.refreshCookieSecure())
                .sameSite("Lax")
                .path("/auth")
                .maxAge(maxAge)
                .build();
    }
}
