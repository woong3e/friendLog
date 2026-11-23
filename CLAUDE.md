# FRIENDLOG

친구들과의 정기 모임을 사진과 함께 기록하고 별점·한줄평으로 평가하는 서비스.
운영 중: https://www.wondang.xyz (Vercel)

현재 스택: React 18, TypeScript, Vite, TanStack Query, Zustand, Tailwind v4, Toast UI Editor, Supabase(Auth · PostgreSQL · Storage)

## 고도화 목표

Supabase를 완전히 걷어내고 **Spring Boot + MySQL** 서버(새 레포 `friendlog-server`)로 이전한다. 실서비스로 계속 동작해야 하므로 서버도 배포한다.
전체 계획과 진행 상황은 [docs/study/ROADMAP.md](docs/study/ROADMAP.md), 학습 기록은 [docs/study/LOG.md](docs/study/LOG.md).

## Claude와 진행하는 방식

- 목적은 서비스 완성보다 **Spring 백엔드 개념 학습**이다.
- **Claude가 코드를 단계적으로 작성 → 무엇을 왜 그렇게 짰는지 설명 → 사용자가 이해** 순서. 한 번에 많이 바꾸지 않고, 작은 단위로 나눠 진행한다.
- 사용자가 설명하지 못하는 코드는 남기지 않는다. 설명이 필요한 부분은 코드와 함께 짚어 준다.
- 사용자가 결정할 것: ERD, API 설계, 트랜잭션 경계, 인증 흐름, 데이터 이전 방식, 장애 대응 판단. Claude는 선택지와 추천을 제시하고, 결정은 사용자가 한다.
- **단계를 시작할 때 브랜치를 먼저 만든다.** 단계 작업은 그 브랜치에서 하고, 끝나면 main에 합친다.
- 한 단계에 새 개념은 1~2개만. 단계가 끝날 때마다 블로그 TIL 작성을 권한다.
- 대화를 끝낼 때 `docs/study/LOG.md` 에 학습 기록을 남긴다.
- 답변은 한국어로.

## 결정 사항

- **인증:** 직접 구현 (이메일 6자리 인증 회원가입 + JWT 액세스·리프레시 토큰)
- **이미지:** S3 + Presigned URL. 클라이언트 WebP 압축은 유지. DB에는 URL만 저장
- **배포:** 미정. 후보는 EC2 + RDS / EC2 한 대 + Docker Compose(앱 + MySQL). 6단계 전에 AWS 요금을 확인하고 결정
  - Docker MySQL을 고르면 백업(`mysqldump` → S3, 정기 실행, 복원 연습)을 직접 구성해야 한다
- **레포:** 프론트는 이 레포 그대로, 서버는 `friendlog-server` 새 레포
- **전환 방식:** 새 시스템 완성 → 운영 데이터 복사본으로 리허설 → 공지 후 점검 시간에 한 번에 전환. Supabase는 전환 후 약 2주간 읽기 전용으로 두었다가 삭제
- **Supabase 코드:** 먼저 호출을 `src/api/` 로 모으고, 전환은 `feat/api-migration` 브랜치에서. 전환 후 main에 Supabase 코드가 남지 않게 정리
  - 삭제 대상: `@supabase/supabase-js`, `src/api/supabaseClient.ts`, `database.types.ts`, `supabase/`, 환경 변수(Vercel 포함)
  - 확인: `grep -rni "supabase" src package.json`

## 이미 해결한 문제 (포트폴리오 소재)

- 업로드 전 WebP 변환·압축 → 5~10MB 사진을 200KB 미만으로
- 본문에서 지운 이미지를 등록 시점에 정리
- 새로고침 시 로그인 페이지로 튕기는 문제 (세션 전역 상태 + isInitialized)

## 알려진 약점 (이전 과정에서 해결할 것)

- 작성자 확인을 클라이언트에서만 함 (email 비교). 레포에 RLS 정책 SQL 없음
- 테스트, CI 없음. TypeScript strict 꺼져 있음
- 글을 등록하지 않고 나가면 업로드한 이미지가 남음
- `SignUp.tsx` 의 `emailRedirectTo` 가 localhost로 하드코딩
- `supabase/.temp/` 파일(pooler-url 등)이 git에 커밋되어 있음 → 내용 확인 필요
