package xyz.wondang.friendlog.member.dto;

import com.fasterxml.jackson.annotation.JsonSetter;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Size;
import lombok.Getter;

/**
 * PATCH는 "보낸 필드만" 바꾼다. 그래서 세 경우를 구분해야 한다:
 *   필드를 안 보냄          → 바꾸지 않음
 *   "avatarUrl": null     → 아바타 삭제
 *   "avatarUrl": "https…" → 변경
 * 일반 필드는 앞의 두 경우가 모두 null이라 구분이 안 된다.
 * 그래서 JSON에 그 필드가 있을 때만 호출되는 setter에서 "보냈음" 표시를 남긴다.
 */
@Getter
public class MemberUpdateRequest {

    @Size(max = 30, message = "닉네임은 30자 이하로 입력해주세요.")
    private String nickname;
    private boolean nicknamePresent;

    @Size(max = 500)
    private String avatarUrl;
    private boolean avatarUrlPresent;

    @JsonSetter("nickname")
    public void setNickname(String nickname) {
        this.nickname = nickname;
        this.nicknamePresent = true;
    }

    @JsonSetter("avatarUrl")
    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
        this.avatarUrlPresent = true;
    }

    // 닉네임은 지울 수 없다: 보냈다면 비어 있으면 안 됨
    @AssertTrue(message = "닉네임을 입력해주세요.")
    public boolean isNicknameValid() {
        return !nicknamePresent || (nickname != null && !nickname.isBlank());
    }
}
