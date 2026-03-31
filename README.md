# Smarter Store FE

Next.js 기반의 티켓팅 프론트엔드 프로젝트
FSD (Feature-Sliced Design) 아키텍처 적용

## 주요 기능

### 일반 사용자
- **공연 검색 및 탐색**: 키워드 검색, 카테고리별 공연 조회
- **공연 리스트**: 인기 티켓, 장르별 티켓 목록
- **공연 상세**: 공연 정보, 장소, 기간, 시간, 연령 제한 등 상세 정보 조회
- **찜 기능**: 관심 공연 저장 및 관리
- **공연 예매**: 좌석 선택 및 예매
- **결제**: 예약자 정보 입력 및 결제 (무통장, 신용카드, 카카오페이, 토스페이)

### 관리자
- **공연 관리**: 공연 등록, 수정, 삭제
- **예매 관리**: 예매 현황 조회 및 관리
- **사용자 관리**: 회원 정보 관리

## 스크린샷

### 메인 페이지 (공연 리스트)
![메인 페이지](document/screenshot/main.png)

### 공연 상세
![공연 상세](document/screenshot/detail.png)

### 좌석 선택
![좌석 선택](document/screenshot/ticket.png)

### 결제
![결제](document/screenshot/payment.png)

## 기술 스택

### 핵심 프레임워크
- **Next.js 16.0.6** - App Router, SSR/SSG
- **React 19.2.0** - React Compiler 활성화
- **TypeScript 5** - Strict mode

### 패키지 매니저
- **pnpm** - 빠르고 효율적인 디스크 공간 사용

### 스타일링
- **Tailwind CSS v4** - Utility-first CSS 프레임워크
- **Shadcn UI** - 재사용 가능한 컴포넌트 라이브러리

### API 통신
- **REST API** - 별도 API 서버와 통신
- **fetch API** - Next.js 내장 fetch 사용 (캐싱, revalidation)
- **Orval** - OpenAPI 스펙 기반 타입 및 API 클라이언트 자동 생성
  - Zod 스키마 자동 생성 (`@orval/zod`)
  - TypeScript 타입 자동 생성
  - 태그별 API 파일 분리 (tags-split mode)

### 코드 품질
- **Biome 2.2.0** - Linter & Formatter
  - 저장 시 자동 포맷팅
  - 저장 시 import 자동 정리

## 프로젝트 구조 (FSD 기반)

```
smarter-store-fe/
├── src/
│   ├── app/                    # Next.js App Router (라우팅만 담당)
│   │   ├── (routes)/          # 라우트 그룹
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   │
│   ├── views/                  # 페이지 컴포넌트 (FSD pages 레이어)
│   │   ├── home/
│   │   ├── product/
│   │   └── ...
│   │
│   ├── widgets/                # 독립적인 UI 블록
│   │   ├── header/
│   │   ├── footer/
│   │   └── ...
│   │
│   ├── features/               # 비즈니스 기능 단위
│   │   ├── auth/
│   │   ├── cart/
│   │   └── ...
│   │
│   ├── entities/               # 비즈니스 엔티티
│   │   ├── product/
│   │   ├── user/
│   │   └── ...
│   │
│   └── shared/                 # 공통 코드
│       ├── api/               # API 클라이언트
│       ├── ui/                # 공통 UI 컴포넌트 (Shadcn UI 포함)
│       ├── lib/               # 유틸리티 함수
│       ├── hooks/             # 공통 커스텀 훅
│       ├── types/             # 공통 타입
│       └── config/            # 설정 파일
│
├── public/                     # Static assets
├── .vscode/                    # VSCode 설정
├── biome.json                  # Biome 설정
├── next.config.ts              # Next.js 설정
└── tsconfig.json               # TypeScript 설정
```


## 시작하기

### 필수 요구사항
- Node.js 20 이상
- pnpm 9 이상

### 설치

```bash
# 의존성 설치
pnpm install
```

### 환경변수 설정

`.env.example` 파일을 복사하여 `.env.local` 파일을 생성하고 값을 설정합니다:

```bash
# .env.example 파일 복사
cp .env.example .env.local

# 또는 Windows에서
copy .env.example .env.local
```

주요 환경변수:

```bash
# 사이트 기본 URL (배포 환경에 맞게 변경)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# API 서버 URL
NEXT_PUBLIC_API_SERVER=https://your-api-server.com

# 개발 환경 API 서버 URL
NEXT_PUBLIC_API_DEV_SERVER=http://localhost:8080
```

**Vercel 배포 시 주의사항:**
- Vercel 프로젝트 설정에서 `NEXT_PUBLIC_SITE_URL`을 배포 도메인으로 설정해야 합니다
- 예: `https://yourdomain.com` 또는 `https://your-project.vercel.app`

### 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

## 명령어

```bash
# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# API 타입 및 클라이언트 자동 생성 (Orval)
pnpm orval

# Shadcn UI 컴포넌트 추가
pnpm dlx shadcn@latest add button
```

### API 자동 생성 (Orval)

프로젝트는 OpenAPI 스펙 기반으로 TypeScript 타입과 API 클라이언트 코드를 자동 생성합니다.

#### 설정 파일
- `orval.config.ts` - Orval 설정

#### 자동 생성 위치
- API 클라이언트: `src/shared/api/orval/`
- TypeScript 타입: `src/shared/api/orval/types/`

#### 생성 방법
```bash
# OpenAPI 스펙에서 API 코드 자동 생성
pnpm orval
```

#### 주요 특징
- OpenAPI 문서에서 자동으로 TypeScript 타입 생성
- Zod 스키마 자동 생성으로 런타임 타입 검증
- 태그별로 API 파일 분리 (예: `performance-controller.ts`, `user-controller.ts`)
- Custom fetch wrapper (`src/shared/api/fetch-wrapper.ts`) 사용
- API 서버 URL 환경변수로 관리

#### 사용 예시
```typescript
// 자동 생성된 API 사용
import { getPerformanceList } from '@/shared/api/orval/performance-controller';

// 타입 안전한 API 호출
const performances = await getPerformanceList({
  page: 0,
  size: 10,
});
```

## 개발 가이드

상세한 개발 규칙 및 컨벤션은 [`claude.md`](./claude.md)를 참조하세요.

### 핵심 규칙
- 모든 함수와 인터페이스에 JSDoc 주석 작성
- Server Components 우선 사용
- SSR/SEO 최적화
- FSD 아키텍처 준수
- Public API를 통한 export
- Shadcn UI 컴포넌트는 `shared/ui`에 설치

## 문제 해결

### 빌드 에러
```bash
rm -rf .next
pnpm build
```

### 캐시 문제
```bash
rm -rf .next node_modules
pnpm install
```

### 타입 에러
- TypeScript 버전 확인
- `pnpm install` 재실행



## 참고 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [FSD 공식 문서](https://feature-sliced.design/)
- [Biome 공식 문서](https://biomejs.dev/)
- [pnpm 공식 문서](https://pnpm.io/)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)

## 라이선스

MIT