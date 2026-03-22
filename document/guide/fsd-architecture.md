# FSD 아키텍처 상세 가이드

## 레이어 의존성

```
app → views → widgets → features → entities → shared
```

| 레이어 | 역할 | 예시 |
|--------|------|------|
| **app** | 앱 전역 설정 | QueryProvider, layout.tsx |
| **views** | 페이지/화면 | admin/performance-list |
| **widgets** | 재사용 UI 블록 | header, admin-sidebar |
| **features** | 사용자 기능 | admin/performance-form |
| **entities** | 비즈니스 개념 | booking, performance, venue |
| **shared** | 공통 인프라 | button, routes, format |

## 4단계 구조: Layer → Service Type → Slice → Segment

```
📂 features/              # Layer
  📂 admin/               # Service Type (admin | service | booking)
    📂 performance-form/  # Slice
      📂 ui/              # Segment
      📂 api/
      📂 model/
      📄 index.ts
```

- **Service Type**: `views`, `features`에서만 사용. `entities`는 사용 안 함
- **Segment**: `ui/`, `api/`, `model/`, `lib/`, `config/` ✅ / `components/`, `hooks/`, `types/` ❌

## 실제 프로젝트 디렉토리 구조

```
src/
├── app/
│   ├── layout.tsx
│   ├── providers/
│   └── styles/
│
├── views/
│   ├── admin/
│   │   ├── performance-list/
│   │   │   ├── ui/PerformanceListPage.tsx
│   │   │   └── index.ts
│   │   └── venue-detail/
│   └── service/
│       ├── booking-detail/
│       │   ├── ui/BookingDetailPage.tsx
│       │   └── index.ts
│       └── performance-detail/
│
├── widgets/
│   ├── admin-sidebar/
│   └── header/
│
├── features/
│   ├── admin/
│   │   ├── performance-form/
│   │   │   ├── ui/
│   │   │   │   ├── PerformanceForm.tsx     # export O
│   │   │   │   └── PerformanceFormField.tsx # export X
│   │   │   ├── api/
│   │   │   │   ├── performance.api.ts
│   │   │   │   └── performance.queries.ts
│   │   │   ├── model/
│   │   │   │   └── performance-form.schema.ts
│   │   │   └── index.ts
│   │   └── venue-form/
│   ├── booking/
│   │   └── payment/
│   └── service/
│       └── performance-search/
│
├── entities/
│   ├── booking/
│   │   ├── ui/BookingCard.tsx
│   │   ├── api/
│   │   │   ├── booking.api.ts
│   │   │   └── booking.queries.ts
│   │   ├── model/
│   │   │   ├── booking.types.ts
│   │   │   └── booking.schema.ts
│   │   └── index.ts
│   ├── performance/
│   └── venue/
│
└── shared/
    ├── ui/
    │   ├── button.tsx         # shadcn (배럴 파일 없음)
    │   ├── input.tsx
    │   └── Logo/              # 커스텀 (폴더 단위)
    │       ├── Logo.tsx
    │       └── index.ts
    ├── api/client.ts
    ├── lib/format.ts
    ├── config/
    │   ├── routes.ts          # PAGES 상수
    │   └── env.ts
    └── auth-events/
        ├── ui/
        ├── lib/
        └── index.ts
```

## Entities vs Features

```
features (폼 로직) → entities (도메인) → shared (인프라)

// ✅ features → entities
import { createPerformanceSchema } from '@/entities/performance';

// ❌ entities → features (불가!)
import { performanceFormSchema } from '@/features/admin/performance-form';
```

| | Entities | Features |
|---|----------|----------|
| **역할** | 순수 도메인 (서버 API 스펙) | 폼 로직 (UI ↔ 서버 변환) |
| **스키마** | 기본 검증만 | entities 상속 + UI 변환 |
| **의존** | shared만 | entities + shared |
