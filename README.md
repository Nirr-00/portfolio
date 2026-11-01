# Dongwon Lee - Portfolio

안녕하세요! 기술적 문제의 원인을 끝까지 추적하고 해결하는 풀스택 개발자 **이동원**의 포트폴리오 저장소입니다.

---

## Projects

### [Aion2-Matching Platform](https://github.com/Nirr-00/portfolio/tree/main/Aion2-Matching)
- **프로젝트 상세 보기**: [Aion2-Matching 폴더 바로가기](https://github.com/Nirr-00/portfolio/tree/main/Aion2-Matching)
- **서비스 개요**: 게임 이용자가 서버·역할·콘텐츠 조건에 맞는 파티를 쉽게 모집하고 지원할 수 있도록 만든 매칭 플랫폼입니다. 캐릭터 정보 확인, 모집글 작성, 지원 처리까지의 흐름을 하나의 서비스로 구성했습니다.
- **기술 스택**: Next.js 16 (App Router), React 19, TypeScript, PostgreSQL (Supabase), Docker, Google Cloud Run, GitHub Actions
- **핵심 엔지니어링**:
  - **인프라 & CI/CD**: Docker 3단계 Multi-stage 최적화 빌드, Non-root 계정(UID 1001) 격리, Google Cloud Run(서울 리전) 자동 배포 파이프라인 구축
  - **데이터 모델링 & 캐싱**: 파티/버스/신청 1:N 관계형 설계, 목록 조회 최적화를 위한 캐릭터 스펙 비정규화 캐싱
  - **서드파티 데이터 연동**: 공개 캐릭터 검색 결과와 특정 칭호를 대조하는 캐릭터 확인 기능
  - **트러블슈팅**: 배포 환경에서 발생한 401 세션 쿠키 불일치 문제 해결(미들웨어 기반 토큰 자동 갱신), 인메모리 슬라이딩 윈도우 Rate Limiter(1분당 1~10회) 자체 구현
  - **품질 관리**: `AGENTS.md` 기반 4단계 AI 정밀 검사 파이프라인 및 패치 노트(`CHANGELOG.md`) 중심 변경 이력 관리

---

### [DIT-NOW Campus Platform](https://github.com/Nirr-00/portfolio/tree/main/DIT-NOW)
- **프로젝트 상세 보기**: [DIT-NOW 폴더 바로가기](https://github.com/Nirr-00/portfolio/tree/main/DIT-NOW)
- **서비스 개요**: 대학 캠퍼스 학사 정보, 학과 공지, 시설 안내 및 기회 매칭을 통합 제공하고, RAG/LLM 기반 캠퍼스 질의응답을 지원하는 풀스택 모노레포 플랫폼입니다.
- **기술 스택**: React 19, TypeScript, Vite, FastAPI (Python 3.13), MariaDB 11.4, Docker, GitHub Actions
- **핵심 엔지니어링**:
  - **Full-Stack Monorepo 아키텍처**: 신규 통합 웹(`apps/web`), 고성능 비동기 API 서버(`services/api`), RAG 검색 챗봇(`chatbot`), MariaDB 인프라(`infra`), E2E 검증 하네스(`tests/`)의 유기적 모노레포 구조화
  - **Fail-Closed 보안 및 서버 사이드 인가**: 비동기 웹 계층과 순수 동기 도메인 계층 분리(`AsyncSession.run_sync`), 원격 TLS 1.3 강제 연결, 메모리 세션 기반 신원 재검증
  - **데이터 무결성 & 멱등성**: 멱등성 키(Idempotency-Key) 및 낙관적 락(Optimistic Lock)을 통한 동시성 제어, OpenAPI 스키마-클라이언트 타입 자동 동기화
  - **AI 거버넌스 & 품질 관리**: `AGENTS.md` 기반 Codex / Claude Code 이중 에이전트 스킬 미러링, CI 파이프라인(6종 워크플로우) 및 브라우저 하네스 기반 테스트 주도 개발

---
