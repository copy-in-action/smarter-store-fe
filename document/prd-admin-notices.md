# PRD: 관리자 공지사항 관리 (Admin Notices CRUD)

## 1. 개요

관리자가 카테고리별 공지사항을 등록, 수정, 삭제하고 활성화 상태를 관리할 수 있는 CRUD 기능

## 2. 기술 스택

- **Form 관리**: React Hook Form + Zod
- **UI 컴포넌트**: Shadcn UI
  - Select (카테고리)
  - Textarea (내용)
  - Button, Card, Dialog 등
- **API 엔드포인트**:
  - `/admin/notices` - 공지사항 CRUD
  - `/api/notices/grouped` - 카테고리별 그룹화된 공지사항 조회

## 3. 주요 기능

### 3.1 공지사항 리스트 페이지 (`/admin/notices`)

#### 데이터 조회
- **API**: `GET /api/notices/grouped`
- **응답 구조**: 활성화된 공지사항이 있는 카테고리만 반환
  ```typescript
  NoticeGroupResponse[] // isActive=true인 공지사항이 있는 카테고리만 포함
  ```

> **TODO [BE 구조 변경 요청]**: 현재 `GET /api/notices/grouped`는 `isActive=true`인 공지사항이
> 있는 카테고리만 반환합니다. 관리자 화면에서 모든 카테고리를 항상 표시하려면,
> BE에서 비활성(또는 미등록) 카테고리도 포함한 전체 카테고리 목록을 반환하도록 변경이 필요합니다.
> 현재는 FE에서 `NoticeCategory` enum 값으로 모든 카테고리를 순회하여 보완합니다.

#### UI 구성
```
┌──────────────────────────────────────────────────┐
│  공지사항 관리                        [+ 새 공지사항] │
├──────────────────────────────────────────────────┤
│                                                  │
│  📌 [Category 1 Description] [공지사항 변경]      │
│  ┌──────────────────────────────────────────────┐│
│  │ [활성 배지]                                  ││
│  │ Content 미리보기 (6줄)...                    ││
│  │ [더보기]                                     ││
│  └──────────────────────────────────────────────┘│
│                                                  │
│  📌 [Category 2 Description] [공지사항 변경]      │
│  ┌──────────────────────────────────────────────┐│
│  │ 등록된 공지사항이 없습니다.                   ││
│  └──────────────────────────────────────────────┘│
│                                                  │
└──────────────────────────────────────────────────┘
```

#### 상세 기능
- **카테고리별 그룹 표시**
  - `NoticeCategory` enum의 모든 카테고리를 순서대로 표시
  - `categoryDescription`을 제목으로 표시 (API 응답 우선, 없으면 로컬 매핑 사용)

- **[공지사항 변경] 버튼** (카테고리 제목 옆)
  - 클릭 시 해당 카테고리의 전체 공지사항 목록 다이얼로그 표시
  - 다이얼로그 내 기능: 검색, 카드 목록(스크롤), 활성화, 상세보기, 인라인 수정/삭제

- **공지사항 카드 (활성화된 공지사항이 있는 경우)**
  - Content 미리보기: 6줄로 제한 (`line-clamp-6`)
  - **더보기 버튼**: 클릭 시 전체 content 펼쳐서 표시
  - **접기 버튼**: 펼쳐진 상태에서 클릭 시 다시 6줄로 접기
  - 더보기/접기 버튼은 항상 표시 (`variant="ghost"`)

- **빈 카드 (활성화된 공지사항이 없는 경우)**
  - "등록된 공지사항이 없습니다." 메시지 표시

- **새 공지사항 버튼**: 등록 페이지로 이동

### 3.1.1 공지사항 변경 다이얼로그

다이얼로그는 내부에 **list / detail** 두 가지 뷰를 가집니다.

