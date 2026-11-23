package xyz.wondang.friendlog.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// /auth/** 요청 본문 모음
public final class AuthRequests {

    private AuthRequests() {
    }

    public record Signup(
            @NotBlank(message = "이메일을 입력해주세요.")
            @Email(message = "이메일 형식이 올바르지 않습니다.")
            @Size(max = 255)
            String email,

            @NotBlank(message = "비밀번호를 입력해주세요.")
            @Size(min = 8, max = 64, message = "비밀번호는 8~64자로 입력해주세요.")
            String password,

            @NotBlank(message = "닉네임을 입력해주세요.")
            @Size(max = 30, message = "닉네임은 30자 이하로 입력해주세요.")
            String nickname
    ) {
    }

    public record Verify(
            @NotBlank @Email String email,
            @NotBlank @Pattern(regexp = "\\d{6}", message = "인증 코드는 숫자 6자리입니다.") String code
    ) {
    }

    public record Resend(@NotBlank @Email String email) {
    }

    public record Login(
            @NotBlank(message = "이메일을 입력해주세요.") String email,
            @NotBlank(message = "비밀번호를 입력해주세요.") String password
    ) {
    }
}
