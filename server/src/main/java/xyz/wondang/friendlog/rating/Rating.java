package xyz.wondang.friendlog.rating;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import java.math.BigDecimal;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import xyz.wondang.friendlog.common.BaseTimeEntity;
import xyz.wondang.friendlog.member.Member;
import xyz.wondang.friendlog.post.Post;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Rating extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id")
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id")
    private Member member;

    // DECIMAL(2,1): 전체 2자리 중 소수 1자리 → 0.5 ~ 5.0
    @Column(nullable = false, precision = 2, scale = 1)
    private BigDecimal score;

    @Column(length = 500)
    private String comment;

    public Rating(Post post, Member member, BigDecimal score, String comment) {
        this.post = post;
        this.member = member;
        this.score = score;
        this.comment = comment;
    }
}
