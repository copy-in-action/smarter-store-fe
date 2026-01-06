---
name: crud-generator
description: Automatically generate complete CRUD system when user mentions creating admin features, management pages, or CRUD operations. Triggers on phrases like "add CRUD for", "create admin page for", "add [feature] management"
---

# CRUD Generator Skill

Automatically detects and generates complete CRUD (Create, Read, Update, Delete) system for admin panel following FSD architecture and CLAUDE.md rules.

## Trigger Phrases

This skill activates when the user says:
- "관리자 [기능] CRUD 추가해줘"
- "[기능] 관리 페이지 만들어줘"
- "[기능] 리스트, 등록, 상세, 수정 페이지 추가"
- "Add CRUD for [feature]"
- "Create admin management for [feature]"
- "[기능] 추가하고 AdminSidebar에 메뉴 추가"

## Auto-Detection Examples

✅ **User**: "관리자 쿠폰 CRUD 추가하고 사이드바에 메뉴 추가해줘"
→ Generates: Complete CRUD for "coupon" with sidebar menu

✅ **User**: "상품 카테고리 관리 페이지 만들어줘"
→ Generates: Complete CRUD for "product-category"

✅ **User**: "이벤트 리스트, 등록, 상세, 수정, 삭제 기능 추가"
→ Generates: Complete CRUD for "event"

## What Gets Auto-Generated

### 1. PAGES Constants (`src/shared/constants/routes.ts`)

Adds new ADMIN route constants:

```typescript
[DOMAIN_UPPER]: {
  LIST: { path: "/admin/[domain]s", metadata: {...} },
  DETAIL: { path: (id) => `/admin/[domain]s/${id}`, metadata: {...} },
  CREATE: { path: "/admin/[domain]s/create", metadata: {...} },
  EDIT: { path: (id) => `/admin/[domain]s/${id}/edit`, metadata: {...} },
}
```

### 2. AdminSidebar Menu (`src/widgets/admin-sidebar/lib/sidebarData.ts`)

Adds new menu item with icon:

```typescript
{
  title: "[DisplayName]",
  url: "#",
  icon: [IconName],
  items: [
    { title: "[DisplayName] 리스트", url: PAGES.ADMIN.[DOMAIN].LIST.path },
    { title: "[DisplayName] 추가", url: PAGES.ADMIN.[DOMAIN].CREATE.path },
  ],
}
```

### 3. Entity Layer

**Schema** (`src/entities/[domain]/model/[domain].schema.ts`):
- Pure request validation (create/update)
- Zod schema with JSDoc
- No response schema (use orval types)

**API** (`src/entities/[domain]/api/[domain].api.ts`):
- `get[Domain]List()` - List all
- `get[Domain](id)` - Get by ID
- `create[Domain](data)` - Create new
- `update[Domain](id, data)` - Update existing
- `delete[Domain](id)` - Delete by ID

**Index** (`src/entities/[domain]/index.ts`):
- Export schema, API, types

### 4. Features Layer

**Form Schema** (`src/features/[domain]-form/model/[domain]-form.schema.ts`):
- Extends entity schema
- Transform logic (string→number)
- Complex validation (.refine())
- Separate input/output types

**Form Component** (`src/features/[domain]-form/ui/[Domain]Form.tsx`):
- Client component with react-hook-form
- Create/Edit mode support
- Shadcn UI components
- Full error handling

**DataTable** (`src/features/[domain]-table/ui/[Domain]DataTable.tsx`):
- Shadcn Table component
- Row click → navigate to detail page
- Edit/Delete buttons
- Type-safe with orval types

**Index files** for both features

### 5. Views Layer

**List View** (`src/views/[domain]/list/ui/[Domain]ListView.tsx`):
- Client component
- DataTable integration
- Delete confirmation
- Create button

**Detail View** (`src/views/[domain]/detail/ui/[Domain]DetailView.tsx`):
- Server component
- Display all fields
- Edit button

**Create View** (`src/views/[domain]/create/ui/[Domain]CreateView.tsx`):
- Client component
- Form integration
- Navigation after success

**Edit View** (`src/views/[domain]/edit/ui/[Domain]EditView.tsx`):
- Client component
- Pre-filled form
- Navigation after success

**Index files** for all views

### 6. App Routes

**List** (`app/admin/[domain]s/page.tsx`):
```typescript
export const metadata = PAGES.ADMIN.[DOMAIN].LIST.metadata;
export default async function [Domain]ListPage() {
  const data = await get[Domain]List();
  return <[Domain]ListView initialData={data} />;
}
```

**Detail** (`app/admin/[domain]s/[id]/page.tsx`):
```typescript
export const metadata = PAGES.ADMIN.[DOMAIN].DETAIL.metadata;
export default async function [Domain]DetailPage({ params }: Props) {
  const { id } = await params;
  const data = await get[Domain](parseInt(id));
  return <[Domain]DetailView data={data} />;
}
```

**Create** (`app/admin/[domain]s/create/page.tsx`):
```typescript
export const metadata = PAGES.ADMIN.[DOMAIN].CREATE.metadata;
export default function [Domain]CreatePage() {
  return <[Domain]CreateView />;
}
```

**Edit** (`app/admin/[domain]s/[id]/edit/page.tsx`):
```typescript
export const metadata = PAGES.ADMIN.[DOMAIN].EDIT.metadata;
export default async function [Domain]EditPage({ params }: Props) {
  const { id } = await params;
  const data = await get[Domain](parseInt(id));
  return <[Domain]EditView data={data} />;
}
```

## Domain Name Extraction

The skill automatically extracts domain names from natural language:

