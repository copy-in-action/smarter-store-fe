---
description: Generate complete FSD form structure (entity schema + form schema + UI component)
argument-hint: [domain-name]
---

# Generate FSD Form Structure

Generate a complete Feature-Sliced Design (FSD) form structure for the given domain following CLAUDE.md rules.

## Domain Name
- **Argument**: `$1` (e.g., "booking-payment", "product-settings", "user-profile")
- **Format**: kebab-case

## What Gets Generated

### 1. Entity Schema (Pure Request Schema)
**Location**: `src/entities/[domain]/model/[domain].schema.ts`

```typescript
import { z } from "zod";

/**
 * [Domain] 생성 요청 스키마
 * orval 타입 기반 - 응답 스키마 생성 금지
 */
export const create[Domain]Schema = z.object({
  /** 필드 설명 */
  field1: z.string().min(1, "필드1을 입력해주세요"),
  /** 필드2 설명 */
  field2: z.number().positive().optional(),
  // orval API 스펙의 모든 필드 포함
});

/**
 * [Domain] 수정 요청 스키마
 */
export const update[Domain]Schema = z.object({
  // 수정용 필드
});

export type Create[Domain]Form = z.infer<typeof create[Domain]Schema>;
export type Update[Domain]Form = z.infer<typeof update[Domain]Schema>;
```

**Index Export**: `src/entities/[domain]/index.ts`
```typescript
export { create[Domain]Schema, update[Domain]Schema } from './model/[domain].schema';
export type { Create[Domain]Form, Update[Domain]Form } from './model/[domain].schema';
```

### 2. Form Schema (Entity 상속 + 폼 로직)
**Location**: `src/features/[domain]-form/model/[domain]-form.schema.ts`

```typescript
import { create[Domain]Schema } from "@/entities/[domain]";
import { z } from "zod";

/**
 * [Domain] 생성 폼 스키마
 * - 문자열→숫자 변환
 * - 복합 검증 로직
 */
export const create[Domain]FormSchema = create[Domain]Schema.extend({
  /** 문자열로 받아 숫자로 변환하는 필드 */
  numericField: z.string().transform(val => parseInt(val, 10)).optional(),
}).refine(
  (data) => {
    // 복합 검증 로직 (예: 날짜 비교)
    return true;
  },
  { message: "검증 오류 메시지", path: ["fieldName"] }
);

/** 폼 입력 타입 (transform 전) */
export type Create[Domain]FormInput = z.input<typeof create[Domain]FormSchema>;
/** 폼 출력 타입 (transform 후, 서버 전송용) */
export type Create[Domain]FormData = z.output<typeof create[Domain]FormSchema>;

// 호환성 유지
export const [domain]FormSchema = create[Domain]FormSchema;
export type [Domain]FormInput = Create[Domain]FormInput;
export type [Domain]FormData = Create[Domain]FormData;
```

**Index Export**: `src/features/[domain]-form/index.ts`
```typescript
export { create[Domain]FormSchema, [domain]FormSchema } from './model/[domain]-form.schema';
export type { Create[Domain]FormInput, Create[Domain]FormData } from './model/[domain]-form.schema';
export { [Domain]Form } from './ui/[Domain]Form';
```

### 3. Form Component
**Location**: `src/features/[domain]-form/ui/[Domain]Form.tsx`

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { create[Domain]FormSchema } from '../model/[domain]-form.schema';
import type { Create[Domain]FormInput, Create[Domain]FormData } from '../model/[domain]-form.schema';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

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
 * @param initialValues - 폼 초기값
 * @param onSubmit - 제출 핸들러
 * @param isLoading - 로딩 상태
 */
export function [Domain]Form({ initialValues, onSubmit, isLoading }: [Domain]FormProps) {
  const form = useForm<Create[Domain]FormInput>({
    resolver: zodResolver(create[Domain]FormSchema),
    defaultValues: initialValues,
  });

  /**
   * 폼 제출 처리
   * @param data - 검증된 폼 데이터
   */
  const handleSubmit = async (data: Create[Domain]FormData) => {
    await onSubmit(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>[Domain] 폼</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* 폼 필드들 */}
          <div>
            <label htmlFor="field1">필드1</label>
            <Input
              id="field1"
              {...form.register('field1')}
              placeholder="필드1 입력"
            />
            {form.formState.errors.field1 && (
              <p className="text-sm text-red-500">
                {form.formState.errors.field1.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? '처리 중...' : '제출'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

## Implementation Steps

1. **Read API spec** (if orval types exist)
   - Check `src/shared/api/generated/` for API types
   - Identify request payload fields

2. **Create Entity Schema**
   - Pure request validation schema only
   - No response schema (use orval types)
   - All fields with proper zod validators
   - JSDoc for each field

3. **Create Form Schema**
   - Extend entity schema
   - Add `.transform()` for string→number conversions
   - Add `.refine()` for complex validations
   - Export input/output types separately

4. **Create Form Component**
   - Use 'use client' directive
   - react-hook-form + zodResolver
   - Shadcn UI components from @/shared/ui
   - Full JSDoc on component and handlers
   - Proper error display

5. **Create Index Exports**
   - Both entity and feature level
   - Only public API exports

## Requirements Checklist

- [ ] 모든 함수에 JSDoc 주석 (목적, @param, @returns)
- [ ] 모든 인터페이스 프로퍼티에 주석
- [ ] 5줄 이상 분기문에 설명 주석
- [ ] Server Component 우선 (폼만 'use client')
- [ ] FSD Public API (index.ts)
- [ ] Shadcn UI 사용 (@/shared/ui)
- [ ] pnpm 사용
- [ ] Entity: 요청 스키마만 생성
- [ ] Features: Entity 상속 + 폼 로직

## Example Usage

```bash
/generate-fsd-form booking-payment
/generate-fsd-form product-settings
/generate-fsd-form user-profile
```

## Output Structure

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
