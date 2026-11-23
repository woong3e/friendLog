# 학습 기록

대화마다 하나씩, 최신이 위로.

> 1~5단계는 Claude가 구현·커밋하고 사용자가 나중에 코드를 읽는 방식으로 진행 (2026-11-23 결정).
> 아래 단계별 기록의 "읽는 순서"를 따라가면 된다.

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
