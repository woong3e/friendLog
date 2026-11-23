package xyz.wondang.friendlog.auth.signup;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SignupVerificationRepository extends JpaRepository<SignupVerification, Long> {

    Optional<SignupVerification> findByEmail(String email);
}
