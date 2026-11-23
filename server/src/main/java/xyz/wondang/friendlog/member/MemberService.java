package xyz.wondang.friendlog.member;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.wondang.friendlog.common.exception.BusinessException;
import xyz.wondang.friendlog.common.exception.ErrorCode;
import xyz.wondang.friendlog.member.dto.MemberResponse;
import xyz.wondang.friendlog.member.dto.MemberUpdateRequest;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService {

    private final MemberRepository memberRepository;

    public MemberResponse getMe(Long memberId) {
        return MemberResponse.from(find(memberId));
    }

    // 보낸 필드만 바꾼다 (MemberUpdateRequest 참고). 변경 감지로 UPDATE
    @Transactional
    public MemberResponse updateMe(Long memberId, MemberUpdateRequest request) {
        Member member = find(memberId);
        if (request.isNicknamePresent()) {
            member.changeNickname(request.getNickname());
        }
        if (request.isAvatarUrlPresent()) {
            member.changeAvatarUrl(request.getAvatarUrl()); // null이면 삭제
        }
        return MemberResponse.from(member);
    }

    Member find(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
    }
}
