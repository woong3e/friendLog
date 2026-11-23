# 학습 기록

대화마다 하나씩, 최신이 위로.

> 1~5단계는 Claude가 구현·커밋하고 사용자가 나중에 코드를 읽는 방식으로 진행 (2026-11-23 결정). 5단계까지 완료.
> 아래 단계별 기록의 "읽는 순서"를 따라가면 된다.

---

## 2026-11-23 · 5단계: 프론트 전환

브랜치: `feat/cors` → main (서버 CORS), `feat/api-migration` (프론트, **main에 머지하지 않음** — 7단계 전환 때 머지)

**읽는 순서** (`frontend/src/`)
1. `api/client.ts` (토큰 보관, 401 → 재발급 → 재시도, single-flight)
2. `api/auth.ts` (세션 복원·로그인 상태 알림) → `App.tsx`
3. `api/posts.ts`, `ratings.ts`, `members.ts`, `storage.ts` (서버 응답 타입, Presigned URL 업로드)
4. 컴포넌트: `components/Card.tsx`(목록 응답만 사용), `pages/ToastViewer.tsx`, `components/EditorModal.tsx`
5. 서버 쪽: `server/.../auth/security/SecurityConfig.corsConfigurationSource`

**개념**
- CORS: 다른 출처(5173 → 8080) 요청은 브라우저가 막고, 서버가 허용 헤더로 풀어 준다. 쿠키를 주고받으려면 `credentials: 'include'` + 서버 `allowCredentials` + 출처 목록 지정(* 불가)
- 토큰 보관: 액세스 토큰은 메모리(XSS로 localStorage 읽기 방지), 새로고침하면 사라지므로 HttpOnly 리프레시 쿠키로 다시 받음
- 재발급 흐름: API가 401 → `/auth/refresh` → 새 토큰으로 같은 요청 재시도. 리프레시 토큰이 회전하므로 동시 재발급을 하나로 합침 (single-flight)
- API 계층 분리의 효과: 준비 단계에서 `src/api` 로 모아 둬서, 바뀐 건 api 파일 + 응답 모양이 달라진 컴포넌트 몇 곳

**결정 (Claude가 추천안으로 정함)**
| 결정 | 이유 |
| --- | --- |
| 응답 타입을 서버 그대로(camelCase)로, 컴포넌트를 고침 | 예전 모양으로 변환해 맞추면 "카드마다 요청" 같은 구조를 못 없앰 |
| 이미지 삭제 호출 제거 | 서버 정리 스케줄러로 일원화 (4단계) |
| 별점 없이 제출하면 막음 | 서버가 0.5~5.0만 받음. 기존에는 0점이 저장되기도 했음 |
| 서버 에러 메시지를 alert로 | 기존 화면은 실패해도 아무 반응이 없었음 (예: 이미 가입된 이메일) |
| 7단계까지 브랜치로 유지 | main은 운영(Supabase) 그대로 배포되어야 하므로 |

**발견했지만 그대로 둔 기존 문제** (이번 범위 밖)
- `EditorModal`·`UserSettings` 등에 React Hook 규칙 위반 lint 에러 (조건부 hook 호출) — 기존 코드
- `usePostStore.setImageUrlArr` 가 덮어쓰지 않고 이어 붙임 → 글 불러오기에는 `replaceImageUrlArr` 를 추가해서 사용
- 별점 라이브러리 `react-rating-stars-component` 의 defaultProps 경고

**6·7단계로 넘길 것**
- 운영 환경 변수: 프론트 `VITE_API_URL=https://api.wondang.xyz`, 서버 `CORS_ALLOWED_ORIGINS=https://www.wondang.xyz`, `REFRESH_COOKIE_SECURE=true`, `JWT_SECRET`, DB·메일(SMTP)·S3 설정
- 운영 메일 발송 서비스 선택 (Supabase 기본 메일 대신. 예: AWS SES)
- 7단계: 기존 회원 이전(비밀번호 해시), 이미지 URL 교체, `feat/api-migration` 머지 → Vercel 배포

---

## 2026-11-23 · 4단계: 이미지

브랜치: `feat/image-upload` → main

