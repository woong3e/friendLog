package xyz.wondang.friendlog.rating;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.wondang.friendlog.auth.security.LoginMember;
import xyz.wondang.friendlog.rating.dto.RatingRequest;
import xyz.wondang.friendlog.rating.dto.RatingResponse;
import xyz.wondang.friendlog.rating.dto.RatingSummaryResponse;

// 평가는 글에 속한 자원이라 /posts/{postId}/ratings 아래에 둔다
@RestController
@RequestMapping("/posts/{postId}/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @GetMapping
    public List<RatingResponse> getRatings(@PathVariable Long postId) {
        return ratingService.getRatings(postId);
    }

    @GetMapping("/summary")
    public RatingSummaryResponse getSummary(@PathVariable Long postId) {
        return ratingService.getSummary(postId);
    }

    // "이 글에 대한 내 평가"를 통째로 저장. 없으면 생성, 있으면 교체 (멱등)
    @PutMapping("/me")
    public RatingResponse upsertMine(@AuthenticationPrincipal LoginMember loginMember,
                                     @PathVariable Long postId,
                                     @Valid @RequestBody RatingRequest request) {
        return ratingService.upsertMine(loginMember.id(), postId, request);
    }
}
