package xyz.wondang.friendlog.post;

import jakarta.validation.Valid;
import java.net.URI;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.wondang.friendlog.post.dto.PostCreateResponse;
import xyz.wondang.friendlog.post.dto.PostDetailResponse;
import xyz.wondang.friendlog.post.dto.PostRequest;

/**
 * 컨트롤러는 HTTP ↔ 자바 변환만 한다 (요청 검증, 상태 코드). 로직은 서비스에.
 *
 * TODO(2단계): X-Member-Id 헤더는 인증이 없는 1단계용 임시 방법. 로그인한 사용자로 바꾼다.
 */
@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {

    static final String MEMBER_ID_HEADER = "X-Member-Id";

    private final PostService postService;

    @PostMapping
    public ResponseEntity<PostCreateResponse> create(@RequestHeader(MEMBER_ID_HEADER) Long memberId,
                                                     @Valid @RequestBody PostRequest request) {
        Long id = postService.create(memberId, request);
        return ResponseEntity.created(URI.create("/posts/" + id)).body(new PostCreateResponse(id));
    }

    @GetMapping("/{postId}")
    public PostDetailResponse get(@PathVariable Long postId) {
        return postService.get(postId);
    }

    @PutMapping("/{postId}")
    public ResponseEntity<Void> update(@RequestHeader(MEMBER_ID_HEADER) Long memberId,
                                       @PathVariable Long postId,
                                       @Valid @RequestBody PostRequest request) {
        postService.update(memberId, postId, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> delete(@RequestHeader(MEMBER_ID_HEADER) Long memberId,
                                       @PathVariable Long postId) {
        postService.delete(memberId, postId);
        return ResponseEntity.noContent().build();
    }
}
