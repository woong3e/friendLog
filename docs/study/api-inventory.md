# 현재 기능 → 필요한 API 목록 (0단계 재료)

준비 단계에서 `src/api/` 로 모은 함수 목록. 각 함수가 곧 서버가 제공해야 할 기능이다.
REST 엔드포인트(URL, 메서드, 응답 형식)는 0단계에서 이 표를 보고 직접 설계한다.

## posts — [src/api/posts.ts](../../src/api/posts.ts)

| 함수 | 입력 | 출력 | 쓰는 곳 |
| --- | --- | --- | --- |
| `getPosts` | page(0부터), sort(`latest`·`oldest`·`rating_high`·`rating_low`) | Post[] (8개씩) | 메인 목록, 무한 스크롤 |
| `getPost` | id | Post | 글 보기, 글 수정 |
| `createPost` | 제목, 본문, 요약, 썸네일 URL, 이미지 URL 목록, 작성자 email, 모임 날짜 | 없음 | 글 등록 |
| `updatePost` | id + 위와 같음 | 없음 | 글 수정 |
| `deletePost` | id | 없음 | 글 삭제 |

## ratings — [src/api/ratings.ts](../../src/api/ratings.ts)

| 함수 | 입력 | 출력 | 쓰는 곳 |
| --- | --- | --- | --- |
| `getRatingSummary` | postId | 평균, 점수 분포(0.5점 단위 10칸) | 글 보기 평점 차트 |
| `getRatingsWithAuthor` | postId | 한줄평 목록(최신순) + 작성자 닉네임·아바타 | 글 보기 한줄평 |
| `hasRated` | postId, userId | boolean | 메인 카드 "평가함" 표시 |
| `upsertRating` | postId, userId, 별점, 코멘트, 닉네임 | 없음 | 평가 등록·수정 |

## profiles — [src/api/profiles.ts](../../src/api/profiles.ts)

| 함수 | 입력 | 출력 | 쓰는 곳 |
| --- | --- | --- | --- |
| `getProfile` | userId | Profile | 헤더 아바타, 내 설정, 글 작성, 평가 작성 |
| `getProfileByEmail` | email | Profile | 메인 카드·글 보기의 작성자 표시 |
| `updateNickname` | userId, 닉네임 | Profile | 내 설정 |
| `updateAvatarUrl` | userId, URL 또는 null | 없음 | 내 설정 (아바타 변경·삭제) |

## storage — [src/api/storage.ts](../../src/api/storage.ts)

| 함수 | 입력 | 출력 | 쓰는 곳 |
| --- | --- | --- | --- |
| `uploadImage` | 폴더(`thumbnail`·`avatar-image`·`content`), 파일 | 공개 URL | 썸네일, 아바타, 본문 이미지 |
| `deleteImageByUrl` | 공개 URL | 없음 | 썸네일 삭제, 아바타 삭제, 본문에서 지운 이미지 정리 |

## auth — [src/api/auth.ts](../../src/api/auth.ts)

| 함수 | 입력 | 출력 | 쓰는 곳 |
| --- | --- | --- | --- |
| `signUp` | email, 비밀번호, 닉네임 | 없음 (인증 메일 발송) | 회원가입 |
| `verifyEmailOtp` | email, 6자리 코드 | 로그인 정보 | 이메일 인증 |
| `signIn` | email, 비밀번호 | 로그인 정보 | 로그인 |
| `signOut` | 없음 | 없음 | 로그아웃 |
| `getSession` | 없음 | 로그인 정보 또는 null | 새로고침 직후 로그인 상태 복원 |
| `onAuthChange` | callback | 구독 해제 함수 | 로그인 상태 변화 감지 (토큰 갱신 등) |

로그인 정보(`AuthSession`)는 `{ user: { id, email, nickname } }`.

## 설계할 때 볼 것

- **작성자를 email로 연결함.** `getProfileByEmail` 이 존재하는 이유. 새 ERD에서는 member id로 연결한다.
- **카드마다 작성자 프로필을 따로 요청함.** 카드 8개면 8번. 글 목록 응답에 작성자 닉네임·아바타를 포함하면 없어지는 요청 (N+1과 같은 모양).
- **한줄평은 평가 + 프로필을 클라이언트에서 합침.** 서버에서는 조인 한 번.
- **평균·분포를 위해 별점을 전부 내려받음.** `getRatingSummary` 는 이미 "계산 결과" 모양이라, 서버가 계산해서 주면 함수 내부만 바꾸면 된다. 평균을 저장할지 매번 계산할지는 3단계에서 결정.
- **`posts.rating`(평균 평점) 컬럼을 누가 갱신하는지 코드에 없음.** Supabase 쪽 트리거나 함수일 가능성. 대시보드에서 확인 필요.
- **`ratings.nickname` 은 평가 당시 닉네임을 복사해 둔 값.** 화면은 profiles의 현재 닉네임을 쓴다. 새 ERD에서 필요한지 판단.
- **평가 upsert가 무엇을 기준으로 덮어쓰는지 코드만으로는 알 수 없음.** `(post_id, user_id)` 유니크 제약이 있는지 대시보드에서 확인. 새 ERD에서는 "한 사람이 글 하나에 평가 하나"를 유니크 제약으로 명시.
- **작성자 확인이 클라이언트에만 있음.** 서버에서는 수정·삭제 시 본인 확인 필수 (2단계).
- **이미 가입된 이메일로 가입하면 성공처럼 보이고 메일이 안 옴.** Supabase가 "가입된 이메일인지"를 숨기려고(계정 존재 여부 노출 방지) 성공 응답만 준다. 사용자는 인증 코드 화면에서 오지 않는 메일을 기다리게 됨. 2단계에서 정할 것: "이미 가입된 이메일입니다"를 알려 줄지(편의) vs 숨길지(보안). 친구 모임 서비스라 알려 주는 쪽도 합리적
- **회원가입 시 닉네임을 두 군데 저장함** (auth 메타데이터, profiles). 서버에서는 member 하나로 끝.
- **이미지 URL이 Supabase 주소 그대로 DB와 본문 마크다운에 들어감.** 7단계에서 S3 주소로 바꿔야 할 대상.

## 아직 Supabase 주소가 남은 곳

공개 이미지 4개가 Supabase Storage 주소로 코드에 직접 적혀 있음. 호출이 아니라 이미지 주소라 이번에는 두었다. `public/` 폴더로 옮기면 Supabase와 무관해진다.

- 기본 썸네일 [Card.tsx](../../src/components/Card.tsx)
- 월계관 이미지 2개 [StarRatings.tsx](../../src/components/StarRatings.tsx)
- 공유 미리보기 기본 이미지 [ToastViewer.tsx](../../src/pages/ToastViewer.tsx)
