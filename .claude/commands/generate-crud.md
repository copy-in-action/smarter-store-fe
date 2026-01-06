---
description: Generate complete CRUD (List/Create/Detail/Edit/Delete) with DataTable and AdminSidebar menu
argument-hint: [domain-name] [display-name] [icon-name]
---

# Generate Complete CRUD Structure

Generate a complete CRUD system for admin panel following FSD architecture and CLAUDE.md rules.

## Arguments

- `$1`: **Domain Name** (kebab-case, e.g., "coupon", "product-category", "user-profile")
- `$2`: **Display Name** (Korean, e.g., "쿠폰", "상품 카테고리", "사용자 프로필")
- `$3`: **Icon Name** (lucide-react icon, e.g., "Ticket", "Package", "Users")

## Example Usage

```bash
/generate-crud coupon 쿠폰 Ticket
/generate-crud product-category "상품 카테고리" Package
/generate-crud user-profile "사용자 프로필" Users
```

## What Gets Generated

### 1. PAGES 상수 추가 (`src/shared/constants/routes.ts`)

```typescript
ADMIN_PAGES.ADMIN[DOMAIN_UPPER]: {
  LIST: {
    path: "/admin/[domain]s",
    metadata: {
      title: "[DisplayName] 관리 | 관리자",
      description: "등록된 [DisplayName]을 관리하고 새로운 [DisplayName]을 추가할 수 있습니다.",
    } as Metadata,
  },
  DETAIL: {
    path: (id: number) => `/admin/[domain]s/${id}`,
    metadata: {
      title: "[DisplayName] 상세 | 관리자",
      description: "[DisplayName] 상세 페이지",
    } as Metadata,
  },
  CREATE: {
    path: "/admin/[domain]s/create",
    metadata: {
      title: "[DisplayName] 등록 | 관리자",
      description: "새로운 [DisplayName]을 등록하는 관리자 페이지",
    } as Metadata,
  },
  EDIT: {
    path: (id: number) => `/admin/[domain]s/${id}/edit`,
    metadata: {
      title: "[DisplayName] 수정 | 관리자",
      description: "[DisplayName] 정보를 수정하는 관리자 페이지",
    } as Metadata,
  },
}
```

### 2. AdminSidebar 메뉴 추가 (`src/widgets/admin-sidebar/lib/sidebarData.ts`)

```typescript
{
  title: "[DisplayName]",
  url: "#",
  icon: [IconName],
  items: [
    {
      title: "[DisplayName] 리스트",
      url: PAGES.ADMIN.[DOMAIN_UPPER].LIST.path,
    },
    {
      title: "[DisplayName] 추가",
      url: PAGES.ADMIN.[DOMAIN_UPPER].CREATE.path,
    },
  ],
}
```

### 3. Entity Schema (`src/entities/[domain]/model/[domain].schema.ts`)

```typescript
import { z } from "zod";

/**
 * [Domain] 생성 요청 스키마
 */
export const create[Domain]Schema = z.object({
  /** 필드 설명 */
  name: z.string().min(1, "이름을 입력해주세요"),
  // orval API 스펙 기반 필드 추가
});

/**
 * [Domain] 수정 요청 스키마
 */
export const update[Domain]Schema = create[Domain]Schema.partial();

export type Create[Domain]Form = z.infer<typeof create[Domain]Schema>;
export type Update[Domain]Form = z.infer<typeof update[Domain]Schema>;
```

**Index**: `src/entities/[domain]/index.ts`

### 4. API Functions (`src/entities/[domain]/api/[domain].api.ts`)

```typescript
import { api } from "@/shared/api";
import type { [Domain] } from "@/shared/api/generated";

/**
 * [Domain] 목록 조회
 */
export async function get[Domain]List() {
  const response = await api.get<[Domain][]>("/api/[domain]s");
  return response.data;
}

/**
 * [Domain] 상세 조회
 */
export async function get[Domain](id: number) {
  const response = await api.get<[Domain]>(`/api/[domain]s/${id}`);
  return response.data;
}

/**
 * [Domain] 생성
 */
export async function create[Domain](data: Create[Domain]Form) {
  const response = await api.post<[Domain]>("/api/[domain]s", data);
  return response.data;
}

/**
 * [Domain] 수정
 */
export async function update[Domain](id: number, data: Update[Domain]Form) {
  const response = await api.put<[Domain]>(`/api/[domain]s/${id}`, data);
  return response.data;
}

/**
 * [Domain] 삭제
 */
export async function delete[Domain](id: number) {
  await api.delete(`/api/[domain]s/${id}`);
}
```

