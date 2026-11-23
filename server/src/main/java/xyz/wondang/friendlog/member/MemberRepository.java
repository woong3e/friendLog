package xyz.wondang.friendlog.member;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member, Long> {

    // 메서드 이름만으로 Spring Data가 쿼리를 만든다: select ... where email = ?
    Optional<Member> findByEmail(String email);

    boolean existsByEmail(String email);
}
