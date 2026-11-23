package xyz.wondang.friendlog.auth.security;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import xyz.wondang.friendlog.auth.jwt.JwtProvider;

/**
 * 요청 → [Security 필터 체인] → 컨트롤러
 *
 * 이 서비스는 세션·폼 로그인 대신 JWT를 쓴다:
 * - 세션을 만들지 않음 (STATELESS): 요청마다 토큰으로 누구인지 확인
 * - CSRF 보호 끔: CSRF는 브라우저가 쿠키를 자동으로 붙이는 걸 악용하는 공격인데, 액세스 토큰은
 *   쿠키가 아니라 Authorization 헤더로 직접 보내므로 해당 없음. 쿠키를 쓰는 /auth/refresh는
 *   SameSite=Lax 쿠키라 다른 사이트에서 보낸 POST에는 쿠키가 붙지 않는다.
 * - 모든 API는 로그인 필요. 예외는 /auth/** (가입·로그인·재발급)
 */
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtProvider jwtProvider;
    private final SecurityErrorHandlers errorHandlers;

    // 프론트 주소 목록 (application.yml friendlog.cors.allowed-origins)
    @Value("${friendlog.cors.allowed-origins}")
    private List<String> allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**", "/error").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(errorHandlers.entryPoint())
                        .accessDeniedHandler(errorHandlers.accessDeniedHandler()))
                // 아이디·비밀번호 필터 자리 앞에 JWT 필터를 끼운다
                .addFilterBefore(new JwtAuthenticationFilter(jwtProvider), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    /**
     * CORS: 브라우저는 다른 출처(프론트 localhost:5173 → API localhost:8080)로 보내는 요청을 기본으로 막는다.
     * 서버가 "이 출처는 허용"이라고 응답 헤더로 알려 줘야 브라우저가 응답을 프론트 코드에 넘겨준다.
     * allowCredentials: 리프레시 토큰 쿠키를 주고받기 위해 필요. 이때는 출처를 * 로 열 수 없어서 목록으로 지정한다.
     */
    private CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(allowedOrigins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setExposedHeaders(List.of("Location"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L); // 사전 요청(OPTIONS) 결과를 브라우저가 1시간 기억

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * 비밀번호는 bcrypt로 해시해서 저장한다. 같은 비밀번호도 매번 다른 salt가 붙어 해시가 달라지고,
     * 일부러 느리게 계산해서 유출돼도 대입 공격이 어렵다.
     * Supabase Auth도 bcrypt라서 7단계에 기존 해시를 그대로 옮길 수 있을 가능성이 있다.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
