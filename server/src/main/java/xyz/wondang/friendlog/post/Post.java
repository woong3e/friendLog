package xyz.wondang.friendlog.post;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import xyz.wondang.friendlog.common.BaseTimeEntity;
import xyz.wondang.friendlog.member.Member;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Post extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 글 N : 회원 1. post.member_id 외래 키로 연결
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id")
    private Member member;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(length = 500)
    private String summary;

    @Column(length = 500)
    private String thumbnailUrl;

    @Column(nullable = false)
    private LocalDateTime eventAt;

    // 글 1 : 본문 이미지 N. 외래 키는 post_image 쪽에 있으므로 mappedBy로 "주인은 저쪽"이라고 알려 준다.
    // 글과 함께 저장·삭제되고(cascade), 목록에서 빠진 이미지는 DB에서도 지운다(orphanRemoval).
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostImage> images = new ArrayList<>();

    public Post(Member member, String title, String content, String summary,
                String thumbnailUrl, LocalDateTime eventAt) {
        this.member = member;
        this.title = title;
        this.content = content;
        this.summary = summary;
        this.thumbnailUrl = thumbnailUrl;
        this.eventAt = eventAt;
    }

    public void addImage(String url) {
        images.add(new PostImage(this, url));
    }
}
