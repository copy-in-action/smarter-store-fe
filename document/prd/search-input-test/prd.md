# SearchInput 컴포넌트 테스트 PRD

## 1. 개요

### 1.1 목적
`SearchInput` 컴포넌트의 핵심 동작(검색 실행, 키보드 네비게이션, 자동완성 연동)을 레이어별 테스트로 검증하여 회귀 버그를 방지합니다.

### 1.2 범위
- `src/widgets/header/ui/SearchInput.tsx`
- 연관 로직: `handleSearch`, `handleKeyDown`, `handleClear`, `handleInteractOutside`

### 1.3 테스트 전략 요약

| 레이어 | 도구 | 파일 |
|--------|------|------|
| Unit + Component | Vitest + RTL | `SearchInput.test.tsx` |
| Integration | Vitest + RTL + MSW | `SearchInput.integration.test.tsx` |
| E2E | Playwright | `tests/e2e/search.spec.ts` |

---

## 2. Unit / Component 테스트

> 파일: `src/widgets/header/ui/__tests__/SearchInput.test.tsx`

### 2.1 렌더링

- [ ] 초기 렌더링 시 placeholder `"어디로 떠나볼까요 ?"` 표시
- [ ] `searchParams.q` 값이 있으면 input 초기값으로 설정
- [ ] `searchParams.q` 값이 없으면 input 초기값 빈 문자열

### 2.2 X 버튼 (검색어 지우기)

- [ ] 입력값이 없을 때 X 버튼 미노출
- [ ] 입력값이 있을 때 X 버튼 노출
- [ ] X 버튼 클릭 시 input 값 초기화

### 2.3 handleSearch 경계값 (Unit)

- [ ] 빈 문자열 입력 후 Enter → 검색 미실행 (router.push 미호출)
- [ ] 공백만 입력 후 Enter → trim 후 검색 미실행
- [ ] 정상 키워드 입력 후 Enter → `router.push('/search?q=키워드')` 호출
- [ ] 키워드 앞뒤 공백 → trim 적용 후 검색 실행

### 2.4 키보드 네비게이션 (Unit)

- [ ] IME 조합 중(`isComposing: true`) ArrowDown → selectedIndex 변경 없음
- [ ] 팝업 닫힌 상태에서 ArrowDown → selectedIndex 변경 없음
- [ ] ArrowDown 연속 → 마지막 항목에서 더 이상 증가하지 않음 (경계값)
- [ ] ArrowUp → 첫 번째 항목(0)에서 -1로 돌아옴 (선택 해제)
- [ ] ArrowUp → 이미 -1이면 -1 유지
- [ ] Escape → 팝업 닫힘, selectedIndex -1 리셋

### 2.5 포커스 / 팝업 상태

- [ ] input focus 시 `isOpen` true (자동완성 팝업 열림)
- [ ] 입력값 변경 시 `selectedIndex` -1 리셋

---

## 3. Integration 테스트

> 파일: `src/widgets/header/ui/__tests__/SearchInput.integration.test.tsx`

### 3.1 디바운스 + 자동완성 API 연동

- [ ] 검색어 입력 후 300ms 이내 → API 미호출
- [ ] 검색어 입력 후 300ms 경과 → 자동완성 API 호출
- [ ] API 응답 후 자동완성 항목 렌더링

### 3.2 검색 실행 흐름

- [ ] 자동완성 항목 클릭 → `addRecentSearch` 호출
- [ ] 자동완성 항목 클릭 → `router.push` 실행
- [ ] 자동완성 항목 클릭 → 팝업 닫힘, 입력값 초기화

### 3.3 외부 클릭 처리

- [ ] `InputGroup` 내부 클릭 → 팝업 유지 (`handleInteractOutside`)
- [ ] `InputGroup` 외부 클릭 → 팝업 닫힘

### 3.4 최근 검색어 저장

- [ ] 검색 실행 시 `addRecentSearch(trimmedKeyword)` 호출

---

## 4. E2E 테스트

> 파일: `tests/e2e/search.spec.ts`

### 4.1 기본 검색 플로우

- [ ] 검색창 클릭 → 자동완성 팝업 노출
- [ ] 검색어 입력 → 자동완성 항목 노출
- [ ] 자동완성 항목 클릭 → 검색 결과 페이지 이동

### 4.2 키보드 검색 플로우

- [ ] 검색어 입력 → ArrowDown으로 항목 선택 → Enter → 검색 결과 페이지 이동
- [ ] Escape → 팝업 닫힘

### 4.3 최근 검색어

- [ ] 검색 실행 후 재포커스 → 최근 검색어 노출
- [ ] 최근 검색어 클릭 → 해당 검색어로 검색 결과 페이지 이동

---

## 5. 모킹 전략

| 대상 | 레이어 | 방법 |
|------|--------|------|
| `next/navigation` (useRouter, useSearchParams) | Unit/Component/Integration | `vi.mock` |
| `addRecentSearch` | Unit/Component/Integration | `vi.mock` |
| 자동완성 API | Integration | MSW handler |
| 브라우저 실제 환경 | E2E | Playwright (모킹 없음) |

---

## 6. 구현 체크리스트

- [ ] `src/widgets/header/ui/__tests__/SearchInput.test.tsx` 작성
- [ ] `src/widgets/header/ui/__tests__/SearchInput.integration.test.tsx` 작성
- [ ] `tests/e2e/search.spec.ts` 작성
- [ ] MSW handler 추가 (자동완성 API)
- [ ] `document/index.md` 등록