#### list 뷰 UI
```
┌──────────────────────────────────────────────────┐
│ [카테고리명] 공지사항 목록                    [X] │
├──────────────────────────────────────────────────┤
│ 🔍 [내용으로 검색...]                            │
├──────────────────────────────────────────────────┤
│ ↕ 스크롤 영역 (max-h: 다이얼로그 높이 초과 방지) │
│ ┌────────────────────────────────────────────────┐│
│ │ [활성] 2026.02.19  [비활성화] [상세보기]       ││ ← border-primary
│ │ 예매 전 반드시 공연 일시와 좌석을 확인...      ││
│ └────────────────────────────────────────────────┘│
│ ┌────────────────────────────────────────────────┐│
│ │ [비활성] 2026.01.05  [활성화] [상세보기]       ││
│ │ 좌석 선택 후 15분 이내에 결제를 완료해야...    ││
│ └────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────┘
```

#### detail 뷰 UI (조회 모드)
```
┌──────────────────────────────────────────────────┐
│ [카테고리명] 공지사항 상세                    [X] │
├──────────────────────────────────────────────────┤
│ [← 목록으로]                   [수정] [삭제]     │
│ ──────────────────────────────────────────────── │
│ 카테고리  [예매 유의사항 ▼] (비활성)             │
│ 상태      [활성 배지]                            │
│ 수정일    2026.02.19                             │
│ ──────────────────────────────────────────────── │
│ 내용                                             │
│ ┌──────────────────────────────────────────────┐│
│ │ 전체 내용 (readOnly, bg-muted/30)             ││
│ └──────────────────────────────────────────────┘│
└──────────────────────────────────────────────────┘
```

#### detail 뷰 UI (수정 모드)
```
┌──────────────────────────────────────────────────┐
│ [카테고리명] 공지사항 상세                    [X] │
├──────────────────────────────────────────────────┤
│ [← 목록으로]                   [취소] [저장]     │
│ ──────────────────────────────────────────────── │
│ 카테고리  [예매 유의사항 ▼] (활성 - 변경 가능)  │
│ 상태      [활성 배지]                            │
│ 수정일    2026.02.19                             │
│ ──────────────────────────────────────────────── │
│ 내용                                             │
│ ┌──────────────────────────────────────────────┐│
│ │ 편집 가능한 Textarea                          ││
│ └──────────────────────────────────────────────┘│
└──────────────────────────────────────────────────┘
```

#### 동작
- **검색** (list 뷰): content 포함 여부로 실시간 필터링 (대소문자 무관)
- **활성 공지사항** (list 뷰): 카드 테두리 `border-primary` 강조
- **[활성화/비활성화] 토글** (list 뷰):
  - 현재 활성 → "비활성화" (`variant="secondary"`), 비활성 → "활성화" (`variant="default"`)
  - AlertDialog 확인 후 `PATCH /admin/notices/{id}/status` 호출
- **[상세보기] 클릭** (list 뷰): 다이얼로그 내 detail 뷰로 전환 (페이지 이동 없음)
- **[← 목록으로] 클릭** (detail 뷰): list 뷰로 복귀, 수정 모드 초기화
- **[수정] 클릭** (detail 뷰): 수정 모드 진입 — Select 활성화, Textarea 편집 가능
- **[저장] 클릭** (detail 뷰 수정 모드): `PUT /admin/notices/{id}` 호출 후 조회 모드 복귀
- **[취소] 클릭** (detail 뷰 수정 모드): 폼 원본 데이터로 초기화 후 조회 모드 복귀
- **[삭제] 클릭** (detail 뷰): AlertDialog 확인 → 삭제 → list 뷰로 복귀
- **다이얼로그 닫기**: 뷰·검색어·선택 상태·수정 모드 전체 초기화

### 3.2 공지사항 등록 페이지 (`/admin/notices/create`)

#### Form Fields

| 필드 | 타입 | 컴포넌트 | 검증 규칙 | 기본값 |
|------|------|----------|-----------|--------|
| category | string | Shadcn Select | 필수 | - |
| content | string | Shadcn Textarea | 필수, 최소 10자 | - |

> **Note**: `isActive`는 서버에서 항상 `false`로 설정하므로 등록 폼에서 제외됩니다.
> (`CreateNoticeRequest` 인터페이스에 `isActive` 필드 없음)