**읽는 순서** (`server/src/main/java/xyz/wondang/friendlog/image/`)
1. `ImageController` (업로드 흐름 주석) → `ImageService.issueUploadUrl`
2. `ImageStorage` → `S3ImageStorage` (Presigned URL 서명)
3. `resources/db/migration/V3__create_uploaded_image.sql` → `UploadedImageRepository.findUnused` → `ImageService.cleanupUnused` → `ImageCleanupScheduler`
4. 테스트: `image/ImageApiTest`

**개념**
- Presigned URL: 서버가 서명만 해 주고 브라우저가 S3에 직접 올림 → 이미지가 서버를 거치지 않음. 서명은 로컬 계산이라 S3 요청이 없음
- 서명에 Content-Type 포함 → 다른 형식으로 바꿔 올릴 수 없음
- 인터페이스로 저장소를 감싸서(ImageStorage) 테스트에서는 삭제만 가짜로 (`@MockitoSpyBean`)
- `@Scheduled` cron, `NOT EXISTS` 서브쿼리로 "어디에도 쓰이지 않음" 판단

**결정 (Claude가 추천안으로 정함)**
| 결정 | 이유 |
| --- | --- |
| 발급 기록 테이블 + 참조 여부로 정리 | 업로드 완료 여부를 서버가 알 수 없어도, "쓰이는지"만 보면 됨. 썸네일 교체·글 삭제로 나중에 버려진 파일도 함께 정리 |
| 24시간 유예 | 글을 오래 쓰는 중인 이미지를 지우지 않게 |
| 파일 이름은 서버가 UUID로 | 덮어쓰기·경로 조작 방지, 이름 충돌 없음 |
| 삭제 API 없음 | 프론트가 지우던 방식(실패하면 파일이 남음)을 서버 정리로 일원화 |
| 기존 Supabase 이미지는 기록하지 않음 | 7단계에서 옮긴 파일이 정리 대상이 되지 않도록 |
| 로컬은 S3Mock | MinIO 공식 이미지 배포 중단. LocalStack보다 가볍고 CORS·공개 읽기가 됨 |
| 파일 크기 제한은 프론트 압축에 의존 | Presigned PUT은 크기를 강제할 수 없음 (POST 정책 방식이 대안, 필요하면 6단계 이후) |

**운영(6단계)에서 할 일**: S3 버킷 생성, 공개 읽기(버킷 정책 또는 CloudFront), CORS에 `https://www.wondang.xyz` PUT 허용, 서버 IAM 역할에 `s3:PutObject`·`s3:DeleteObject`

---

## 2026-11-23 · 3단계: 평가·프로필

브랜치: `feat/rating-profile` → main

**읽는 순서** (`server/src/main/java/xyz/wondang/friendlog/`)
1. `rating/RatingController` → `rating/RatingService` → `rating/RatingRepository` (upsert 네이티브 쿼리)
2. `member/MemberController` → `MemberService.updateMe` → `member/dto/MemberUpdateRequest`
3. 테스트: `rating/RatingApiTest`, `rating/RatingConcurrencyTest`, `member/MemberApiTest`

**개념**
- 집계 쿼리: 점수별 `GROUP BY` 한 번으로 평균과 분포를 같이 계산
- upsert와 동시성: "조회 후 없으면 INSERT"는 동시 요청에서 둘 다 INSERT → 유니크 위반. `INSERT ... ON DUPLICATE KEY UPDATE` 로 DB가 한 문장으로 처리
- 트랜잭션 격리 수준과 MVCC: MySQL 기본 REPEATABLE READ는 트랜잭션 첫 조회 시점의 스냅샷을 계속 읽음 → 다른 트랜잭션이 커밋한 행이 안 보일 수 있음. 실제 동시성 테스트에서 재현 후 `READ_COMMITTED` 로 해결
- PATCH의 부분 수정: "필드 없음"과 "null"을 구분해야 함

**결정 (Claude가 추천안으로 정함)**
| 결정 | 이유 |
| --- | --- |
| 평균은 저장하지 않음 (1단계에서 결정) | 비정규화하면 평가마다 동기화와 동시성 처리가 필요. 규모상 계산이 충분히 싸다 |
| 평가 upsert는 네이티브 쿼리 | JPQL에는 upsert가 없음. MySQL 전용이 되지만 DB를 바꿀 계획이 없음 |
| 자기 글에도 평가 가능 | 기존 서비스 동작 유지. 시상식에서 "본인 모임 투표 불가"는 8단계 규칙 |
| `ratings.nickname` 없음 | 화면은 member 조인으로 현재 닉네임 표시 |
| 닉네임은 지울 수 없음 (`null` → 400), 아바타는 `null` 로 삭제 | |