### 5. Form Schema (`src/features/[domain]-form/model/[domain]-form.schema.ts`)

```typescript
import { create[Domain]Schema, update[Domain]Schema } from "@/entities/[domain]";
import { z } from "zod";

/**
 * [Domain] 생성 폼 스키마 (문자열→숫자 변환)
 */
export const create[Domain]FormSchema = create[Domain]Schema.extend({
  // transform 필드 추가
});

/**
 * [Domain] 수정 폼 스키마
 */
export const update[Domain]FormSchema = update[Domain]Schema.extend({
  // transform 필드 추가
});

export type Create[Domain]FormInput = z.input<typeof create[Domain]FormSchema>;
export type Create[Domain]FormData = z.output<typeof create[Domain]FormSchema>;
export type Update[Domain]FormInput = z.input<typeof update[Domain]FormSchema>;
export type Update[Domain]FormData = z.output<typeof update[Domain]FormSchema>;
```

**Index**: `src/features/[domain]-form/index.ts`

### 6. Form Component (`src/features/[domain]-form/ui/[Domain]Form.tsx`)

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

interface [Domain]FormProps {
  mode: 'create' | 'edit';
  initialValues?: Partial<Create[Domain]FormInput>;
  onSubmit: (data: Create[Domain]FormData | Update[Domain]FormData) => Promise<void>;
  isLoading?: boolean;
}

/**
 * [Domain] 생성/수정 폼
 */
