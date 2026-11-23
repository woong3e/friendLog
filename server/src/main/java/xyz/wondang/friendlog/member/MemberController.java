package xyz.wondang.friendlog.member;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.wondang.friendlog.auth.security.LoginMember;
import xyz.wondang.friendlog.member.dto.MemberResponse;
import xyz.wondang.friendlog.member.dto.MemberUpdateRequest;

@RestController
@RequestMapping("/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    // 새로고침 직후 로그인 상태 복원, 헤더 아바타, 설정 화면
    @GetMapping("/me")
    public MemberResponse me(@AuthenticationPrincipal LoginMember loginMember) {
        return memberService.getMe(loginMember.id());
    }

    // 닉네임·아바타 수정 (보낸 필드만)
    @PatchMapping("/me")
    public MemberResponse updateMe(@AuthenticationPrincipal LoginMember loginMember,
                                   @Valid @RequestBody MemberUpdateRequest request) {
        return memberService.updateMe(loginMember.id(), request);
    }
}
