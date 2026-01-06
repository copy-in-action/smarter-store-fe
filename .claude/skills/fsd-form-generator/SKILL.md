---
name: fsd-form-generator
description: Automatically generate FSD form structures when user mentions creating forms, form validation, or form components. Triggers on phrases like "generate form", "create form schema", "add form for [feature]"
---

# FSD Form Generator Skill

Automatically detects and generates complete FSD (Feature-Sliced Design) form structures following the project's CLAUDE.md guidelines.

## Trigger Phrases

This skill activates when the user says:
- "Generate a form for [domain]"
- "Create form schema for [feature]"
- "Add [domain] form component"
- "I need a form to handle [feature]"
- "Make a validation schema for [domain]"

## Auto-Detection Examples

✅ **User**: "Create a form for payment processing"
→ Generates: `booking-payment` form structure

✅ **User**: "I need a form schema for product filtering"
→ Generates: `product-filter` form structure

✅ **User**: "Add a user settings form with validation"
→ Generates: `user-settings` form structure

## What Gets Auto-Generated

### 1. Entity Schema (`src/entities/[domain]/model/[domain].schema.ts`)

Pure request validation schema based on API spec:

```typescript
import { z } from "zod";

/**
 * [Domain] 생성 요청 스키마
 * orval 타입 기반 - 응답 스키마 생성 금지
 */
export const create[Domain]Schema = z.object({
  /** 필드 설명 */
  field: z.string().min(1, "필드를 입력해주세요"),
});

export type Create[Domain]Form = z.infer<typeof create[Domain]Schema>;
```

**Key Rules**:
- ❌ No response schemas (use orval generated types)
- ✅ Request schemas only (create, update)
- ✅ All fields documented with JSDoc
- ✅ Proper zod validators

### 2. Form Schema (`src/features/[domain]-form/model/[domain]-form.schema.ts`)

Extends entity schema with form-specific logic:

```typescript
import { create[Domain]Schema } from "@/entities/[domain]";
import { z } from "zod";

/**
 * [Domain] 폼 스키마
 * - 문자열→숫자 변환
 * - 복합 검증 로직
 */
export const create[Domain]FormSchema = create[Domain]Schema.extend({
  numericField: z.string().transform(val => parseInt(val, 10)),
}).refine(
  (data) => validateLogic(data),
  { message: "검증 오류", path: ["field"] }
);

export type Create[Domain]FormInput = z.input<typeof create[Domain]FormSchema>;
export type Create[Domain]FormData = z.output<typeof create[Domain]FormSchema>;
```

**Key Features**:
- ✅ Extends entity schema (FSD dependency)
- ✅ `.transform()` for type conversions
- ✅ `.refine()` for complex validations
- ✅ Separate input/output types

### 3. Form Component (`src/features/[domain]-form/ui/[Domain]Form.tsx`)

React Hook Form + Zod integration:

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { create[Domain]FormSchema } from '../model/[domain]-form.schema';
import type { Create[Domain]FormInput, Create[Domain]FormData } from '../model/[domain]-form.schema';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

/**
 * [Domain] 폼 Props
 */
interface [Domain]FormProps {
  /** 초기값 */
  initialValues?: Partial<Create[Domain]FormInput>;
  /** 제출 핸들러 */
  onSubmit: (data: Create[Domain]FormData) => Promise<void>;
  /** 로딩 상태 */
  isLoading?: boolean;
}

/**
 * [Domain] 생성/수정 폼 컴포넌트
 */
export function [Domain]Form({ initialValues, onSubmit, isLoading }: [Domain]FormProps) {
  const form = useForm<Create[Domain]FormInput>({
    resolver: zodResolver(create[Domain]FormSchema),
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Fields with Shadcn UI components */}
      <Button type="submit" disabled={isLoading}>제출</Button>
    </form>
  );
}
```

**Key Features**:
- ✅ 'use client' directive
- ✅ react-hook-form + zodResolver
- ✅ Shadcn UI components (@/shared/ui)
- ✅ Full JSDoc documentation
- ✅ Proper TypeScript types

### 4. Index Exports

**Entity**: `src/entities/[domain]/index.ts`
```typescript
export { create[Domain]Schema } from './model/[domain].schema';
export type { Create[Domain]Form } from './model/[domain].schema';
```

**Feature**: `src/features/[domain]-form/index.ts`
```typescript
export { create[Domain]FormSchema } from './model/[domain]-form.schema';
export type { Create[Domain]FormInput, Create[Domain]FormData } from './model/[domain]-form.schema';
export { [Domain]Form } from './ui/[Domain]Form';
```

## FSD Architecture Rules

```
app → views → widgets → features → entities → shared
     (only import from lower layers)
```

- **entities**: Pure domain schemas (request only)
- **features**: Business logic + UI (extends entities)
- **shared**: Reusable UI components (Shadcn)

## Mandatory Requirements

### Documentation
- ✅ **함수 JSDoc**: 목적, @param, @returns 필수
- ✅ **인터페이스 주석**: 모든 프로퍼티에 `/** 설명 */`
- ✅ **분기문 주석**: 5줄 이상 분기문에 설명 필수

### Code Standards
- ✅ **Server Component 우선**: 상호작용 필요시만 'use client'
- ✅ **FSD Public API**: index.ts를 통한 export만 허용
- ✅ **pnpm 사용**: npm, yarn 금지
- ✅ **Shadcn UI**: @/shared/ui에서 import
- ✅ **PAGES 상수**: routes.ts의 PAGES 상수 사용

### Schema Rules
- ❌ **응답 스키마 생성 금지**: orval 자동 생성 타입 사용
- ✅ **요청 스키마만**: create, update용만
- ✅ **FSD 의존성**: features가 entities 상속
- ✅ **폼 로직 분리**: entities(순수) vs features(폼 특화)
- ✅ **변환 로직**: `.transform()` 사용
- ✅ **검증 로직**: `.refine()` 사용

## Implementation Flow

1. **Detect Domain Name**
   - Extract from user's natural language
   - Convert to kebab-case (e.g., "payment processing" → "payment-processing")

2. **Check Existing Code**
   - Look for orval generated API types
   - Check existing entity/feature structure
   - Identify similar patterns in codebase

3. **Generate Entity Schema**
   - Pure request validation
   - No response schemas
   - All fields documented

4. **Generate Form Schema**
   - Extend entity schema
   - Add transforms and refinements
   - Separate input/output types

5. **Generate Form Component**
   - react-hook-form setup
   - Shadcn UI components
   - Full JSDoc documentation

6. **Create Index Exports**
   - Entity public API
   - Feature public API

7. **Verify**
   - Check FSD dependencies
   - Verify all JSDoc present
   - Confirm Shadcn imports

## File Structure Output

```
src/
├── entities/
│   └── [domain]/
│       ├── model/
│       │   └── [domain].schema.ts
│       └── index.ts
└── features/
    └── [domain]-form/
        ├── model/
        │   └── [domain]-form.schema.ts
        ├── ui/
        │   └── [Domain]Form.tsx
        └── index.ts
```

## Integration with Orval

When orval types exist at `src/shared/api/generated/`:
1. Read the API spec types
2. Match request payload interfaces
3. Generate zod schema based on API fields
4. Use orval response types (don't recreate)

## Reference

All rules follow `F:\work\smarter-store-fe\CLAUDE.md`
