package xyz.wondang.friendlog.rating.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record RatingRequest(
        @NotNull(message = "별점을 선택해주세요.")
        @DecimalMin(value = "0.5", message = "별점은 0.5 이상입니다.")
        @DecimalMax(value = "5.0", message = "별점은 5.0 이하입니다.")
        BigDecimal score,

        @Size(max = 500, message = "한줄평은 500자 이하로 입력해주세요.")
        String comment
) {
    // 0.5 단위만 허용 (4.3 같은 값 거절). 검증 실패 시 field 이름은 "scoreInHalfSteps"
    @AssertTrue(message = "별점은 0.5 단위로 입력해주세요.")
    public boolean isScoreInHalfSteps() {
        return score == null || score.remainder(new BigDecimal("0.5")).signum() == 0;
    }
}