#### UI 구성
```
┌─────────────────────────────────────┐
│  공지사항 등록                       │
├─────────────────────────────────────┤
│                                     │
│  카테고리 *                         │
│  [카테고리 선택 ▼]                  │
│                                     │
│  내용 *                             │
│  ┌────────────────────────────────┐│
│  │                                ││
│  │  (Textarea - 최소 10자)        ││
│  │                                ││
│  └────────────────────────────────┘│
│                                     │
│  [취소]              [등록]         │
└─────────────────────────────────────┘
```

#### 동작
- **등록 API**: `POST /admin/notices`
- **isActive**: 서버에서 자동으로 `false` 설정 (요청 필드에 포함하지 않음)
- 등록 성공 시 리스트 페이지로 이동

## 4. API 명세

### 4.1 공지사항 목록 조회 (그룹화)
```
GET /api/notices/grouped

Response:
{
  "SYSTEM": {
    "categoryDescription": "시스템 공지",
    "notices": [
      {
        "id": 1,
        "category": "SYSTEM",
        "content": "시스템 점검 안내...",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ]
  },
  "EVENT": {
    "categoryDescription": "이벤트 공지",
    "notices": [...]
  }
}
```

### 4.2 공지사항 생성
```
POST /admin/notices

Request:
{
  "category": "SYSTEM",
  "content": "공지사항 내용"
}
// isActive는 서버에서 자동으로 false 설정

Response:
{
  "id": 1,
  "category": "SYSTEM",
  "content": "공지사항 내용",
  "isActive": false,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 4.3 공지사항 상세 조회
```
GET /admin/notices/{id}

