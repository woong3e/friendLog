package xyz.wondang.friendlog.member.dto;

import xyz.wondang.friendlog.member.Member;

// 내 정보 (GET /members/me, 로그인 응답)
public record MemberResponse(Long id, String email, String nickname, String avatarUrl) {

    public static MemberResponse from(Member member) {
        return new MemberResponse(member.getId(), member.getEmail(), member.getNickname(), member.getAvatarUrl());
    }
}
