---
description: Generate complete CRUD (List/Create/Detail/Edit/Delete) with DataTable and AdminSidebar menu
argument-hint: [domain-name] [display-name] [icon-name]
---

# Generate Complete CRUD Structure

Generate a complete CRUD system for admin panel following FSD architecture and CLAUDE.md rules.

## Arguments

- `$1`: **Domain Name** (kebab-case, e.g., "coupon", "product-category")
- `$2`: **Display Name** (Korean, e.g., "쿠폰", "상품 카테고리")
- `$3`: **Icon Name** (lucide-react icon, e.g., "Ticket", "Package")

## Example Usage

```bash
/generate-crud coupon 쿠폰 Ticket
/generate-crud product-category "상품 카테고리" Package
```

## ⚠️ CRITICAL: Orval 기반 개발

**반드시 다음 순서로 진행:**

1. ✅ **Orval 타입 확인** (`src/shared/api/orval/types/`)
   - `[Domain]CreateRequest` - 생성 요청 타입
   - `[Domain]Response` - 응답 타입

2. ✅ **Orval API 확인** (`src/shared/api/orval/admin-[domain]/`)
   - `getAll[Domain]s()`, `get[Domain](id)`, `create[Domain]()` 등

3. ✅ **React Query 사용** (Admin용)
   - Entity API에서 useQuery, useMutation hooks 생성

## FSD Structure

**⚠️ 중요: Admin 전용 - admin 경로 사용**

```
src/
├── entities/[domain]/
│   ├── api/[domain].api.ts (React Query hooks)
│   ├── model/[domain].schema.ts (Zod schema)
│   └── index.ts
├── features/admin/ (관리자 전용)
│   ├── [domain]-form/ (Form component)
│   └── [domain]-table/ (DataTable)
├── views/admin/ (관리자 전용)
│   └── [domain]/ (list/detail/create/edit)
└── widgets/admin-sidebar/

app/admin/[domain]s/ (4개 페이지)
```

**서비스(일반 사용자)용이면:**
```
features/service/[domain]-form/
views/service/[domain]/
app/(layout)/[domain]s/
```

## 생성 파일 목록

### 1. PAGES 상수 (`src/shared/constants/routes.ts`)

```typescript
[DOMAIN_UPPER]: {
  LIST: { path: "/admin/[domain]s", metadata: {...} },
  DETAIL: { path: (id) => `/admin/[domain]s/${id}`, metadata: {...} },
  CREATE: { path: "/admin/[domain]s/create", metadata: {...} },
  EDIT: { path: (id) => `/admin/[domain]s/${id}/edit`, metadata: {...} },
}
```

### 2. AdminSidebar 메뉴 (`src/widgets/admin-sidebar/lib/sidebarData.ts`)

```typescript
{
  title: "[DisplayName]",
  icon: [IconName],
  items: [
    { title: "[DisplayName] 리스트", url: PAGES.ADMIN.[DOMAIN].LIST.path },
    { title: "[DisplayName] 추가", url: PAGES.ADMIN.[DOMAIN].CREATE.path },
  ],
}
```

### 3. Entity Schema (`src/entities/[domain]/model/[domain].schema.ts`)

**중요**: Orval CreateRequest → Zod 변환, update는 partial()

```typescript
import { z } from "zod";

/**
 * [Domain] 생성 요청 스키마 (Orval [Domain]CreateRequest 기반)
 */
export const create[Domain]Schema = z.object({
  // Orval CreateRequest의 모든 필드를 Zod로 변환
  // 예: name: z.string().min(1, "입력해주세요")
});

/**
 * [Domain] 수정 요청 스키마
 */
export const update[Domain]Schema = create[Domain]Schema.partial();

export type Create[Domain]Form = z.infer<typeof create[Domain]Schema>;
export type Update[Domain]Form = z.infer<typeof update[Domain]Schema>;
```

### 4. Entity API (`src/entities/[domain]/api/[domain].api.ts`)

React Query hooks 생성:

```typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAll[Domain]s, get[Domain], create[Domain] } from "@/shared/api/orval/...";

export const [domain]QueryKeys = {
  all: ["[domain]s"] as const,
  lists: () => [[domain]QueryKeys.all, "list"] as const,
  details: () => [[domain]QueryKeys.all, "detail"] as const,
  detail: (id: number) => [[domain]QueryKeys.details(), id] as const,
};

// useGetAll[Domain]s, useGet[Domain], useCreate[Domain], useUpdate[Domain], useDelete[Domain]
```

### 5. Form Schema

**경로:**
- 관리자: `src/features/admin/[domain]-form/model/[domain]-form.schema.ts`
- 서비스: `src/features/service/[domain]-form/model/[domain]-form.schema.ts`

**핵심 원칙:**
- ❌ **NO transform** - UI 데이터 구조와 일치
- ✅ **Entity 상속** + 복합 검증만
- ✅ **날짜 변환은 onSubmit에서 처리**