export function [Domain]Form({ mode, initialValues, onSubmit, isLoading }: [Domain]FormProps) {
  const schema = mode === 'create' ? create[Domain]FormSchema : update[Domain]FormSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? '[DisplayName] 등록' : '[DisplayName] 수정'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name">이름</label>
            <Input {...form.register('name')} placeholder="이름 입력" />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? '처리 중...' : mode === 'create' ? '등록' : '수정'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### 7. DataTable Component (`src/features/[domain]-table/ui/[Domain]DataTable.tsx`)

```typescript
'use client';

import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { Button } from '@/shared/ui/button';
import type { [Domain] } from '@/shared/api/generated';
import { PAGES } from '@/shared/constants';

interface [Domain]DataTableProps {
  data: [Domain][];
  onDelete?: (id: number) => void;
}

/**
 * [Domain] DataTable 컴포넌트
 * Row 클릭 시 상세 페이지로 이동
 */
export function [Domain]DataTable({ data, onDelete }: [Domain]DataTableProps) {
  const router = useRouter();

  const handleRowClick = (id: number) => {
    router.push(PAGES.ADMIN.[DOMAIN_UPPER].DETAIL.path(id));
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>이름</TableHead>
          <TableHead className="text-right">작업</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow
            key={item.id}
            onClick={() => handleRowClick(item.id)}
            className="cursor-pointer hover:bg-muted/50"
          >
            <TableCell>{item.id}</TableCell>
            <TableCell>{item.name}</TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(PAGES.ADMIN.[DOMAIN_UPPER].EDIT.path(item.id));
                }}
              >
                수정
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                >
                  삭제
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

**Index**: `src/features/[domain]-table/index.ts`

### 8. View Components

#### List View (`src/views/[domain]/list/ui/[Domain]ListView.tsx`)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { [Domain]DataTable } from '@/features/[domain]-table';
import { delete[Domain] } from '@/entities/[domain]';
import { Button } from '@/shared/ui/button';
import { PAGES } from '@/shared/constants';
import type { [Domain] } from '@/shared/api/generated';

interface [Domain]ListViewProps {
  initialData: [Domain][];
}

/**
 * [Domain] 리스트 뷰
 */
export function [Domain]ListView({ initialData }: [Domain]ListViewProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);

  const handleDelete = async (id: number) => {
    if (!confirm('[DisplayName]을(를) 삭제하시겠습니까?')) return;

    try {
      await delete[Domain](id);
      setData(data.filter(item => item.id !== id));
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">[DisplayName] 관리</h1>
        <Button onClick={() => router.push(PAGES.ADMIN.[DOMAIN_UPPER].CREATE.path)}>
          [DisplayName] 추가
        </Button>
      </div>
      <[Domain]DataTable data={data} onDelete={handleDelete} />
    </div>
  );
}
```

#### Detail View (`src/views/[domain]/detail/ui/[Domain]DetailView.tsx`)

```typescript
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { PAGES } from '@/shared/constants';
import Link from 'next/link';
import type { [Domain] } from '@/shared/api/generated';

interface [Domain]DetailViewProps {
  data: [Domain];
}

/**
 * [Domain] 상세 뷰
 */
export function [Domain]DetailView({ data }: [Domain]DetailViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">[DisplayName] 상세</h1>
        <Link href={PAGES.ADMIN.[DOMAIN_UPPER].EDIT.path(data.id)}>
          <Button>수정</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{data.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div>
              <dt className="font-semibold">ID</dt>
              <dd>{data.id}</dd>
            </div>
            {/* 추가 필드 표시 */}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### Create View (`src/views/[domain]/create/ui/[Domain]CreateView.tsx`)

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { [Domain]Form } from '@/features/[domain]-form';
import { create[Domain] } from '@/entities/[domain]';
import { PAGES } from '@/shared/constants';
import type { Create[Domain]FormData } from '@/features/[domain]-form';

/**
 * [Domain] 생성 뷰
 */
export function [Domain]CreateView() {
  const router = useRouter();

  const handleSubmit = async (data: Create[Domain]FormData) => {
    try {
      await create[Domain](data);
      router.push(PAGES.ADMIN.[DOMAIN_UPPER].LIST.path);
    } catch (error) {
      console.error('생성 실패:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">[DisplayName] 등록</h1>
      <[Domain]Form mode="create" onSubmit={handleSubmit} />
    </div>
  );
}
```

#### Edit View (`src/views/[domain]/edit/ui/[Domain]EditView.tsx`)

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { [Domain]Form } from '@/features/[domain]-form';
import { update[Domain] } from '@/entities/[domain]';
import { PAGES } from '@/shared/constants';
import type { [Domain] } from '@/shared/api/generated';
import type { Update[Domain]FormData } from '@/features/[domain]-form';

interface [Domain]EditViewProps {
  data: [Domain];
}

/**
 * [Domain] 수정 뷰
 */
export function [Domain]EditView({ data }: [Domain]EditViewProps) {
  const router = useRouter();

  const handleSubmit = async (formData: Update[Domain]FormData) => {
    try {
      await update[Domain](data.id, formData);
      router.push(PAGES.ADMIN.[DOMAIN_UPPER].DETAIL.path(data.id));
    } catch (error) {
      console.error('수정 실패:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">[DisplayName] 수정</h1>
      <[Domain]Form mode="edit" initialValues={data} onSubmit={handleSubmit} />
    </div>
  );
}
```

**Index files for all views**: `src/views/[domain]/*/index.ts`

### 9. App Routes

#### List Page (`app/admin/[domain]s/page.tsx`)

```typescript
import { get[Domain]List } from '@/entities/[domain]';
import { [Domain]ListView } from '@/views/[domain]/list';
import { PAGES } from '@/shared/constants';

export const metadata = PAGES.ADMIN.[DOMAIN_UPPER].LIST.metadata;

/**
 * [Domain] 리스트 페이지
 */
export default async function [Domain]ListPage() {
  const data = await get[Domain]List();
  return <[Domain]ListView initialData={data} />;
}
```

#### Detail Page (`app/admin/[domain]s/[id]/page.tsx`)

```typescript
import { get[Domain] } from '@/entities/[domain]';
import { [Domain]DetailView } from '@/views/[domain]/detail';
import { PAGES } from '@/shared/constants';

export const metadata = PAGES.ADMIN.[DOMAIN_UPPER].DETAIL.metadata;

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * [Domain] 상세 페이지
 */
export default async function [Domain]DetailPage({ params }: Props) {
  const { id } = await params;
  const data = await get[Domain](parseInt(id));
  return <[Domain]DetailView data={data} />;
}
```

#### Create Page (`app/admin/[domain]s/create/page.tsx`)

```typescript
import { [Domain]CreateView } from '@/views/[domain]/create';
import { PAGES } from '@/shared/constants';

export const metadata = PAGES.ADMIN.[DOMAIN_UPPER].CREATE.metadata;

/**
 * [Domain] 생성 페이지
 */
export default function [Domain]CreatePage() {
  return <[Domain]CreateView />;
}
```

#### Edit Page (`app/admin/[domain]s/[id]/edit/page.tsx`)

```typescript
import { get[Domain] } from '@/entities/[domain]';
import { [Domain]EditView } from '@/views/[domain]/edit';
import { PAGES } from '@/shared/constants';

export const metadata = PAGES.ADMIN.[DOMAIN_UPPER].EDIT.metadata;

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * [Domain] 수정 페이지
 */
export default async function [Domain]EditPage({ params }: Props) {
  const { id } = await params;
  const data = await get[Domain](parseInt(id));
  return <[Domain]EditView data={data} />;
}
```

## Implementation Checklist

- [ ] PAGES 상수 추가 (routes.ts)
- [ ] AdminSidebar 메뉴 추가 (sidebarData.ts)
- [ ] Entity 스키마 생성 (순수 요청 스키마)
- [ ] Entity API 함수 생성 (CRUD operations)
- [ ] Form 스키마 생성 (transform + validation)
- [ ] Form 컴포넌트 생성 (create/edit 모드)
- [ ] DataTable 컴포넌트 생성 (row click → detail)
- [ ] View 컴포넌트 생성 (list/detail/create/edit)
- [ ] App Route 생성 (4개 페이지)
- [ ] 모든 파일에 JSDoc 주석
- [ ] 모든 인터페이스 프로퍼티 주석
- [ ] Index.ts Public API exports
- [ ] FSD 의존성 규칙 준수
- [ ] Shadcn UI 컴포넌트 사용

## FSD Structure Output

```
src/
├── entities/
│   └── [domain]/
│       ├── api/
│       │   └── [domain].api.ts
│       ├── model/
│       │   └── [domain].schema.ts
│       └── index.ts
├── features/
│   ├── [domain]-form/
│   │   ├── model/
│   │   │   └── [domain]-form.schema.ts
│   │   ├── ui/
│   │   │   └── [Domain]Form.tsx
│   │   └── index.ts
│   └── [domain]-table/
│       ├── ui/
│       │   └── [Domain]DataTable.tsx
│       └── index.ts
├── views/
│   └── [domain]/
│       ├── list/
│       │   ├── ui/
│       │   │   └── [Domain]ListView.tsx
│       │   └── index.ts
│       ├── detail/
│       │   ├── ui/
│       │   │   └── [Domain]DetailView.tsx
│       │   └── index.ts
│       ├── create/
│       │   ├── ui/
│       │   │   └── [Domain]CreateView.tsx
│       │   └── index.ts
│       └── edit/
│           ├── ui/
│           │   └── [Domain]EditView.tsx
│           └── index.ts
└── widgets/
    └── admin-sidebar/
        └── lib/
            └── sidebarData.ts (updated)

app/
└── admin/
    └── [domain]s/
        ├── page.tsx (list)
        ├── create/
        │   └── page.tsx
        └── [id]/
            ├── page.tsx (detail)
            └── edit/
                └── page.tsx

src/shared/constants/
└── routes.ts (updated)
```

## Key Features

✅ **Complete CRUD**: List, Create, Detail, Edit, Delete
✅ **Shadcn DataTable**: Row click navigation to detail page
✅ **AdminSidebar Integration**: Auto-add menu with icon
✅ **PAGES Constants**: Type-safe routing
✅ **FSD Architecture**: Clean layer separation
✅ **Full JSDoc**: All functions and interfaces documented
✅ **Server Components**: List/Detail pages are Server Components
✅ **Client Components**: Form and interactive components only
✅ **Type Safety**: Full TypeScript with Zod validation
