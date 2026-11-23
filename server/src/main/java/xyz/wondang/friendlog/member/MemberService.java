package xyz.wondang.friendlog.member;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.wondang.friendlog.common.exception.BusinessException;
import xyz.wondang.friendlog.common.exception.ErrorCode;
import xyz.wondang.friendlog.member.dto.MemberResponse;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService {

    private final MemberRepository memberRepository;

    public MemberResponse getMe(Long memberId) {
        return MemberResponse.from(find(memberId));
    }

    Member find(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
    }
}