Response:
{
  "id": 1,
  "category": "SYSTEM",
  "categoryDescription": "시스템 공지",
  "content": "공지사항 내용",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 4.4 공지사항 수정
```
PUT /admin/notices/{id}

Request:
{
  "category": "SYSTEM",
  "content": "수정된 내용"
}
// isActive 포함 불가 — 상태 변경은 4.5 전용 엔드포인트 사용

Response:
{
  "id": 1,
  "category": "SYSTEM",
  "content": "수정된 내용",
  "isActive": false,
  "updatedAt": "2024-01-02T00:00:00Z"
}
```

### 4.5 공지사항 상태 변경
```
PATCH /admin/notices/{id}/status

Request:
{
  "isActive": true
}

Response:
{
  "id": 1,
  "isActive": true,
  "updatedAt": "2024-01-02T00:00:00Z"
}

Note: isActive를 true로 변경 시, 동일 카테고리의 다른 공지사항 자동 비활성화
```

### 4.6 공지사항 삭제
```
DELETE /admin/notices/{id}

Response:
{
  "success": true,
  "message": "공지사항이 삭제되었습니다."
}
```

## 5. Zod 스키마 정의

### 5.1 Entity Schema (`entities/notice`)
```typescript
// src/entities/notice/model/notice.schema.ts
import { z } from 'zod';

// POST /admin/notices — isActive 없음 (서버 자동 false 설정)
export const createNoticeSchema = z.object({
  category: z.enum([...NoticeCategory 값들...]),
  content: z.string().min(10, "내용은 최소 10자 이상 입력해주세요"),
});

// PUT /admin/notices/{id} — isActive 없음 (상태 변경은 별도 엔드포인트)
export const updateNoticeSchema = createNoticeSchema;

// PATCH /admin/notices/{id}/status 전용
export const updateNoticeStatusSchema = z.object({
  isActive: z.boolean(),
});

export type CreateNoticeForm = z.infer<typeof createNoticeSchema>;
export type UpdateNoticeForm = z.infer<typeof updateNoticeSchema>;
export type UpdateNoticeStatusForm = z.infer<typeof updateNoticeStatusSchema>;
```

### 5.2 Feature Form Schema (`features/admin/notice-form`)
```typescript
// src/features/admin/notice-form/model/notice-form.schema.ts
import { createNoticeSchema, updateNoticeSchema } from "@/entities/notice";

// Entity 스키마 그대로 사용 (isActive 모두 제외)
export const createNoticeFormSchema = createNoticeSchema;
export const updateNoticeFormSchema = updateNoticeSchema;

export type CreateNoticeFormData = z.infer<typeof createNoticeFormSchema>;
export type UpdateNoticeFormData = z.infer<typeof updateNoticeFormSchema>;
// CreateNoticeFormData === UpdateNoticeFormData = { category, content }
```

## 6. FSD 아키텍처 구조

```
src/
├── views/
│   └── admin/
│       └── notice/
│           ├── list/             # 공지사항 리스트 페이지
│           │   ├── ui/
│           │   │   ├── NoticeListView.tsx
│           │   │   └── NoticeCategoryDialog.tsx  # list/detail 뷰 + 인라인 수정
│           │   └── index.ts
│           └── create/           # 공지사항 등록 페이지
│               ├── ui/
│               │   └── NoticeCreateView.tsx
│               └── index.ts
│
├── features/
│   └── admin/
│       └── notice-form/          # 공지사항 폼 (등록 전용)
│           ├── ui/
│           │   ├── NoticeForm.tsx
│           │   ├── NoticeCategorySelect.tsx
│           │   └── NoticeContentTextarea.tsx
│           ├── model/
│           │   └── notice-form.schema.ts
│           └── index.ts
│
├── entities/
│   └── notice/
│       ├── ui/
│       │   ├── NoticeCard.tsx        # 리스트 카드 (더보기/접기)
│       │   └── NoticeGroupCard.tsx   # 카테고리별 그룹 카드
│       ├── api/
│       │   ├── notice.api.ts
│       │   └── notice.queries.ts
│       ├── model/
│       │   ├── notice.types.ts       # orval 생성 타입
│       │   └── notice.schema.ts      # Zod 스키마
│       └── index.ts
│
└── widgets/
    └── admin-sidebar/
        └── ... (기존 구조)
```

## 7. 라우팅

| 경로 | 설명 | View 컴포넌트 | 실제 파일 경로 |
|------|------|----------------|----------------|
| `/admin/notices` | 공지사항 리스트 | `NoticeListView` | `views/admin/notice/list` |
| `/admin/notices/create` | 공지사항 등록 | `NoticeCreateView` | `views/admin/notice/create` |

> **Note**: 상세 조회 및 수정은 별도 페이지 없이 **공지사항 변경 다이얼로그** 내 detail 뷰에서 인라인 처리합니다.

**Next.js App Router 파일 경로:**
- `app/admin/notices/page.tsx` → NoticeListView
- `app/admin/notices/create/page.tsx` → NoticeCreateView

## 8. 구현 체크리스트

### Phase 1: Entity Layer
- [x] `entities/notice/model/notice.types.ts` - orval 타입 re-export
- [x] `entities/notice/model/notice.schema.ts` - Zod 스키마 정의 (요청용만)
- [x] `entities/notice/api/notice.api.ts` - orval API 함수 래핑
- [x] `entities/notice/api/notice.queries.ts` - React Query hooks 구현
- [x] `entities/notice/ui/NoticeCard.tsx` - 공지사항 카드 컴포넌트 (더보기/접기, `line-clamp-6`)
- [x] `entities/notice/ui/NoticeGroupCard.tsx` - 카테고리 그룹 카드
- [x] `entities/notice/index.ts` - Public API export

**Note**: Orval에 이미 다음 타입과 API가 생성되어 있음
- 타입: `NoticeResponse`, `NoticeGroupResponse`, `NoticeCategory`, `CreateNoticeRequest`, `UpdateNoticeRequest`, `NoticeStatusRequest`
- API: `createNotice`, `updateNotice`, `deleteNotice`, `getNoticeById`, `getAllNotices`, `updateNoticeStatus`, `getActiveNoticesGrouped`

### Phase 2: Feature Layer
- [x] `features/admin/notice-form/model/notice-form.schema.ts` - 폼 스키마 (entities 상속)
- [x] `features/admin/notice-form/ui/NoticeForm.tsx` - 메인 폼 컴포넌트 (등록 전용)
- [x] `features/admin/notice-form/ui/NoticeCategorySelect.tsx` - 카테고리 선택 (Shadcn Select)
- [x] `features/admin/notice-form/ui/NoticeContentTextarea.tsx` - 내용 입력 (Shadcn Textarea)
- [x] `features/admin/notice-form/index.ts` - Public API export

### Phase 3: Views Layer
- [x] `views/admin/notice/list/ui/NoticeListView.tsx` - 리스트 페이지
- [x] `views/admin/notice/list/ui/NoticeCategoryDialog.tsx` - 카테고리별 공지사항 다이얼로그 (list/detail 뷰 + 인라인 수정)
- [x] `views/admin/notice/list/index.ts` - Public API export
- [x] `views/admin/notice/create/ui/NoticeCreateView.tsx` - 등록 페이지
- [x] `views/admin/notice/create/index.ts` - Public API export
- ~~`views/admin/notice/detail/`~~ - 제거 (다이얼로그 내 인라인 처리로 대체)
- ~~`views/admin/notice/edit/`~~ - 제거 (다이얼로그 내 인라인 처리로 대체)

### Phase 4: Routing & Integration
- [x] Next.js App Router 페이지 생성
  - [x] `app/admin/(auth)/notices/page.tsx` - 리스트 페이지
  - [x] `app/admin/(auth)/notices/create/page.tsx` - 등록 페이지
  - ~~`app/admin/(auth)/notices/[id]/page.tsx`~~ - 제거
  - ~~`app/admin/(auth)/notices/[id]/edit/page.tsx`~~ - 제거
- [x] PAGES 상수 추가 (`@/shared/config/routes.ts`) — `LIST`, `CREATE`만 유지
- [x] Admin Sidebar 메뉴 항목 추가 (`widgets/admin-sidebar/lib/sidebarData.ts`)
- [ ] 권한 체크 (Admin만 접근 가능) - (auth) 라우트 그룹으로 처리됨

### Phase 5: UX 개선
- [x] 삭제 확인 다이얼로그 (NoticeCategoryDialog)
- [x] 더보기/접기 기능 (NoticeCard, `line-clamp-6` 정적 클래스 사용)
- [x] 로딩 상태 표시 (모든 View 컴포넌트)
- [x] 에러 핸들링 및 토스트 메시지 (sonner 사용)
- [x] 공지사항 변경 다이얼로그 (list/detail 뷰 전환, 활성화 토글, 검색, 인라인 수정)
- [x] 등록/수정 폼에서 isActive 제거 (상태 변경은 다이얼로그 전용)
- [x] 리스트 페이지: 모든 카테고리 표시 (NoticeCategory enum 순회)
- [x] `entities/notice/ui/NoticeGroupCard.tsx` - [공지사항 변경] 버튼 추가

## 9. 주의사항

1. **isActive 변경 정책**
   - 활성화/비활성화는 **목록 페이지 공지사항 변경 다이얼로그**에서만 가능
   - 수정 폼(`PUT /admin/notices/{id}`)에는 `isActive` 포함 불가
   - 상태 변경은 `PATCH /admin/notices/{id}/status` 전용 엔드포인트 사용
   - 실제 동일 카테고리 비활성화 로직은 백엔드에서 처리

2. **FSD 아키텍처 준수**
   - `entities/notice`: 순수 도메인 로직 (서버 API 스펙)
   - `features/admin/notice-form`: 폼 UI 및 검증 로직 (등록 전용)
   - `views/admin/notice/list`: 리스트 + 다이얼로그(인라인 수정 포함)
   - `views/admin/notice/create`: 등록 페이지

3. **Public API 원칙**
   - 각 레이어의 index.ts를 통해서만 export
   - 내부 컴포넌트는 외부에 노출하지 않음

4. **Server Component 우선**
   - 리스트, 등록 페이지는 Server Component
   - 폼·다이얼로그 컴포넌트만 `'use client'` 사용

5. **Tailwind 동적 클래스 주의**
   - `line-clamp-${n}` 형태의 동적 클래스는 JIT 컴파일러가 감지하지 못함
   - 반드시 정적 클래스명 사용 (`line-clamp-6` 등) 또는 `cn()` 조건부 적용
