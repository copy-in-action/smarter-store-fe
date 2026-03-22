# Zod 스키마 설계 가이드

## 원칙

- ❌ **응답 스키마 금지**: orval 자동 생성 타입 사용
- ✅ **요청 스키마만**: 생성/수정용만 Zod로 정의
- ✅ **레이어 분리**: Entities(순수 도메인) → Features(폼 특화)
- ✅ **타입 구분**: `z.input<T>` (입력) vs `z.output<T>` (출력)

## Entities: 기본 스키마 (순수 도메인)

```typescript
// src/entities/performance/model/performance.schema.ts
import { z } from 'zod';

export const createPerformanceSchema = z.object({
  title: z.string().min(1, "공연명을 입력해주세요").max(255),
  category: z.string().min(1, "카테고리를 선택해주세요"),
  visible: z.boolean().default(true),
  venueId: z.number().positive().optional(),
  startDate: z.string().min(1, "시작일을 입력해주세요"),
  endDate: z.string().min(1, "종료일을 입력해주세요"),
});

export type CreatePerformanceForm = z.infer<typeof createPerformanceSchema>;
```

## Features: Entities 상속 + 폼 로직

```typescript
// src/features/admin/performance-form/model/performance-form.schema.ts
import { createPerformanceSchema } from "@/entities/performance";
import { z } from 'zod';

export const createPerformanceFormSchema = createPerformanceSchema.extend({
  runningTime: z.string().optional().transform(val => parseInt(val, 10)),
  venueId: z.string().transform(val => parseInt(val, 10)).optional(),
  companyId: z.string().optional().transform(val => parseInt(val, 10)),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  { message: "종료일은 시작일보다 늦어야 합니다", path: ["endDate"] }
);

// Input: 폼에서 입력하는 타입 (venueId: string)
export type CreatePerformanceFormInput = z.input<typeof createPerformanceFormSchema>;
// Output: API로 전송할 타입 (venueId: number)
export type CreatePerformanceFormData = z.output<typeof createPerformanceFormSchema>;
```
