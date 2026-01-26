# 관리자 홈 태그 순서 관리 기능 PRD

## 📋 개요

관리자가 홈 화면 섹션별 태그 내 공연들의 노출 순서를 드래그 앤 드롭으로 관리할 수 있는 기능입니다. 사용자에게 보이는 공연의 우선순위를 시각적으로 조정할 수 있습니다.

## 🎯 목표

- 섹션/태그별 공연 목록을 조회하고 순서를 시각적으로 관리
- 드래그 앤 드롭으로 직관적인 순서 변경 UX 제공
- 변경사항을 한 번에 저장하여 효율적인 관리

## 📐 기능 요구사항

### 1. 관리자 사이드바 메뉴 추가

#### 1.1 메뉴 구조
```
홈 관리
  └─ 태그 순서 관리
```

- **위치**: 관리자 사이드바 메인 메뉴
- **아이콘**: Home 또는 Layout 아이콘
- **경로**: `/admin/home/tag-order`

### 2. 태그 선택 영역

#### 2.1 섹션/태그 Select
- **데이터 소스**: `GET /api/admin/home/sections/metadata`
- **구조**:
  ```typescript
  {
    section: "POPULAR_TICKET",
    displayName: "인기티켓",
    tags: [
      { tag: "MUSICAL", displayName: "뮤지컬" },
      { tag: "CONCERT", displayName: "콘서트" }
    ]
  }
  ```
- **Select 그룹**:
  - `<optgroup label="{section.displayName}">`로 섹션 구분
  - 각 태그는 `<option value="{tag}">{displayName}</option>`
- **선택 제한**: 단일 선택만 가능
- **기본값**: 첫 번째 태그 자동 선택

#### 2.2 선택 UI
```
┌─────────────────────────────────────┐
│ 태그 선택                            │
│ ┌───────────────────────────────┐   │
│ │ ▼ 인기티켓 - 뮤지컬            │   │
│ │   인기티켓                     │   │
│ │     • 뮤지컬                   │   │
│ │     • 콘서트                   │   │
│ │   데이트 코스                  │   │
│ │     • 데이트 뮤지컬            │   │
│ │     • 데이트 연극              │   │
│ └───────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 3. 공연 목록 조회 및 표시

#### 3.1 데이터 조회
- **API**: `GET /api/admin/home-tags/{tag}/performances`
- **응답 구조**:
  ```json
  [
    {
      "performanceId": 1,
      "title": "레미제라블",
      "displayOrder": 1,
      "posterUrl": "https://...",
      "startDate": "2024-01-01",
      "endDate": "2024-03-31"
    }
  ]
  ```
- **정렬**: `displayOrder` 오름차순 (이미 정렬된 상태)

#### 3.2 목록 표시
- **레이아웃**: 카드 형식 또는 리스트 형식
- **표시 정보**:
  - 순번 (1, 2, 3...)
  - 공연 제목
  - 공연 기간
  - 드래그 핸들 아이콘
- **빈 상태**: "선택한 태그에 등록된 공연이 없습니다."

### 4. 드래그 앤 드롭 기능

#### 4.1 라이브러리
- **사용**: `react-dnd` + `react-dnd-html5-backend`
- **설치**:
  ```bash
  pnpm add react-dnd react-dnd-html5-backend
  ```

#### 4.2 드래그 동작
- **드래그 핸들**: 각 항목 왼쪽에 핸들 아이콘 (GripVertical)
- **드래그 가능 영역**: 전체 카드 또는 핸들만
- **시각적 피드백**:
  - 드래그 중: 반투명 스타일
  - 드롭 가능 영역: 하이라이트
  - 드롭 예상 위치: 구분선 표시

#### 4.3 순서 변경
- 드래그 앤 드롭으로 항목 이동
- 실시간으로 순서 업데이트 (로컬 상태)
- 변경사항 표시 (수정된 항목 하이라이트)

### 5. 저장 기능

#### 5.1 저장 API
- **엔드포인트**: `PATCH /api/admin/home-tags/{tag}/performances/order`
- **요청 바디**:
  ```json
  {
    "performanceOrders": [
      { "performanceId": 1, "displayOrder": 1 },
      { "performanceId": 2, "displayOrder": 2 },
      { "performanceId": 3, "displayOrder": 3 }
    ]
  }
  ```

#### 5.2 저장 버튼
- **위치**: 페이지 하단 고정 또는 우측 상단
- **상태**:
  - 변경사항 없음: 비활성화
  - 변경사항 있음: 활성화
  - 저장 중: 로딩 스피너 + 비활성화
- **버튼 텍스트**: "순서 저장"

#### 5.3 저장 프로세스
1. 변경사항 확인 (초기값과 비교)
2. API 호출
3. 성공 시:
   - Toast: "순서가 성공적으로 저장되었습니다."
   - 공연 목록 다시 조회 (최신 상태 반영)
4. 실패 시:
   - Toast: "순서 저장 중 오류가 발생했습니다."
   - 이전 상태로 복원

#### 5.4 초기화 버튼
- **기능**: 변경사항을 초기 상태로 되돌리기
- **위치**: 저장 버튼 옆
- **활성화 조건**: 변경사항이 있을 때만

## 🎨 UI/UX 상세

### 페이지 레이아웃
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
│ 공연 순서 (총 5개)                                       │
│ ┌─────────────────────────────────────────────────┐     │
│ │ ≡  1. 레미제라블                                 │     │
│ │    2024-01-01 ~ 2024-03-31                      │     │
│ └─────────────────────────────────────────────────┘     │
│ ┌─────────────────────────────────────────────────┐     │
│ │ ≡  2. 오페라의 유령                              │     │
│ │    2024-02-01 ~ 2024-04-30                      │     │
│ └─────────────────────────────────────────────────┘     │
│ ┌─────────────────────────────────────────────────┐     │
│ │ ≡  3. 캣츠                                       │     │
│ │    2024-03-01 ~ 2024-05-31                      │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 드래그 중 상태
```
┌─────────────────────────────────────────────────────┐
│ ≡  1. 레미제라블                                     │
│    2024-01-01 ~ 2024-03-31                          │
└─────────────────────────────────────────────────────┘
    ┌─ 드롭 가능 영역 ─┐