---

## 2026-11-23 · 2단계: 인증

브랜치: `feat/auth` → main

**읽는 순서** (`server/src/main/java/xyz/wondang/friendlog/`)
1. `resources/db/migration/V2__create_auth_tables.sql`
2. `auth/security/SecurityConfig` → `JwtAuthenticationFilter` → `SecurityErrorHandlers` (요청이 컨트롤러에 오기 전)
3. `auth/jwt/JwtProvider` (액세스 토큰)
4. `auth/AuthController` → `auth/signup/SignupService` → `SignupVerification` (가입)
5. `auth/AuthService` → `auth/refresh/RefreshTokenService` (로그인·재발급·로그아웃)
6. 테스트: `auth/AuthApiTest`, `auth/VerificationAttemptsTest`

**개념**
- Spring Security 필터 체인: 요청 → 필터들 → 인가 검사 → 컨트롤러. JWT 필터는 로그인 정보만 채우고, 막는 건 인가 단계
- 세션 대신 JWT (STATELESS): 서버가 상태를 갖지 않고 서명으로 신원 확인. 대신 취소가 안 되니 짧게(30분)
- 리프레시 토큰은 서버에 기록(해시) → 로그아웃·회전으로 무효화 가능
- 비밀번호 해시 bcrypt (salt + 느린 계산)
- 쿠키 속성: HttpOnly(XSS), Secure(https), SameSite=Lax(CSRF), Path
- 트랜잭션과 예외: 기본은 RuntimeException이면 롤백. 틀린 횟수를 저장하고 예외를 던지려면 `noRollbackFor`
- 테스트의 함정 두 가지
  - 테스트 전체가 트랜잭션 하나면 롤백 버그를 못 잡음 → `VerificationAttemptsTest` 는 트랜잭션 없이
  - 벌크 update는 영속성 컨텍스트를 건너뜀 → `em.clear()` 필요 (`AuthApiTest.만료된_코드는_400`)

**결정 (Claude가 추천안으로 정함)**
| 결정 | 이유 |
| --- | --- |
| 가입 대기 정보를 별도 테이블에, 인증 후 member 생성 | member에 "미인증 회원"이 섞이지 않음. 버려진 신청은 member를 더럽히지 않음 |
| 이미 가입된 이메일은 409로 알림 | 친구 모임 서비스라 편의 우선 (Supabase처럼 숨기면 사용자가 오지 않는 메일을 기다림) |
| 로그인 실패는 구분 없이 401 | 이메일 존재 여부 노출 방지 |
| 코드 10분, 재전송 60초, 5회 | 흔한 기본값 |
| 액세스 토큰은 본문, 리프레시는 HttpOnly 쿠키 | 액세스는 메모리에(새로고침 시 쿠키로 재발급), 리프레시는 JS가 못 읽게 |
| 리프레시 토큰은 JWT가 아닌 무작위 값 + DB 해시 + 회전 | 어차피 DB에서 확인하는 토큰이라 내용 불필요. 탈취돼도 한 번 쓰이면 끝 |
| Redis 없이 MySQL | 규모상 충분, 운영할 컴포넌트를 줄임 |
| 메일 발송을 트랜잭션 안에서 | 발송 실패 시 가입 정보도 롤백. 대신 메일 서버가 느리면 DB 연결을 오래 잡음 (규모상 감수) |
| jjwt 라이브러리 + 직접 만든 필터 | 필터 체인 동작을 코드로 볼 수 있게 (Spring의 oauth2-resource-server도 대안) |

---

## 2026-11-23 · 1단계: 로컬 환경 + 게시글 CRUD

브랜치: `feat/post-crud` → main

**읽는 순서** (`server/src/main/java/xyz/wondang/friendlog/`)
1. `resources/db/migration/V1__create_tables.sql` → `member/Member`, `post/Post`, `post/PostImage`, `rating/Rating`, `common/BaseTimeEntity`
2. `post/PostController` → `post/PostService` (등록·조회·수정·삭제)
3. `post/PostSort`, `post/PostListQuery`, `PostService.getList` (목록)
4. `common/exception/*` (에러 응답)
5. 테스트: `src/test/.../post/PostApiTest`, `PostListApiTest`

