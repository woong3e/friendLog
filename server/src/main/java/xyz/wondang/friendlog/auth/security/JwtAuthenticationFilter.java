package xyz.wondang.friendlog.auth.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import xyz.wondang.friendlog.auth.jwt.JwtProvider;

/**
 * Spring Security 필터 체인 안에서 요청마다 한 번 실행된다.
 * "Authorization: Bearer {토큰}" 이 유효하면 SecurityContext에 로그인 정보를 넣는다.
 *
 * 토큰이 없거나 틀려도 여기서 막지 않는다. 그냥 통과시키면, 뒤의 인가 단계(authorizeHttpRequests)가
 * "로그인이 필요한 주소인데 로그인 정보가 없다"고 판단해서 401을 돌려준다.
 * (그래서 /auth/** 같은 공개 주소는 토큰 없이도 동작한다)
 */
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtProvider jwtProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith(BEARER_PREFIX)) {
            jwtProvider.parseMemberId(header.substring(BEARER_PREFIX.length()))
                    .ifPresent(memberId -> {
                        // 권한(role) 구분이 없는 서비스라 authorities는 빈 목록
                        var authentication = new UsernamePasswordAuthenticationToken(
                                new LoginMember(memberId), null, List.of());
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    });
        }
        filterChain.doFilter(request, response);
    }
}
