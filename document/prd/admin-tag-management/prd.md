# PRD: 관리자 홈 태그 관리

**최종 수정일**: 2026-03-18
**상태**: 🟡 태그 지정 완료 / 순서 관리 미구현
**담당 레이어**: `views/admin/`, `features/admin/`, `entities/performance`, `entities/home-section`, `entities/home-tag`

---

## 개요

관리자가 홈 화면에 노출될 공연을 섹션/태그별로 관리하는 두 가지 기능:

1. **태그 지정** (`admin-home-tag-management`): 공연 상세 페이지에서 홈 섹션 태그를 다중 선택으로 할당/해제
2. **순서 관리** (`admin-home-tag-order-management`): 태그별 공연 노출 순서를 드래그 앤 드롭으로 변경

---

## 기능 1: 태그 지정 (구현 완료)

### 화면 구성

**공연 상세 페이지**
- 현재 지정된 태그를 `sectionDisplayName-tagDisplayName` 형식 Badge로 표시
- "태그 관리" 버튼 → 모달 열기

**태그 관리 모달** (max-width: 600px)
- 제목: "홈 섹션 태그 관리 - {공연명}"
- 섹션별 Multi-Select 컴포넌트 ([shadcn-multi-select-component](https://github.com/sersavan/shadcn-multi-select-component))
- 저장 중 UI 잠금 (저장/취소/닫기 버튼 비활성화)

```
┌──────────────────────────────────────────┐
│ 홈 섹션 태그 관리 - 레미제라블       [X]│
│                                          │
│ 베스트 공연                               │
│ ┌──────────────────────────────────┐     │
│ │ ▼ 베스트 뮤지컬, 베스트 콘서트 ✓ │     │
│ └──────────────────────────────────┘     │
│                                          │
│ 신규 공연                                 │
│ ┌──────────────────────────────────┐     │
│ │ ▼ 이번주 신규 ✓                  │     │
│ └──────────────────────────────────┘     │
│                                          │
│              [취소] [저장]               │
└──────────────────────────────────────────┘
```

### API

| Method | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/admin/performances/{id}/home-tags` | 공연의 현재 태그 조회 |
| GET | `/api/admin/home/sections/metadata` | 섹션/태그 메타데이터 조회 |
| POST | `/api/admin/performances/{id}/home-tags` | 태그 추가 (`{ tag: "BEST_MUSICAL" }`) |
| DELETE | `/api/admin/performances/{id}/home-tags/{tag}` | 태그 삭제 |

### FSD 구조

```
entities/performance/api/
  ├── performance-home-tag.api.ts
  └── performance-home-tag.queries.ts

entities/home-section/api/
  ├── home-section.api.ts
  └── home-section.queries.ts

features/admin/performance-home-tag-management/
  ├── ui/
  │   ├── PerformanceHomeTagManagement.tsx  # 모달 메인
  │   └── HomeTagSectionMultiSelect.tsx     # 섹션별 선택
  ├── lib/
  │   ├── useHomeTagForm.ts         # 폼 상태, 변경사항 추적
  │   └── useHomeTagMutations.ts    # 일괄 추가/삭제
  └── index.ts

views/admin/performance-management/
  └── PerformanceDetailView.tsx     # 태그 표시 + 모달 연동
```

### 체크리스트 (태그 지정)

- [x] 공연 상세에 현재 태그 Badge 표시
- [x] "태그 관리" 버튼 및 모달 연동
- [x] 섹션별 Multi-Select 컴포넌트
- [x] 변경사항 추적 (추가/삭제 분리)
- [x] 일괄 API 호출 (Promise.all)
- [x] 저장 중 UI 잠금
- [x] 성공/실패 Toast
- [ ] 부분 실패 시 에러 처리 (성공/실패 구분 표시)

---

## 기능 2: 순서 관리 (미구현)

### 화면 구성

**라우트**: `/admin/home/tag-order`
**사이드바**: 홈 관리 > 태그 순서 관리

```
┌─────────────────────────────────────────────────────────┐
│ 홈 태그 순서 관리                          [초기화] [저장]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 태그 선택                                                │
│ ┌─────────────────────────────────────────────────┐     │
│ │ ▼ 인기티켓 - 뮤지컬                              │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ 공연 순서 (총 3개)                                        │
│ ┌─────────────────────────────────────────────────┐     │
│ │ ≡  1. 레미제라블    2024-01-01 ~ 2024-03-31     │     │
│ └─────────────────────────────────────────────────┘     │
│ ┌─────────────────────────────────────────────────┐     │
│ │ ≡  2. 오페라의 유령 2024-02-01 ~ 2024-04-30     │     │
│ └─────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### 드래그 앤 드롭

- 라이브러리: `react-dnd` + `react-dnd-html5-backend`
- 드래그 핸들: `GripVertical` 아이콘
- 시각 피드백: 드래그 중 반투명, 드롭 예상 위치 구분선
- 저장 버튼: 변경사항 있을 때만 활성화

### API

| Method | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/admin/home/sections/metadata` | 섹션/태그 메타데이터 (기존) |
| GET | `/api/admin/home-tags/{tag}/performances` | 태그별 공연 목록 (displayOrder 정렬) |
| PATCH | `/api/admin/home-tags/{tag}/performances/order` | 순서 변경 |

```json
// PATCH 요청 바디
{
  "performanceOrders": [
    { "performanceId": 1, "displayOrder": 1 },
    { "performanceId": 2, "displayOrder": 2 }
  ]
}
```

### FSD 구조

```
entities/home-tag/               # 신규
  ├── api/
  │   ├── home-tag.api.ts
  │   └── home-tag.queries.ts
  ├── model/home-tag.types.ts
  └── index.ts

features/admin/home-tag-order/   # 신규
  ├── ui/
  │   ├── TagSelect.tsx
  │   ├── DraggablePerformanceList.tsx
  │   └── DraggablePerformanceItem.tsx
  ├── lib/
  │   ├── useDragAndDrop.ts
  │   └── useOrderState.ts
  └── index.ts

views/admin/home-tag-order/      # 신규
  ├── HomeTagOrderView.tsx
  └── index.ts

app/admin/home/tag-order/page.tsx  # 신규
```

### 체크리스트 (순서 관리)

- [ ] `PAGES` 상수에 `/admin/home/tag-order` 경로 추가
- [ ] 관리자 사이드바에 "홈 관리 > 태그 순서 관리" 메뉴 추가
- [ ] `pnpm add react-dnd react-dnd-html5-backend`
- [ ] `entities/home-tag` 생성 (API, 타입, 쿼리)
- [ ] `features/admin/home-tag-order` 생성
  - [ ] TagSelect 컴포넌트 (섹션 optgroup 형태)
  - [ ] DraggablePerformanceList 컴포넌트
  - [ ] DraggablePerformanceItem 컴포넌트
  - [ ] useDragAndDrop hook
  - [ ] useOrderState hook (변경 추적, 초기화, payload 생성)
- [ ] `views/admin/home-tag-order` 생성 + DndProvider 설정
- [ ] `app/admin/home/tag-order/page.tsx` 생성
- [ ] 저장/초기화 버튼 (변경사항 있을 때만 활성화)
- [ ] 저장 성공/실패 Toast
- [ ] 에러 처리 및 이전 상태 복원