**개념**
- Spring Boot starter·자동 설정, Docker Compose, Flyway(버전별 SQL, checksum), `ddl-auto: validate`
- JPA 매핑: `@Entity`, `@ManyToOne(LAZY)`, `@OneToMany(mappedBy, cascade, orphanRemoval)`, 연관관계의 주인
- 영속성 컨텍스트와 변경 감지: `PostService.update` 는 `save()` 없이 필드만 바꾸고 커밋 때 UPDATE
- 트랜잭션: 클래스에 `readOnly = true`, 쓰기 메서드에만 `@Transactional`. `open-in-view: false` 라서 LAZY는 서비스 안에서 DTO로 변환
- N+1: 카드마다 작성자·평점을 따로 조회하면 쿼리가 카드 수만큼 늘어남 → 페이지당 3번으로 고정 (`PostListQuery`), 테스트로 쿼리 수 검증
- Slice: COUNT 없이 size+1개를 가져와 다음 페이지 여부만 판단
- `@RestControllerAdvice` 로 예외를 한 곳에서 `{ code, message, errors }` 로 변환

**결정 (Claude가 추천안으로 정함)**
| 결정 | 이유 |
| --- | --- |
| Flyway + validate | 운영 DB 변경 이력 관리, 7단계 이전·배포까지 같은 SQL |
| MySQL 포트 3307 | 이 Mac에 설치된 MySQL이 3306 사용 중 |
| 평균 평점은 저장하지 않고 매번 GROUP BY | 글 수백 개 규모라 계산 비용이 작고, 저장하면 평가 등록마다 동기화·동시성 문제가 생김 (3단계 질문을 여기서 결정) |
| 글 삭제 시 평가는 벌크 DELETE, 이미지는 JPA cascade | 평가는 `Post` 와 단방향이라 서비스에서 직접 지움. DB `ON DELETE CASCADE` 는 JPA가 모르는 삭제라 쓰지 않음 |
| 정렬 동점 시 id를 마지막 기준 | 같은 날짜·같은 평점이면 페이지 사이에 중복·누락이 생길 수 있어서 |
| 테스트는 Testcontainers MySQL | H2는 MySQL과 문법·동작이 달라서. 로컬 DB와도 분리 |
| 1단계 작성자는 `X-Member-Id` 헤더 | 인증 전 임시. 2단계에서 로그인 사용자로 교체 |

---

## 2026-11-23 · 0단계: ERD와 API 명세

브랜치: `design/erd-api` (커밋 전)

**배운 개념**
- 정규화: 같은 사실은 한 곳에만. `ratings.nickname` 복사본, email로 작성자 연결, JSON 문자열에 묶인 이미지 목록이 반례
- 연관관계: N 쪽이 1 쪽의 id를 외래 키로 가진다 (post.member_id → member.id). 1단계 JPA의 `@ManyToOne` 으로 이어짐
- REST: URL은 자원(명사), 동작은 메서드, 결과는 상태 코드. PUT은 통째로 교체, PATCH는 일부 수정
- 멱등성: 같은 요청을 여러 번 보내도 결과가 같음 (GET·PUT·DELETE는 멱등, POST는 아님)

**결정한 것**
- PK는 BIGINT 자동 증가 (uuid는 7단계에서 대응표로 변환)
- 본문 이미지는 `post_image` 테이블로 분리, 별점은 DECIMAL(2,1), 모임 시간은 `event_at` DATETIME 컬럼
- 페이징은 오프셋 + Slice, 평가는 `PUT /posts/{id}/ratings/me`, 성공 응답은 감싸지 않고 에러 형식만 통일
- 목록 응답에 `author`, `ratedByMe` 를 포함해서 카드마다 보내던 요청을 없앰

**만든 것**
- [docs/design/ERD.md](../design/ERD.md), [docs/design/API.md](../design/API.md)

**다음 할 일**
- 1단계: `friendlog-server` 레포 생성, Docker Compose MySQL, 엔티티, 게시글 CRUD

---

## 2026-11-23 · 준비 단계: Supabase 호출을 `src/api/` 로 모으기

브랜치: `refactor/api-layer` (커밋 전)

