# FRIENDLOG API 명세

> 0단계 설계. 테이블 구조는 [ERD.md](ERD.md). 기존 프론트 함수 목록은 [api-inventory.md](../study/api-inventory.md).
> 인증(2단계)·이미지(4단계) 부분은 해당 단계에서 다시 다듬는다.

## 공통 규칙

- 기본 주소: `https://api.wondang.xyz` (로컬: `http://localhost:8080`)
- JSON 필드 이름은 camelCase (`thumbnailUrl`)
- 시간은 ISO 8601, 한국 시간 기준: `"2025-12-27T11:00:00"`
- **인증:** 아래 "인증" 항목을 빼고 모든 API는 로그인이 필요하다. 요청 헤더에 `Authorization: Bearer {accessToken}`. 없거나 만료되면 `401`
- **성공 응답:** 감싸지 않고 데이터 그대로 보낸다. 성공/실패는 상태 코드로 구분
- **실패 응답:** 항상 아래 형식

```json
{
  "code": "POST_NOT_FOUND",
  "message": "게시글을 찾을 수 없습니다.",
  "errors": []
}
```

`errors` 는 입력 검증 실패(400)일 때만 채운다: `[{ "field": "title", "reason": "제목을 입력해주세요." }]`

## 한눈에 보기

| 메서드 | URL | 설명 | 단계 |
| --- | --- | --- | --- |
| GET | `/posts` | 글 목록 (페이징·정렬) | 1 |
| GET | `/posts/{postId}` | 글 상세 | 1 |
| POST | `/posts` | 글 등록 | 1 |
| PUT | `/posts/{postId}` | 글 수정 (작성자만) | 1 |
| DELETE | `/posts/{postId}` | 글 삭제 (작성자만) | 1 |
| GET | `/posts/{postId}/ratings` | 한줄평 목록 | 3 |
| GET | `/posts/{postId}/ratings/summary` | 평균·분포 | 3 |
| PUT | `/posts/{postId}/ratings/me` | 내 평가 등록·수정 | 3 |
| GET | `/members/me` | 내 정보 | 2 |
| PATCH | `/members/me` | 닉네임·아바타 수정 | 3 |
| POST | `/auth/signup` | 회원가입 + 인증 코드 발송 | 2 |
| POST | `/auth/signup/verify` | 인증 코드 확인 | 2 |
| POST | `/auth/signup/resend` | 인증 코드 재발송 | 2 |
| POST | `/auth/login` | 로그인 | 2 |
| POST | `/auth/refresh` | 액세스 토큰 재발급 | 2 |
| POST | `/auth/logout` | 로그아웃 | 2 |
| POST | `/images/presigned-url` | 이미지 업로드용 URL 발급 | 4 |

1단계는 인증 없이 만들므로, 1단계 동안은 작성자를 요청 값(임시)으로 받는다.

---

## 게시글

### `GET /posts` 글 목록

무한 스크롤용. 오프셋 페이징 + Slice(전체 개수 없이 다음 페이지 여부만).

| 쿼리 | 기본값 | 설명 |
| --- | --- | --- |
| `page` | 0 | 0부터 시작 |
| `size` | 8 | |
| `sort` | `latest` | `latest`(모임 최신순), `oldest`, `rating_high`, `rating_low` |

`200 OK`
```json
{
  "content": [
    {
      "id": 159,
      "title": "2025년 연말 모임",
      "summary": "2025년 연말 모임",
      "thumbnailUrl": null,
      "eventAt": "2025-12-27T11:00:00",
      "averageScore": 5.0,
      "ratedByMe": true,
      "author": { "id": 3, "nickname": "노기", "avatarUrl": null }
    }
  ],
  "hasNext": true
}
```

- `author` 를 목록에 포함 → 카드마다 작성자 프로필을 따로 요청하던 문제(카드 8개 = 요청 8번)가 없어진다
- `ratedByMe` 를 목록에 포함 → 카드마다 "내가 평가했는지" 요청하던 것도 없어진다
- `averageScore` 는 평가가 없으면 `null`. 평점순 정렬에서 `null` 은 맨 뒤

### `GET /posts/{postId}` 글 상세

`200 OK`
```json
{
  "id": 159,
  "title": "2025년 연말 모임",
  "content": "### 주제: 2025년 연말 모임\n...",
  "summary": "2025년 연말 모임",
  "thumbnailUrl": null,
  "eventAt": "2025-12-27T11:00:00",
  "imageUrls": ["https://.../a.webp"],
  "author": { "id": 3, "nickname": "노기", "avatarUrl": null },
  "createdAt": "2025-12-20T21:13:05",
  "updatedAt": "2025-12-21T10:02:11"
}
```

`404 POST_NOT_FOUND`

### `POST /posts` 글 등록

