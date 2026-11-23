# FRIENDLOG 고도화 로드맵

각 단계는 **개념 공부 → 직접 구현 → 테스트 → TIL** 순서. 예상 12~14주, 더 길어져도 괜찮다.

## 목표 구조

```
React (Vercel, wondang.xyz)
   │  REST + JWT
   ▼
Spring Boot (EC2, api.wondang.xyz) ──▶ MySQL (RDS 또는 EC2 안 Docker, 6단계 전 결정)
   ├──▶ S3 (이미지)
   └──▶ 메일 발송 (회원가입 인증 코드)
```

## 결정 사항

- [x] 인증: 직접 구현 (이메일 인증 + JWT)
- [x] 이미지: S3 + Presigned URL
- [ ] 배포: EC2 + RDS / EC2 + Docker MySQL 중 6단계 전에 결정

## 준비. 프론트 리팩터링 (이 레포, `refactor/api-layer`)

- [x] supabase를 쓰는 파일 목록 확인 (18개)
- [x] 호출을 `src/api/*.ts` 함수로 모으기
  - [x] posts
  - [x] ratings
  - [x] profiles
  - [x] storage
  - [x] auth
- [x] 필요한 API 목록 뽑기 → [api-inventory.md](api-inventory.md)
- [x] 공개 이미지 4개를 Supabase 주소 대신 `public/images/assets/` 로 옮기기
- [x] 브라우저 확인: 읽기 화면 (로그인 리다이렉트, 목록·정렬·무한 스크롤, 글 보기, 수정 화면 불러오기, 설정)
- [ ] 브라우저 확인: 쓰기 동작 (글 등록·수정·삭제, 평가, 이미지 업로드·삭제, 닉네임 변경, 회원가입, 로그아웃) — 테스트 계정으로 직접

## 0단계. 설계 (1주)

- [x] 현재 기능 목록 → API 목록 ([api-inventory.md](api-inventory.md))
- [x] MySQL ERD ([docs/design/ERD.md](../design/ERD.md))
- [x] API 명세 ([docs/design/API.md](../design/API.md))
- 배울 것: REST 설계, 정규화, 연관관계

## 1단계. 로컬 환경 + 게시글 CRUD (2주)

- [x] Spring Boot 프로젝트 생성 (`server/`), Docker Compose로 MySQL
- [ ] Member / Post / Rating 엔티티
- [ ] 게시글 CRUD (인증 없이)
- [ ] 무한 스크롤용 페이징, 정렬(최신순·평점순)
- [ ] 입력 검증, 전역 예외 처리, 공통 응답 형식
- 배울 것: JPA 매핑, 영속성 컨텍스트, 트랜잭션, 페이징, N+1

## 2단계. 인증 (2주)

- [ ] 회원가입 + 이메일 6자리 인증 (메일 발송, 코드 만료, 재전송 제한)
- [ ] 로그인, JWT 액세스·리프레시 토큰
- [ ] 권한: 본인 글만 수정·삭제
- 배울 것: Spring Security 필터 체인, 비밀번호 해시, 토큰 설계

## 3단계. 평가·프로필 (1주)

- [ ] 별점 등록·수정, 평균 평점과 점수 분포
- [ ] 평균을 저장할지 매번 계산할지 결정 (저장하면 동시성 처리)
- [ ] 닉네임 수정
- 배울 것: 집계 쿼리, 동시성, 비정규화 판단

## 4단계. 이미지 (1~2주)

- [ ] S3 Presigned URL 업로드, 썸네일·프로필 사진
- [ ] 쓰이지 않는 이미지 정리 `@Scheduled`
- 배울 것: S3, Presigned URL, 스케줄러

## 5단계. 프론트 전환 (1~2주, `feat/api-migration`)

- [ ] `frontend/src/api/*.ts` 내부를 내 서버 호출로 교체 (React Query 유지)
- [ ] 로그인 상태 관리를 내 토큰 방식으로 교체
- 배울 것: CORS, 토큰 재발급 흐름

## 6단계. 배포 (1~2주)

- [ ] 배포 방식 결정 (AWS 요금 확인)
- [ ] Docker, EC2, DB, `api.wondang.xyz` + HTTPS (Nginx + 인증서)
- [ ] GitHub Actions 테스트·빌드·배포
- [ ] 환경 변수/비밀값 관리, 헬스 체크, 로그
- [ ] (Docker MySQL이면) 백업: `mysqldump` → S3 정기 실행, 보관 기간, 복원 연습
- 배울 것: 리눅스 기본, 네트워크(포트, 보안 그룹), CI/CD

## 7단계. 데이터 이전과 전환 (1주) ★

- [ ] PostgreSQL → MySQL 이전 스크립트 (uuid, timestamptz, text 등 타입 차이)
- [ ] 비밀번호 해시 이전 가능 여부 확인
- [ ] 이미지 파일 S3 이전, 본문 마크다운 이미지 URL 교체
- [ ] 복사본으로 리허설 → 공지 → 점검 시간에 전환
- [ ] Supabase 2주간 읽기 전용 유지 후 삭제, main에서 Supabase 코드 제거

## 8단계. 확장

- [ ] 연말 시상식 기능 (투표 기간, 부문당 1인 1표, 본인 모임 투표 불가, 마감 후 집계 확정을 한 트랜잭션으로)
- [ ] LLM 자동 요약 (비동기 생성, `AiGateway` 인터페이스, 타임아웃·재시도·대체, 캐싱, 테스트용 가짜 구현)
- [ ] 연말 리포트(LLM), 모니터링
- [ ] (검토) 동영상 업로드: 용량 제한, 압축, 전송 비용(CDN)
