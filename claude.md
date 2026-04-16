# Claude 개발 가이드 (AI 참조용)

> **FSD(Feature-Sliced Design)** 아키텍처 기반 프로젝트.
> Layer → Service Type → Slice → Segment 4단계 구조.
> `src/views/`는 FSD의 `pages` 레이어에 해당. `entities/`는 Service Type 분류 없음.

## 상세 문서

- [FSD 아키텍처 (구조, 디렉토리 예시)](document/guide/fsd-architecture.md)
- [Zod 스키마 설계](document/guide/zod-schema.md)
- [Import & Export 규칙](document/guide/import-rules.md)

---

## 개발 프로세스 원칙

- ✅ **문서 검색 우선**: 기능 구현 전 반드시 `qmd query`로 관련 문서 검색
  - 검색 결과가 있으면 해당 문서 참조 후 업데이트
  - 관련 문서 없으면 `document/prd/{기능명}/prd.md` 생성
- ✅ **PRD 우선**: 코드 구현 전 반드시 PRD를 작성하거나 기존 PRD를 업데이트한다
- ✅ **체크리스트 필수**: PRD에는 반드시 구현 체크리스트가 포함되어야 한다
- ✅ **PRD 폴더 구조**: `document/prd/{기능명}/` 폴더 안에 문서, UI 캡처 이미지 등 참고 자료 함께 관리
  - 예: `document/prd/wishlist/prd.md`, `document/prd/wishlist/ui-capture.png`
- ✅ **인덱스 업데이트**: PRD 생성/수정 시 반드시 `document/index.md`에 등록 및 상태 업데이트
- UI 캡처 이미지가 있으면 반드시 참조하여 구현한다

---

## 필수 준수 사항

### FSD 아키텍처
- ✅ **레이어 의존성**: `app → views → widgets → features → entities → shared` (상위→하위만)
- ✅ **Service Type**: `views/`, `features/` 하위에만 `admin/`, `service/`, `booking/` 분류
- ✅ **Public API**: `index.ts`를 통한 export만 허용, 내부 경로 직접 접근 금지
- ✅ **Segment 네이밍**: `ui/`, `api/`, `model/`, `lib/` ✅ / `components/`, `hooks/`, `types/` ❌
- ✅ **Slice 독립성**: 같은 레이어 내 슬라이스 간 직접 참조 금지

### 코드 작성
- ✅ **함수 JSDoc**: 목적, `@param`, `@returns` 필수
- ✅ **인터페이스 프로퍼티**: `/** 설명 */` 필수
- ✅ **5줄 이상 분기문**: 로직 설명 주석 필수

### Next.js & React
- ✅ **Server Component 우선**: 상호작용 필요시만 `'use client'`
- ✅ **하이드레이션 방지**: 서버/클라이언트 혼용 시 배럴 파일 분리
- ✅ **PAGES 상수**: `@/shared/config` 사용 (하드코딩 금지)

### 도구 & 라이브러리
- ✅ **pnpm 단독**: `npm`, `yarn` 사용 금지
- ✅ **Shadcn UI**: `@/shared/ui`로 import
- ✅ **API 파일**: `xxx.api.ts` (API 함수), `xxx.queries.ts` (React Query hooks)
- ✅ **Zod 스키마**: `entities`에서 정의 → `features`에서 상속 (역방향 금지)

---

## 파일 네이밍

| 종류 | 규칙 |
|------|------|
| 컴포넌트 | `PascalCase.tsx` |
| API | `camelCase.api.ts` |
| 쿼리 | `camelCase.queries.ts` |
| 스키마 | `camelCase.schema.ts` |
| 타입 | `camelCase.types.ts` |

---

## 개발 체크리스트

### FSD
- [ ] Public API (`index.ts`) 통해서만 export/import
- [ ] 레이어 의존성 준수 (역방향, 동일 레이어 간 참조 금지)
- [ ] `views/`, `features/`에 Service Type 폴더 사용
- [ ] Segment 목적 중심 네이밍 (`ui/`, `api/`, `model/`)

### 코드 품질
- [ ] 함수 JSDoc 주석 (목적, @param, @returns)
- [ ] 인터페이스 프로퍼티 주석
- [ ] 5줄 이상 분기문 설명 주석

### Next.js & 데이터
- [ ] Server Component 우선 (`'use client'` 최소화)
- [ ] PAGES 상수 사용 (`@/shared/config`)
- [ ] Shadcn UI (`@/shared/ui`)
- [ ] `pnpm` 사용
