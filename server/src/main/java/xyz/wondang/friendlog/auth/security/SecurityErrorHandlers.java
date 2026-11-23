package xyz.wondang.friendlog.auth.security;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;
import xyz.wondang.friendlog.common.exception.ErrorCode;
import xyz.wondang.friendlog.common.exception.ErrorResponse;

/**
 * 필터 체인에서 생긴 401·403은 컨트롤러에 도달하기 전이라 @RestControllerAdvice가 처리하지 못한다.
 * 그래서 Security 쪽에 따로 등록해서 같은 { code, message } 형식으로 응답한다.
 */
@Component
@RequiredArgsConstructor
public class SecurityErrorHandlers {

    private final JsonMapper jsonMapper;

    // 로그인이 필요한데 로그인 정보가 없음 → 401
    public AuthenticationEntryPoint entryPoint() {
        return (request, response, e) -> write(response, ErrorCode.UNAUTHORIZED);
    }

    // 로그인은 했지만 권한이 없음 → 403
    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, e) -> write(response, ErrorCode.FORBIDDEN);
    }

    private void write(HttpServletResponse response, ErrorCode code) throws IOException {
        response.setStatus(code.getStatus().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(jsonMapper.writeValueAsString(ErrorResponse.of(code)));
    }
}