| User Input | Domain | Display Name | Icon (default) |
|------------|--------|--------------|----------------|
| "쿠폰 CRUD" | coupon | 쿠폰 | Ticket |
| "상품 카테고리 관리" | product-category | 상품 카테고리 | Package |
| "이벤트 추가" | event | 이벤트 | Calendar |
| "사용자 프로필" | user-profile | 사용자 프로필 | Users |

**Icon Suggestions** (lucide-react):
- 쿠폰/티켓: Ticket, Gift
- 상품/제품: Package, ShoppingBag
- 이벤트: Calendar, PartyPopper
- 사용자: Users, User
- 설정: Settings, Cog
- 주문: ShoppingCart, Receipt
- 배너: Image, Layout
- 공지사항: Bell, Megaphone
- 카테고리: Folder, Tags

## FSD Architecture Rules

```
app → views → widgets → features → entities → shared
     (only import from lower layers)
```

- **entities**: Pure domain logic (schema + API)
- **features**: UI components with business logic (forms, tables)
- **views**: Page-level orchestration (combine features)
- **widgets**: Complex UI blocks (sidebar, header)
- **app**: Next.js routes (metadata + server components)

## Mandatory Requirements

### Documentation
- ✅ **함수 JSDoc**: 목적, @param, @returns 필수
- ✅ **인터페이스 주석**: 모든 프로퍼티에 `/** 설명 */`
- ✅ **분기문 주석**: 5줄 이상 분기문에 설명 필수

### Code Standards
- ✅ **Server Component 우선**: 상호작용 필요시만 'use client'
- ✅ **FSD Public API**: index.ts를 통한 export만 허용
- ✅ **pnpm 사용**: npm, yarn 금지
- ✅ **Shadcn UI**: @/shared/ui에서 import (Table, Button, Card, Input 등)
- ✅ **PAGES 상수**: routes.ts의 PAGES 상수 사용
- ✅ **타입 안정성**: orval 생성 타입 + Zod 검증

### Schema Rules
- ❌ **응답 스키마 생성 금지**: orval 자동 생성 타입 사용
- ✅ **요청 스키마만**: create, update용만
- ✅ **FSD 의존성**: features가 entities 상속
- ✅ **폼 로직 분리**: entities(순수) vs features(폼 특화)
- ✅ **변환 로직**: `.transform()` 사용 (string → number)
- ✅ **검증 로직**: `.refine()` 사용 (복합 검증)

### DataTable Rules
- ✅ **Row Click**: 클릭 시 상세 페이지로 이동
- ✅ **Edit Button**: 수정 페이지로 이동
- ✅ **Delete Button**: 확인 후 삭제 + 리스트 갱신
- ✅ **Shadcn Table**: @/shared/ui/table 사용
- ✅ **Type Safety**: orval 생성 타입 사용

## Implementation Flow

1. **Extract Domain Info**
   - Parse user input for domain name
   - Convert to kebab-case
   - Determine display name (Korean)
   - Select appropriate icon

2. **Check Existing Code**
   - Look for orval generated types
   - Check if routes already exist
   - Verify AdminSidebar structure

3. **Update Shared Constants**
   - Add PAGES routes
   - Update AdminSidebar menu
   - Import icon from lucide-react

4. **Generate Entity Layer**
   - Create schema (pure validation)
   - Create API functions (CRUD)
   - Create index exports

5. **Generate Features Layer**
   - Create form schema (with transforms)
   - Create form component
   - Create DataTable component
   - Create index exports

6. **Generate Views Layer**
   - Create list view (client)
   - Create detail view (server)
   - Create create view (client)
   - Create edit view (client)
   - Create index exports

7. **Generate App Routes**
   - Create list page
   - Create detail page
   - Create create page
   - Create edit page
   - Add metadata

8. **Verify**
   - Check FSD dependencies
   - Verify all JSDoc present
   - Confirm Shadcn imports
   - Test routes in PAGES

## File Structure Output

```
src/
├── shared/constants/
│   └── routes.ts (updated)
├── widgets/admin-sidebar/lib/
│   └── sidebarData.ts (updated)
├── entities/[domain]/
│   ├── api/[domain].api.ts
│   ├── model/[domain].schema.ts
│   └── index.ts
├── features/
│   ├── [domain]-form/
│   │   ├── model/[domain]-form.schema.ts
│   │   ├── ui/[Domain]Form.tsx
│   │   └── index.ts
│   └── [domain]-table/
│       ├── ui/[Domain]DataTable.tsx
│       └── index.ts
├── views/[domain]/
│   ├── list/
│   │   ├── ui/[Domain]ListView.tsx
│   │   └── index.ts
│   ├── detail/
│   │   ├── ui/[Domain]DetailView.tsx
│   │   └── index.ts
│   ├── create/
│   │   ├── ui/[Domain]CreateView.tsx
│   │   └── index.ts
│   └── edit/
│       ├── ui/[Domain]EditView.tsx
│       └── index.ts

app/admin/[domain]s/
├── page.tsx (list)
├── create/page.tsx
└── [id]/
    ├── page.tsx (detail)
    └── edit/page.tsx
```

## Integration with Orval

When orval types exist:
1. Read API types from `src/shared/api/generated/`
2. Use response types directly (don't recreate)
3. Create request schemas based on API spec
4. Match field names and types exactly

## User Confirmation

Before generating, confirm:
1. Domain name (kebab-case)
2. Display name (Korean)
3. Icon name (lucide-react)
4. Plural form (e.g., coupons, categories)

Example:
```
도메인: coupon
표시명: 쿠폰
아이콘: Ticket
복수형: coupons
경로: /admin/coupons

생성할까요?
```

## Reference

All rules follow `F:\work\smarter-store-fe\CLAUDE.md`