```typescript
import { create[Domain]Schema } from "@/entities/[domain]";
import { z } from "zod";

export const create[Domain]FormSchema = create[Domain]Schema.extend({
  // 추가 검증만 (transform 금지)
}).refine((data) => {
  // 복합 검증 (예: 날짜 비교)
  return true;
}, { message: "검증 실패", path: ["field"] });

export const update[Domain]FormSchema = create[Domain]FormSchema
  .extend({
    // Edit 모드 전용 필드 추가 (예: isActive)
  })
  .partial();

export type Create[Domain]FormInput = z.infer<typeof create[Domain]FormSchema>;
export type Update[Domain]FormInput = z.infer<typeof update[Domain]FormSchema>;

// 호환성
export const [domain]FormSchema = create[Domain]FormSchema;
export type [Domain]FormInput = Create[Domain]FormInput;
```

### 6. Form Component

**경로:**
- 관리자: `src/features/admin/[domain]-form/ui/[Domain]Form.tsx`
- 서비스: `src/features/service/[domain]-form/ui/[Domain]Form.tsx`

**핵심 패턴:**

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { [Domain]CreateRequest } from "@/shared/api/orval/types";

/**
 * Discriminated Union Props
 */
type CreateProps = {
  mode: "create";
  initialValues?: never;
  onSubmit: (data: [Domain]CreateRequest) => Promise<void>;
  isLoading?: boolean;
};

type EditProps = {
  mode: "edit";
  initialValues: Partial<Update[Domain]FormInput>;
  onSubmit: (data: Partial<[Domain]CreateRequest>) => Promise<void>;
  isLoading?: boolean;
};

type [Domain]FormProps = CreateProps | EditProps;

export function [Domain]Form({ mode, initialValues, onSubmit, isLoading }: [Domain]FormProps) {
  // 1. Mode 기반 스키마 선택
  const form = useForm<Create[Domain]FormInput | Update[Domain]FormInput>({
    resolver: zodResolver(
      mode === "edit" ? update[Domain]FormSchema : create[Domain]FormSchema
    ),
    defaultValues: getDefaultValues(),
  });

  // 2. 날짜 변환 헬퍼 (필요시)
  const formatToApi = (dateString: string): string => {
    return new Date(dateString).toISOString();
  };

  // 3. dirtyFields 기반 제출 (Edit 모드에서 변경된 필드만 전송)
  const handleOnSubmit = async (values: Create[Domain]FormInput | Update[Domain]FormInput) => {
    if (mode === "edit") {
      const data = values as Update[Domain]FormInput;
      const { dirtyFields } = form.formState;
      const dirtyData: Partial<[Domain]CreateRequest> = {};

      Object.keys(dirtyFields).forEach((key) => {
        const k = key as keyof Update[Domain]FormInput;
        const value = data[k];
        if (value === undefined) return;

        // 날짜 필드 변환 (도메인별로 조정)
        if (k === "validFrom" || k === "validUntil") {
          dirtyData[k] = formatToApi(value as string);
        } else {
          (dirtyData as any)[k] = value;
        }
      });

      await onSubmit(dirtyData);
    } else {
      // Create 모드: 전체 데이터 변환
      const data = values as Create[Domain]FormInput;
      const createData: [Domain]CreateRequest = {
        // 필드별로 변환 (날짜는 formatToApi 사용)
      };
      await onSubmit(createData);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleOnSubmit)}>
      {/* Shadcn UI 컴포넌트 사용 */}
      {/* Input, Select, Checkbox, Textarea 등 */}
      {/* mode === "edit"일 때만 표시할 필드는 조건부 렌더링 */}
    </form>
  );
}
```

### 7. Views

**Create View**: useMutation으로 생성
**Edit View**: useGet[Domain] + useUpdate[Domain]
- ISO → YYYY-MM-DD 변환: `isoString.split("T")[0]`

**List View**: useGetAll[Domain]s + DataTable

### 8. App Routes (`app/admin/[domain]s/`)

```typescript
// page.tsx - List
// [id]/page.tsx - Detail
// create/page.tsx - Create
// [id]/edit/page.tsx - Edit
```

## 핵심 체크리스트

### Schema & Form
- [ ] NO transform (UI 데이터 유지)
- [ ] Update schema는 partial()
- [ ] Edit 전용 필드는 extend로 추가
- [ ] Mode 기반 스키마 선택
- [ ] dirtyFields로 변경 필드만 전송
- [ ] Discriminated Union Props

### API & Data
- [ ] Orval 타입 직접 사용
- [ ] React Query hooks (queryKeys, useQuery, useMutation)
- [ ] Edit View에서 ISO → YYYY-MM-DD 변환

### UI & UX
- [ ] Shadcn UI 컴포넌트
- [ ] Toast 메시지 (toast.success, toast.error)
- [ ] 조건부 렌더링 (mode === "edit")
- [ ] PAGES 상수 사용

### FSD & Code Quality
- [ ] JSDoc 주석 (함수, 인터페이스)
- [ ] Public API (index.ts)
- [ ] 레이어 의존성 준수

## 변환 패턴 예시

**날짜 필드:**
- UI: `YYYY-MM-DD` (Input type="date")
- API: ISO String
- Edit View 초기값: `isoString.split("T")[0]`
- onSubmit: `new Date(dateString).toISOString()`

**Edit 전용 필드 (예: isActive):**
- Update schema에만 추가
- `mode === "edit"`일 때만 렌더링
- Checkbox 컴포넌트 사용

**숫자 필드:**
- `{...form.register("field", { valueAsNumber: true })}`
