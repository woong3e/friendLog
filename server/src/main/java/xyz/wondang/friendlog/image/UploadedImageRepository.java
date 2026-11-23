package xyz.wondang.friendlog.image;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UploadedImageRepository extends JpaRepository<UploadedImage, Long> {

    /**
     * 정리 대상: cutoff 이전에 올렸고, 지금 썸네일·본문 이미지·아바타 어디에도 쓰이지 않는 파일.
     * 썸네일을 바꾸거나 글을 지워서 나중에 안 쓰이게 된 파일도 다음 실행 때 잡힌다.
     */
    @Query("""
            select u from UploadedImage u
            where u.createdAt < :cutoff
              and not exists (select 1 from Post p where p.thumbnailUrl = u.url)
              and not exists (select 1 from PostImage pi where pi.url = u.url)
              and not exists (select 1 from Member m where m.avatarUrl = u.url)
            order by u.id
            """)
    List<UploadedImage> findUnused(@Param("cutoff") LocalDateTime cutoff, Limit limit);
}