┌─────────────────────────────────────────────────────┐
│ 👻 2. 오페라의 유령 (드래그 중)                      │
│    2024-02-01 ~ 2024-04-30                          │
└─────────────────────────────────────────────────────┘
    └──────────────────┘
┌─────────────────────────────────────────────────────┐
│ ≡  3. 캣츠                                           │
│    2024-03-01 ~ 2024-05-31                          │
└─────────────────────────────────────────────────────┘
```

## 🔌 API 엔드포인트

### 1. 섹션 메타데이터 조회 (기존)
```
GET /api/admin/home/sections/metadata
```

### 2. 태그별 공연 목록 조회 (기존)
```
GET /api/admin/home-tags/{tag}/performances
```
**응답 예시**:
```json
[
  {
    "performanceId": 1,
    "title": "레미제라블",
    "displayOrder": 1,
    "posterUrl": "https://...",
    "startDate": "2024-01-01",
    "endDate": "2024-03-31",
    "venue": "블루스퀘어"
  }
]
```

### 3. 순서 변경 (기존)
```
PATCH /api/admin/home-tags/{tag}/performances/order
```
**요청 바디**:
```json
{
  "performanceOrders": [
    { "performanceId": 1, "displayOrder": 1 },
    { "performanceId": 2, "displayOrder": 2 }
  ]
}
```

## 🏗️ 기술 스택 & 아키텍처 (FSD)

### Layer 구조

#### Entities
- **entities/home-tag** (신규):
  - `api/home-tag.api.ts`: 태그별 공연 조회, 순서 변경 API
  - `api/home-tag.queries.ts`: React Query hooks
  - `model/home-tag.types.ts`: orval 생성 타입
  - `index.ts`: Public API export

#### Features
- **features/admin/home-tag-order** (신규):
  - `ui/TagSelect.tsx`: 섹션/태그 선택 Select 컴포넌트
  - `ui/DraggablePerformanceList.tsx`: 드래그 가능한 공연 목록
  - `ui/DraggablePerformanceItem.tsx`: 드래그 가능한 공연 항목
  - `lib/useDragAndDrop.ts`: 드래그 앤 드롭 로직 hook
  - `lib/useOrderState.ts`: 순서 상태 관리 hook
  - `index.ts`: Public API export

#### Views
- **views/admin/home-tag-order** (신규):
  - `HomeTagOrderView.tsx`: 홈 태그 순서 관리 뷰 컴포넌트
  - `index.ts`: Public API export

#### Pages (App Router)
- **app/admin/home/tag-order/page.tsx**: Next.js 페이지 래퍼 (최소한의 코드)

### 주요 컴포넌트

#### 1. TagSelect
```typescript
interface TagSelectProps {
  value: string | null;
  onChange: (tag: string) => void;
  disabled?: boolean;
}
```

#### 2. DraggablePerformanceList
```typescript
interface DraggablePerformanceListProps {
  performances: TagPerformanceResponse[];
  onReorder: (newOrder: TagPerformanceResponse[]) => void;
  disabled?: boolean;
}
```

#### 3. DraggablePerformanceItem
```typescript
interface DraggablePerformanceItemProps {
  performance: TagPerformanceResponse;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
}
```

#### 4. useOrderState Hook
```typescript
interface UseOrderStateReturn {
  items: TagPerformanceResponse[];
  setItems: (items: TagPerformanceResponse[]) => void;
  moveItem: (fromIndex: number, toIndex: number) => void;
  resetOrder: () => void;
  hasChanges: boolean;
  getOrderPayload: () => UpdateDisplayOrderRequest;
}
```

## ✅ 개발 체크리스트

### 1. PRD & 문서
- [x] PRD 작성 완료

### 2. 라우팅 & 메뉴
- [ ] `PAGES` 상수에 홈 태그 관리 경로 추가
- [ ] 관리자 사이드바에 "홈 관리 > 태그 순서 관리" 메뉴 추가

### 3. API & Entities
- [ ] `entities/home-tag` 생성
- [ ] 태그별 공연 조회 API 함수 작성
- [ ] 순서 변경 API 함수 작성
- [ ] React Query hooks 작성

### 4. 의존성 설치
- [ ] react-dnd 설치
  ```bash
  pnpm add react-dnd react-dnd-html5-backend
  pnpm add -D @types/react-dnd
  ```

### 5. Features
- [ ] `features/admin/home-tag-order` 생성
- [ ] TagSelect 컴포넌트 작성
- [ ] DraggablePerformanceList 컴포넌트 작성
- [ ] DraggablePerformanceItem 컴포넌트 작성
- [ ] useDragAndDrop hook 작성
- [ ] useOrderState hook 작성

### 6. Views
- [ ] `views/admin/home-tag-order/HomeTagOrderView.tsx` 생성
- [ ] DndProvider 설정
- [ ] 태그 선택 UI 구현
- [ ] 공연 목록 드래그 앤 드롭 구현
- [ ] 저장/초기화 버튼 구현

### 7. Pages (App Router)
- [ ] `app/admin/home/tag-order/page.tsx` 래퍼 생성

### 8. 테스트 & 검증
- [ ] 태그 선택 기능 테스트
- [ ] 공연 목록 조회 테스트
- [ ] 드래그 앤 드롭 동작 테스트
- [ ] 순서 저장 기능 테스트
- [ ] 초기화 기능 테스트
- [ ] 에러 처리 확인
- [ ] UI/UX 검증

## 📝 참고사항

### 아키텍처 & 코드 품질
- FSD 아키텍처 원칙 준수
- Public API를 통한 export만 허용
- 모든 함수/인터페이스에 JSDoc 주석 작성

### UI 컴포넌트
- Shadcn UI 컴포넌트 활용 (Select, Card, Button)
- react-dnd로 드래그 앤 드롭 구현
- 반응형 디자인 고려

### 데이터 처리
- React Query를 통한 서버 상태 관리
- 드래그 앤 드롭 시 로컬 상태 우선 업데이트
- 저장 성공 후 서버 데이터 동기화
- 낙관적 업데이트 고려

### 사용자 경험
- 드래그 중 시각적 피드백 제공
- 변경사항 있을 때만 저장 버튼 활성화
- 로딩 상태 명확히 표시
- 저장 성공/실패 Toast 메시지