**배운 개념**
- API 계층 분리: 컴포넌트는 "무엇을"(`getPost(id)`)만, `src/api/*.ts` 가 "어떻게"(Supabase 문법)를 안다. 5단계에서 서버로 바꿀 때 api 파일 내부만 고치면 된다
- 그러려면 api 함수가 Supabase 흔적을 밖으로 내보내지 않아야 한다: 평범한 입력, 데이터만 반환, 타입은 직접 정의(`Post`, `Profile`, `AuthSession`)
- 에러는 `{ error }` 반환 대신 throw로 통일 → 컴포넌트는 try/catch, React Query는 throw를 에러 상태로 자동 처리

**만든 것**
- `src/api/` : posts, ratings, profiles, storage, auth, supabaseClient (Supabase 클라이언트도 여기로 옮김)
- `useAuthStore` 가 Supabase `Session` 대신 `AuthSession { user: { id, email, nickname } }` 을 저장
- 쓰이지 않던 `utils/storage.ts` 삭제
- [api-inventory.md](api-inventory.md): 0단계 설계 재료

**동작이 바뀐 곳**
- 글 삭제 실패 시: 전에는 그냥 메인으로 이동 → 이제 알림 후 머무름
- 로그인 실패 시: 전에는 (세션 없이) 메인으로 이동 → 이제 로그인 페이지에 머무름
- 썸네일·아바타 업로드 실패 시: 전에는 실패해도 URL을 저장 → 이제 저장하지 않음

- 공개 이미지 4개를 `public/images/assets/` 로 옮김. 공유 미리보기 이미지는 아이폰 원본이라 GPS 좌표가 들어 있었음 → 1200px로 줄이고 EXIF 제거 (`og-default.jpg`)

**확인한 것** (헤드리스·일반 Chrome + Playwright, 쓰기 요청은 차단한 상태로)
- 비로그인 → /login 이동, 잘못된 로그인 → 로그인 페이지에 머무름
- 목록 8개, 정렬 4종, 무한 스크롤(8 → 32), 이미지 로드 실패 0
- 글 보기: 월계관(새 경로), 평균 5.00, 차트, 한줄평 2개 / 수정 화면에 본문 불러오기 / 설정 화면 닉네임
- 콘솔 에러·4xx 없음

**다음 할 일**
- 쓰기 동작은 테스트 계정으로 직접 확인 후 커밋
- 0단계 설계 (ERD, API 명세)

---

## 2026-11-23 · 기술 결정

**배운 개념**
- RDS vs EC2 안 Docker MySQL: 차이는 "DB를 누가 관리하느냐". 앱은 어느 쪽이든 Docker로 띄운다
  - RDS: 자동 백업·특정 시점 복구, EC2와 별도 고정비 (대략 2배)
  - Docker MySQL: EC2 비용 하나, 대신 백업·장애 대응을 직접. 앱과 DB가 메모리를 나눠 써서 RAM 1GB로는 부족
- 백업을 직접 한다는 것: `mysqldump`로 덤프 → cron으로 정기 실행 → **서버 밖(S3)** 에 보관 → 오래된 것 정리 → **복원 연습**
- 파일은 S3, DB에는 URL만 저장하는 이유
  1. BLOB이면 이미지 전송을 서버와 DB가 떠맡음. S3면 브라우저가 직접 받음
  2. 백업·복원·이전이 무거워짐
  3. DB 디스크가 S3보다 비쌈
  4. CDN, 캐싱, Presigned URL, 수명 주기 규칙 같은 기능을 못 씀
- 그래서 사진·동영상이 많아도 DB 크기는 작다 (10년 운영해도 수 MB 수준). 용량·비용 문제는 S3 저장과 전송 비용 쪽

**결정한 것**
- 인증: 직접 구현 / 이미지: S3 + Presigned URL
- 배포: 보류. 0~5단계는 로컬 Docker MySQL로 개발하고 코드는 DB 위치와 무관하므로 6단계 전에 결정

**헷갈렸던 것**
- 사진·동영상이 많으면 DB 용량이 커질 거라고 생각함 → 파일은 DB가 아니라 스토리지에 저장됨

**다음 할 일**
- 준비 단계: supabase를 쓰는 파일 18개를 살펴보고 `src/api/` 로 모을 계획 세우기