요청
```json
{
  "title": "2025년 연말 모임",
  "content": "### 주제: ...",
  "summary": "2025년 연말 모임",
  "thumbnailUrl": "https://.../thumb.webp",
  "eventAt": "2025-12-27T11:00:00",
  "imageUrls": ["https://.../a.webp"]
}
```

| 필드 | 검증 |
| --- | --- |
| title | 필수, 100자 이하 |
| content | 필수 |
| summary | 500자 이하 |
| eventAt | 필수 |
| thumbnailUrl, imageUrls | 선택 |

`201 Created` + `Location: /posts/160`
```json
{ "id": 160 }
```

`400 INVALID_INPUT`

작성자는 요청 값이 아니라 **로그인한 사람**으로 서버가 정한다 (2단계부터).

### `PUT /posts/{postId}` 글 수정

요청 본문은 등록과 같다 (통째로 교체). `imageUrls` 도 전체 목록을 보내고, 서버가 `post_image` 를 그 목록으로 맞춘다.

`204 No Content`

`400 INVALID_INPUT` · `403 POST_FORBIDDEN` (작성자가 아님) · `404 POST_NOT_FOUND`

### `DELETE /posts/{postId}` 글 삭제

`204 No Content` — 평가·본문 이미지 기록도 함께 삭제

`403 POST_FORBIDDEN` · `404 POST_NOT_FOUND`

---

## 평가

### `GET /posts/{postId}/ratings` 한줄평 목록

최신순. 글당 평가가 많지 않으므로 페이징 없이 전체.

`200 OK`
```json
[
  {
    "id": 41,
    "score": 5.0,
    "comment": "잘만들었네요",
    "author": { "id": 7, "nickname": "루다아빠다", "avatarUrl": null },
    "createdAt": "2025-12-28T00:12:44"
  }
]
```

작성자 정보를 조인해서 한 번에 → 평가와 프로필을 따로 받아 프론트에서 합치던 것이 없어진다.

### `GET /posts/{postId}/ratings/summary` 평균·분포

`200 OK`
```json
{
  "average": 4.75,
  "count": 4,
  "distribution": [0, 0, 0, 0, 0, 0, 0, 0, 1, 3]
}
```

`distribution` 은 0.5점부터 5.0점까지 10칸의 인원 수. 평가가 없으면 `average: null`.
별점을 전부 내려받아 프론트에서 계산하던 것을 서버가 계산한다.

### `PUT /posts/{postId}/ratings/me` 내 평가 등록·수정

없으면 만들고 있으면 교체한다. 멱등이라 여러 번 보내도 평가는 하나.

요청
```json
{ "score": 4.5, "comment": "재밌었다" }
```

| 필드 | 검증 |
| --- | --- |
| score | 필수, 0.5~5.0, 0.5 단위 |
| comment | 500자 이하 |

`200 OK` — 저장된 평가 (목록 항목과 같은 모양 + `updatedAt`)

구현: MySQL `INSERT ... ON DUPLICATE KEY UPDATE` — 같은 사람이 동시에 여러 번 보내도 평가는 하나 (테스트로 확인).

`400 INVALID_INPUT` · `404 POST_NOT_FOUND`

---

## 회원

### `GET /members/me` 내 정보

새로고침 직후 로그인 상태 복원, 헤더 아바타, 설정 화면에서 사용.

`200 OK`
```json
{ "id": 3, "email": "a@example.com", "nickname": "노기", "avatarUrl": null }
```

### `PATCH /members/me` 닉네임·아바타 수정

보낸 필드만 바꾼다. 아바타 삭제는 `"avatarUrl": null`.

요청
```json
{ "nickname": "새닉네임" }
```

`200 OK` — 바뀐 내 정보

`400 INVALID_INPUT` (닉네임 1~30자, 닉네임 `null` 불가)

---

## 인증 (2단계 구현 완료)

흐름은 지금 서비스와 같게 잡았다: 가입 → 메일로 6자리 코드 → 코드 확인하면 가입 완료 + 로그인.

| API | 요청 | 성공 | 실패 |
| --- | --- | --- | --- |
| `POST /auth/signup` | `{ email, password, nickname }` | `202 Accepted` (코드 발송) | `400`, `409 EMAIL_DUPLICATED`, `429 TOO_MANY_REQUESTS`(60초 안에 다시 신청) |
| `POST /auth/signup/verify` | `{ email, code }` | `200` 토큰 발급 | `400 INVALID_VERIFICATION_CODE`, `400 VERIFICATION_CODE_EXPIRED`, `400 VERIFICATION_NOT_FOUND`, `429 VERIFICATION_ATTEMPTS_EXCEEDED`(5번 틀림) |
| `POST /auth/signup/resend` | `{ email }` | `202` | `429 TOO_MANY_REQUESTS` (재전송 제한) |
| `POST /auth/login` | `{ email, password }` | `200` 토큰 발급 | `401 INVALID_CREDENTIALS` |
| `POST /auth/refresh` | 리프레시 토큰 쿠키 | `200` 새 토큰 한 쌍 (리프레시 회전) | `401 INVALID_REFRESH_TOKEN` |
| `POST /auth/logout` | — | `204` | |

