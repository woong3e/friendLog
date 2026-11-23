package xyz.wondang.friendlog.post;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.wondang.friendlog.common.exception.BusinessException;
import xyz.wondang.friendlog.common.exception.ErrorCode;
import xyz.wondang.friendlog.member.Member;
import xyz.wondang.friendlog.member.MemberRepository;
import xyz.wondang.friendlog.post.dto.PostDetailResponse;
import xyz.wondang.friendlog.post.dto.PostRequest;
import xyz.wondang.friendlog.post.dto.PostSliceResponse;
import xyz.wondang.friendlog.post.dto.PostSummaryResponse;
import xyz.wondang.friendlog.rating.RatingRepository;

/**
 * 트랜잭션 경계는 서비스 메서드 하나 = 트랜잭션 하나.
 * 클래스에 readOnly = true를 걸고, 쓰기 메서드에만 @Transactional을 다시 붙인다.
 * (readOnly면 Hibernate가 변경 감지를 위한 스냅샷을 만들지 않아 조회가 가벼워진다)
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final MemberRepository memberRepository;
    private final RatingRepository ratingRepository;
    private final PostListQuery postListQuery;

    @Transactional
    public Long create(Long memberId, PostRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        Post post = new Post(member, request.title(), request.content(), request.summary(),
                request.thumbnailUrl(), request.eventAt());
        request.imageUrlsOrEmpty().stream().distinct().forEach(post::addImage);

        return postRepository.save(post).getId(); // 이미지는 cascade로 함께 저장
    }

    /**
     * 메인 목록. 쿼리 3번으로 카드에 필요한 정보를 모은다 (PostListQuery 참고).
     * memberId가 없으면(비로그인) ratedByMe는 모두 false.
     */
    public PostSliceResponse getList(Long memberId, PostSort sort, int page, int size) {
        List<PostListQuery.PostScore> scores = postListQuery.findPostScores(sort, page, size);
        boolean hasNext = scores.size() > size;
        if (hasNext) {
            scores = scores.subList(0, size);
        }

        List<Long> ids = scores.stream().map(PostListQuery.PostScore::postId).toList();
        Map<Long, Post> posts = postListQuery.findPostsWithMember(ids);
        Set<Long> ratedIds = new HashSet<>(postListQuery.findRatedPostIds(memberId, ids));

        // 1번 쿼리의 정렬 순서를 유지하면서 합친다
        List<PostSummaryResponse> content = scores.stream()
                .map(score -> PostSummaryResponse.of(
                        posts.get(score.postId()),
                        score.averageScore(),
                        ratedIds.contains(score.postId())))
                .toList();
        return new PostSliceResponse(content, hasNext);
    }

    public PostDetailResponse get(Long postId) {
        Post post = findWithMember(postId);
        // 트랜잭션 안에서 DTO로 바꾼다. 밖으로 나가면 LAZY인 이미지 목록을 읽을 수 없다 (open-in-view: false)
        return PostDetailResponse.from(post);
    }

    @Transactional
    public void update(Long memberId, Long postId, PostRequest request) {
        Post post = findWithMember(postId);
        checkAuthor(post, memberId);

        post.update(request.title(), request.content(), request.summary(),
                request.thumbnailUrl(), request.eventAt());
        post.replaceImages(request.imageUrlsOrEmpty());
        // save() 호출 없음: 트랜잭션이 끝날 때 바뀐 필드를 감지해서 UPDATE (변경 감지)
    }

    @Transactional
    public void delete(Long memberId, Long postId) {
        Post post = findWithMember(postId);
        checkAuthor(post, memberId);

        // rating이 post를 외래 키로 참조하므로 평가부터 지운다. 이미지는 cascade로 함께 삭제
        ratingRepository.deleteAllByPostId(postId);
        postRepository.delete(post);
    }

    private Post findWithMember(Long postId) {
        return postRepository.findWithMemberById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));
    }

    private void checkAuthor(Post post, Long memberId) {
        if (!post.isWrittenBy(memberId)) {
            throw new BusinessException(ErrorCode.POST_FORBIDDEN);
        }
    }
}
