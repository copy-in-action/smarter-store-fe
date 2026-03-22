# FSD 리팩토링 가이드

> 현재 구조를 FSD 공식 원칙에 맞게 개선하기 위한 가이드

## 리팩토링 원칙

### 1. Segment 네이밍: 기술 → 목적 중심

**Before (기술적 분류)**
- `components/` - "컴포넌트가 들어있다"
- `hooks/` - "훅이 들어있다"
- `types/` - "타입이 들어있다"

**After (목적 중심)**
- `ui/` - UI 컴포넌트
- `api/` - API 통신
- `model/` - 비즈니스 로직, 타입, 스키마
- `lib/` - 유틸리티
- `config/` - 설정

## 리팩토링 작업 목록

### ✅ 1. shared/constants → shared/config

**현재 구조**
```
shared/constants/
├── index.ts
└── routes.ts
```

**변경 후**
```
shared/config/
├── index.ts       // export * from './routes'
└── routes.ts      // PAGES 상수
```

**작업 내용**
1. `shared/constants/` 폴더를 `shared/config/`로 리네임
2. 전체 코드베이스에서 import 경로 변경
   ```typescript
   // Before
   import { PAGES } from '@/shared/constants'

   // After
   import { PAGES } from '@/shared/config'
   ```

---

### ✅ 2. shared/hooks → shared/device-detection

**현재 구조**
```
shared/hooks/
├── use-device.tsx
└── use-mobile.ts
```

**변경 후**
```
shared/device-detection/
├── lib/
│   └── device.ts           # detectMobileDevice, isSmallScreen, shouldUseMobileUI
├── ui/
│   └── DeviceProvider.tsx  # 'use client' - DeviceProvider, useDevice, useIsMobile
├── model/
│   └── types.ts            # DeviceInfo 타입
└── index.ts
```

**index.ts**
```typescript
export { DeviceProvider, useDevice, useIsMobile } from './ui/DeviceProvider';
export type { DeviceInfo } from './model/types';
```

**작업 내용**
1. `use-device.tsx`를 분리
   - DeviceProvider, useDevice, useIsMobile → `ui/DeviceProvider.tsx`
   - detectMobileDevice, isSmallScreen 등 → `lib/device.ts`
   - DeviceInfo 타입 → `model/types.ts`
2. `use-mobile.ts` 제거 (useIsMobile로 통합됨)
3. import 경로 변경
   ```typescript
   // Before
   import { useDevice } from '@/shared/hooks/use-device'

   // After
   import { useDevice } from '@/shared/device-detection'
   ```

---

### ✅ 3. shared/events + shared/components → shared/auth-events

**현재 구조**
```
shared/events/
└── auth-events.ts           # AUTH_EVENTS, dispatchUnauthorizedEvent

shared/components/
├── AuthEventHandler.tsx
└── TokenRefreshManager.tsx
```

**변경 후**
```
shared/auth-events/
├── lib/
│   └── events.ts            # AUTH_EVENTS, dispatchUnauthorizedEvent 등
├── ui/
│   ├── AuthEventHandler.tsx # 'use client'
│   └── TokenRefreshManager.tsx
├── model/
│   └── types.ts             # UnauthorizedEventData 타입
└── index.ts
```

**index.ts**
```typescript
export { AuthEventHandler, TokenRefreshManager } from './ui/AuthEventHandler';
export {
  AUTH_EVENTS,
  dispatchUnauthorizedEvent,
  dispatchAdminUnauthorizedEvent
} from './lib/events';
export type { UnauthorizedEventData } from './model/types';
```

**작업 내용**
1. `shared/events/auth-events.ts`를 분리
   - AUTH_EVENTS, dispatch 함수들 → `lib/events.ts`
   - UnauthorizedEventData 타입 → `model/types.ts`
2. `shared/components/` 파일들을 `ui/`로 이동
3. `shared/components/` 폴더 삭제
4. import 경로 변경
   ```typescript
   // Before
   import { AuthEventHandler } from '@/shared/components'
   import { AUTH_EVENTS } from '@/shared/events/auth-events'

   // After
   import { AuthEventHandler, AUTH_EVENTS } from '@/shared/auth-events'
   ```

---

### ✅ 4. shared/ui 구조 (변경 없음 - 현재가 올바름)

**현재 구조 (유지)**
```
shared/ui/
├── button.tsx              # shadcn - 배럴 없이 직접 import
├── input.tsx               # shadcn - 배럴 없이 직접 import
├── Logo/                   # 커스텀 - 폴더 단위 배럴
│   ├── Logo.tsx
│   └── index.ts
└── BackButton/             # 커스텀 - 폴더 단위 배럴
    ├── BackButton.tsx
    └── index.ts
```

**사용 방법**
```typescript
// shadcn: 직접 import
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

// 커스텀: 폴더를 통한 import
import { Logo } from '@/shared/ui/Logo';
import { BackButton } from '@/shared/ui/BackButton';
```

---

## 리팩토링 우선순위

1. **High Priority (즉시)**
   - [ ] shared/constants → shared/config (간단, 영향 범위 작음)
   - [ ] shared/hooks → shared/device-detection (중간 복잡도)

2. **Medium Priority (다음 스프린트)**
   - [ ] shared/events + shared/components → shared/auth-events (복잡도 중)

3. **Low Priority (점진적)**
   - [ ] 기존 features, entities 슬라이스의 index.ts export 최적화

## 체크리스트

각 리팩토링 후 확인사항:
- [ ] TypeScript 컴파일 에러 없음
- [ ] 모든 import 경로 업데이트 완료
- [ ] 개발 서버 정상 실행
- [ ] 빌드 성공
- [ ] 기존 기능 정상 동작 확인
