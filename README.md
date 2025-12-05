# Smarter Store FE

Next.js 기반의 티켓팅 프론트엔드 프로젝트
FSD (Feature-Sliced Design) 아키텍처 적용

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

### FSD 레이어 규칙

#### 1. shared (공유 레이어)
- 프로젝트 전체에서 사용되는 공통 코드
- 다른 레이어에 의존하지 않음

#### 2. entities (엔티티 레이어)
- 비즈니스 엔티티 (Product, User, Order 등)
- shared에만 의존

#### 3. features (기능 레이어)
- 사용자 시나리오와 기능 (로그인, 장바구니 추가 등)
- shared, entities에 의존

#### 4. widgets (위젯 레이어)
- 독립적인 UI 블록 (Header, Footer 등)
- shared, entities, features에 의존

#### 5. views (페이지 레이어)
- 페이지 단위 컴포넌트
- 모든 하위 레이어 사용 가능
- **주의**: Next.js의 `app/` 폴더와 분리됨

#### 6. app (앱 레이어)
- Next.js App Router (라우팅)
- Providers, 전역 설정
- views를 import하여 사용

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

`.env.local` 파일을 생성하고 다음 내용을 추가합니다:

```bash
# API 서버 URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

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

# Lint 검사
pnpm lint

# 코드 포맷팅
pnpm format

# Shadcn UI 컴포넌트 추가
pnpm dlx shadcn@latest add button
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

### Biome 에러
```bash
pnpm format
# 수동 수정 후
pnpm lint
```

## 배포

### Vercel (권장)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/smarter-store-fe)

1. Vercel에 프로젝트 import
2. 환경변수 설정 (`NEXT_PUBLIC_API_URL`)
3. 배포

### 기타 플랫폼

프로덕션 빌드 후 배포:

```bash
pnpm build
pnpm start
```

## 참고 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [FSD 공식 문서](https://feature-sliced.design/)
- [Biome 공식 문서](https://biomejs.dev/)
- [pnpm 공식 문서](https://pnpm.io/)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)

## 라이선스

MIT