토큰 발급 응답 (본문 + `Set-Cookie: refresh_token=...; HttpOnly; SameSite=Lax; Path=/auth`)
```json
{ "accessToken": "eyJ...", "member": { "id": 3, "email": "...", "nickname": "노기", "avatarUrl": null } }
```

2단계에서 정한 것:
- 액세스 토큰(JWT, 30분)은 본문으로 → 프론트가 메모리에 들고 `Authorization` 헤더로 보냄
- 리프레시 토큰(무작위 문자열, 14일)은 HttpOnly 쿠키 → 자바스크립트가 못 읽음. DB에는 해시만, 쓸 때마다 회전
- 이미 가입된 이메일은 409로 알림 (친구 모임 서비스라 편의 우선)
- 로그인 실패는 이메일 없음·비밀번호 틀림을 구분하지 않음 (`INVALID_CREDENTIALS`)

---

## 이미지 (4단계에서 확정)

### `POST /images/presigned-url`

요청
```json
{ "folder": "thumbnail", "contentType": "image/webp" }
```

`200 OK`
```json
{
  "uploadUrl": "https://friendlog.s3...amazonaws.com/thumbnail/....webp?X-Amz-Signature=...",
  "imageUrl": "https://.../thumbnail/....webp"
}
```

프론트는 `uploadUrl` 로 S3에 직접 PUT하고, 글·프로필에는 `imageUrl` 을 저장한다.
삭제 API는 두지 않는다 — 쓰이지 않는 이미지는 서버가 `@Scheduled` 로 정리 (지금처럼 프론트가 지우지 않음).

---

## 에러 코드

| 코드 | 상태 | 상황 |
| --- | --- | --- |
| `INVALID_INPUT` | 400 | 입력 검증 실패 (`errors` 에 필드별 이유) |
| `UNAUTHORIZED` | 401 | 토큰 없음·만료 |
| `INVALID_CREDENTIALS` | 401 | 이메일 또는 비밀번호 틀림 |
| `POST_FORBIDDEN` | 403 | 남의 글 수정·삭제 |
| `POST_NOT_FOUND` | 404 | |
| `MEMBER_NOT_FOUND` | 404 | |
| `EMAIL_DUPLICATED` | 409 | 이미 가입된 이메일 |
| `INVALID_VERIFICATION_CODE` | 400 | |
| `VERIFICATION_CODE_EXPIRED` | 400 | |
| `VERIFICATION_NOT_FOUND` | 400 | 가입 신청 없이 인증·재전송 |
| `VERIFICATION_ATTEMPTS_EXCEEDED` | 429 | 코드 5번 틀림 → 재전송 필요 |
| `INVALID_REFRESH_TOKEN` | 401 | 리프레시 토큰 없음·만료·이미 사용 |
| `MAIL_SEND_FAILED` | 503 | 메일 서버 오류 |
| `TOO_MANY_REQUESTS` | 429 | 인증 코드 재전송 60초 제한 |
| `INTERNAL_ERROR` | 500 | 예상하지 못한 오류 (메시지에 내부 정보 노출 금지) |

---

## 프론트 함수 → API 대응 (5단계 참고)

| `src/api` 함수 | API |
| --- | --- |
| `getPosts(page, sort)` | `GET /posts?page=&sort=` |
| `getPost(id)` | `GET /posts/{id}` |
| `createPost` / `updatePost` / `deletePost` | `POST /posts` / `PUT /posts/{id}` / `DELETE /posts/{id}` |
| `getRatingSummary` | `GET /posts/{id}/ratings/summary` |
| `getRatingsWithAuthor` | `GET /posts/{id}/ratings` |
| `hasRated` | **없어짐** — 목록의 `ratedByMe` |
| `upsertRating` | `PUT /posts/{id}/ratings/me` |
| `getProfile(내 id)` | `GET /members/me` |
| `getProfile(남 id)` | **없어짐** — 평가 모달은 내 닉네임만 필요 → `/members/me` |
| `getProfileByEmail` | **없어짐** — 목록·상세 응답의 `author` |
| `updateNickname` / `updateAvatarUrl` | `PATCH /members/me` |
| `uploadImage` | `POST /images/presigned-url` + S3 PUT |
| `deleteImageByUrl` | **없어짐** — 서버 스케줄러가 정리 |
| `signUp` / `verifyEmailOtp` | `POST /auth/signup` / `POST /auth/signup/verify` |
| `signIn` / `signOut` | `POST /auth/login` / `POST /auth/logout` |
| `getSession` / `onAuthChange` | `GET /members/me` + 토큰 재발급 흐름 (5단계) |
