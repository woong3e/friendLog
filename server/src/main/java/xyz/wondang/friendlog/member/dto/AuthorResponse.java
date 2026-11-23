package xyz.wondang.friendlog.member.dto;

import xyz.wondang.friendlog.member.Member;

// 글·평가 응답에 함께 담는 작성자 정보 (email, password 같은 정보는 빼고 화면에 필요한 것만)
public record AuthorResponse(Long id, String nickname, String avatarUrl) {

    public static AuthorResponse from(Member member) {
        return new AuthorResponse(member.getId(), member.getNickname(), member.getAvatarUrl());
    }
}
