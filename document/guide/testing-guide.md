# 테스트 가이드

> Vitest + React Testing Library 기반 테스트 작성 가이드

## 목차

1. [테스트 환경 구성](#테스트-환경-구성)
2. [핵심 라이브러리](#핵심-라이브러리)
3. [테스트 기본 구조](#테스트-기본-구조)
4. [Mock 사용법](#mock-사용법)
5. [API Mocking (MSW)](#api-mocking-msw)
6. [Integration Testing](#integration-testing)
7. [자주 사용하는 함수](#자주-사용하는-함수)
8. [예제](#예제)
9. [디버깅 팁](#디버깅-팁)

---

## 테스트 환경 구성

### 설정 파일

#### `vitest.config.mts`
```typescript
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",           // 브라우저 환경 시뮬레이션
    globals: true,                  // describe, test, expect 등 전역 사용 + 자동 cleanup
    include: ["src/**/*.{test,spec}.{ts,tsx}"],  // 테스트 파일 패턴
    setupFiles: ["./tests/setup.tsx"],  // 전역 설정 파일
  },
});
```

#### `tests/setup.tsx`
모든 테스트 실행 전에 자동으로 로드되는 전역 설정 파일

```typescript
import "@testing-library/jest-dom/vitest";  // DOM matcher 추가
import { vi } from "vitest";

// globals: true 설정으로 React Testing Library가 자동 cleanup 수행

// 전역 mock 설정
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));
```

> **중요**: `vitest.config.mts`에서 `globals: true`를 설정하면 React Testing Library가 자동으로 각 테스트 후 DOM을 정리합니다. 수동으로 `cleanup()`을 호출할 필요가 없습니다.

### 자동 Cleanup 동작 원리

React Testing Library는 **테스트 독립성 원칙**을 지키기 위해 자동 cleanup을 제공합니다.

#### Vitest에서 자동 cleanup이 동작하는 조건

1. **`globals: true` 설정 필요** (권장)
   ```typescript
   // vitest.config.mts
   test: {
     globals: true,  // ← 이것만 추가하면 자동 cleanup
   }
   ```
   - `afterEach`가 전역으로 사용 가능해짐
   - React Testing Library가 내부적으로 자동 cleanup 등록
   - **수동으로 `cleanup()` 호출 불필요**

2. **`globals: false` (기본값)** 인 경우
   - 수동으로 cleanup 등록 필요:
   ```typescript
   // tests/setup.tsx
   import { cleanup } from "@testing-library/react";
   import { afterEach } from "vitest";

   afterEach(() => {
     cleanup();
   });
   ```

#### 왜 자동 cleanup이 필요한가?

```typescript
// cleanup 없으면 이런 일이 발생:
test("첫 번째 테스트", () => {
  render(<Component value="A" />);  // DOM에 추가
});

test("두 번째 테스트", () => {
  render(<Component value="B" />);  // DOM에 또 추가
  // 이제 DOM에 2개의 Component가 존재! (의도하지 않음)
});
```

자동 cleanup은 각 테스트 후 DOM을 정리하여 **테스트 간 독립성을 보장**합니다.

---

## 핵심 라이브러리

### 1. Vitest - 테스트 러너 (Test Runner)

**역할**: 테스트를 실행하고 관리하는 프레임워크

**주요 기능**:
- 테스트 구조화 (`describe`, `test`)
- 검증 (`expect`)
- Mock 시스템 (`vi.mock`, `vi.fn`)
- 생명주기 관리 (`beforeEach`, `afterEach`)

```typescript
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
```

### 2. React Testing Library - 컴포넌트 테스트

**역할**: React 컴포넌트를 렌더링하고 테스트하는 유틸리티

**주요 기능**:
- 컴포넌트 렌더링 (`render`)
- DOM 쿼리 (`screen.getBy*`, `screen.findBy*`)
- 사용자 상호작용 (`fireEvent`, `userEvent`)
- DOM 정리 (`cleanup`)

```typescript
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
```

### 3. jest-dom - Matcher 확장

**역할**: DOM 관련 검증 함수 추가

**주요 matcher**:
- `toBeInTheDocument()` - 요소 존재 여부
- `toHaveValue()` - input 값 검증
- `toBeVisible()` - 가시성 검증
- `toHaveClass()` - CSS 클래스 검증

```typescript
import "@testing-library/jest-dom/vitest";  // setup.tsx에서 import
```

---

## 테스트 기본 구조

### 파일 구조

```
src/
  widgets/
    header/
      ui/
        SearchInput.tsx          # 컴포넌트
        __tests__/
          SearchInput.test.tsx   # 단위 테스트
```

### 테스트 코드 구조

```typescript
import { render, screen } from "@testing-library/react";
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { MyComponent } from "../MyComponent";

// 1. Mock 설정 (파일 최상단)
vi.mock("@/some/module", () => ({
  someFunction: vi.fn(),
}));

// 2. 테스트 그룹
describe("MyComponent", () => {
  // 3. 각 테스트 전 실행
  beforeEach(() => {
    // mock 초기화, 공통 setup 등
  });

  // 4. 각 테스트 후 실행
  afterEach(() => {
    vi.clearAllMocks(); // mock 정리 (DOM cleanup은 자동)
  });

  // 5. 테스트 케이스 (AAA 패턴)
  test("props로 받은 값 렌더링", () => {
    // Arrange: 준비
    const props = { value: "test" };

    // Act: 실행
    render(<MyComponent {...props} />);

    // Assert: 검증
    expect(screen.getByText("test")).toBeInTheDocument();
  });
});
```

### test() vs it()

**기능적으로 완전히 동일** (it은 test의 별칭)

| 사용 케이스 | 선택 | 이유 |
|------------|------|------|
| **한글 테스트 (우리 프로젝트)** | `test()` | 한글과 자연스럽게 어울림 |
| 영어 BDD 스타일 | `it()` | "it renders correctly" 문장처럼 읽힘 |

```typescript
// ✅ 한글 → test() 권장
describe("SearchInput", () => {
  test("placeholder 텍스트 표시", () => {});
  test("X 버튼 클릭 시 input 초기화", () => {});
});

// ✅ 영어 BDD → it() 자연스러움
describe("SearchInput", () => {
  it("displays placeholder text", () => {});
  it("clears input when X button is clicked", () => {});
});
```

**중요**: 프로젝트 내에서 **한 가지만 일관되게 사용**

---

## Mock 사용법

### 1. 전역 Mock (setup.tsx)

모든 테스트에서 공통으로 사용되는 mock

```typescript
// tests/setup.tsx
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
  })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));
```

### 2. 테스트별 Mock Override

특정 테스트에서만 다른 동작이 필요한 경우

```typescript
import { useSearchParams } from "next/navigation";
import { vi } from "vitest";

test("q 파라미터가 있을 때", () => {
  // 전역 mock을 override
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams({ q: "서울" }) as ReturnType<typeof useSearchParams>
  );

  render(<SearchInput />);

  expect(screen.getByDisplayValue("서울")).toBeInTheDocument();
});
```

### 3. 함수 Mock

```typescript
// Mock 함수 생성
const mockFunction = vi.fn();

// 반환값 설정
mockFunction.mockReturnValue("결과");

// 특정 인자에 대한 반환값 설정
mockFunction.mockImplementation((arg) => {
  if (arg === "a") return "A";
  return "default";
});

// 호출 검증
expect(mockFunction).toHaveBeenCalled();
expect(mockFunction).toHaveBeenCalledWith("예상 인자");
expect(mockFunction).toHaveBeenCalledTimes(2);
```

### 4. 컴포넌트 Mock

```typescript
vi.mock("@/features/service/performance-search", () => ({
  addRecentSearch: vi.fn(),
  SearchAutocomplete: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="autocomplete">{children}</div>
  ),
}));
```

---

## API Mocking (MSW)

### MSW (Mock Service Worker) 소개

MSW는 네트워크 레벨에서 HTTP 요청을 가로채서 mock 응답을 반환하는 라이브러리입니다.

**장점**:
- 실제 API 호출 코드를 그대로 테스트 가능
- 네트워크 레벨에서 가로채므로 fetch, axios 등 모든 HTTP 라이브러리와 호환
- 개발 환경에서도 동일한 핸들러 재사용 가능

### 프로젝트 MSW 설정

#### MSW 서버 설정 (`tests/msw-server.ts`)

```typescript
import { setupServer } from "msw/node";
import { handlers } from "@/shared/api/mocks/handlers";

export const server = setupServer(...handlers);
```

#### 기본 핸들러 (`src/shared/api/mocks/handlers/`)

프로젝트의 모든 MSW 핸들러는 `src/shared/api/mocks/handlers/` 디렉토리에 정의되어 있습니다.

```typescript
// src/shared/api/mocks/handlers/performance-search-autocomplete.handlers.ts
import { HttpResponse, http } from "msw";

export const getAutocompleteHandler = http.get(
  "/api/performances/search/autocomplete",
  () => {
    return HttpResponse.json(mockAutocompleteData);
  },
);
```

### 중요: API URL 규칙

#### 프록시 설정과 테스트 환경

`next.config.ts`에서 개발 환경의 프록시 설정:

```typescript
// next.config.ts
async rewrites() {
  if (process.env.NODE_ENV === "production") {
    return [];
  }

  // 개발 환경: /api/* → https://ticket-api.devhong.cc/api/*
  return [
    {
      source: "/api/:path*",
      destination: `${process.env.NEXT_PUBLIC_API_DEV_SERVER}/api/:path*`,
    },
  ];
},
```

#### MSW 핸들러 URL 규칙

**중요**: MSW 핸들러의 URL은 **상대 경로**를 사용합니다:

```typescript
// ✅ 올바른 방법 - 상대 경로 사용
http.get("/api/performances/search/autocomplete", ...)

// ❌ 잘못된 방법 - 절대 경로 사용하지 않음
http.get("https://ticket-api.devhong.cc/api/performances/search/autocomplete", ...)
```

**이유**:
1. 실제 코드는 `https://ticket-api.devhong.cc/api/...`를 호출
2. MSW는 상대 경로 `/api/...`로 매칭 가능 (경로 부분만 비교)
3. 환경(개발/프로덕션)에 따라 도메인이 변경되어도 핸들러 수정 불필요

#### API 응답 구조

**apiClient 래핑 구조**:

프로젝트의 `apiClient`는 모든 HTTP 응답을 다음 형태로 래핑합니다:

```typescript
// src/shared/api/fetch-wrapper.ts
return {
  status: response.status,
  data: parsedData,
  headers: response.headers
};
```

**MSW 핸들러 응답 규칙**:

MSW 핸들러는 실제 API 응답 body만 반환하면 됩니다. `apiClient`가 자동으로 래핑합니다:

```typescript
// ✅ 올바른 방법 - body만 반환
http.get("/api/performances/search/autocomplete", () => {
  return HttpResponse.json([
    { id: 1, title: "공연1", category: "콘서트", regionName: "SEOUL" },
    { id: 2, title: "공연2", category: "뮤지컬", regionName: "BUSAN" },
  ]);
});

// 실제 코드에서:
// const response = await autocomplete({ keyword: "서울" });
// response = { status: 200, data: [...], headers: {...} }
// response.data를 사용 → 배열 접근
```

### 테스트에서 MSW 핸들러 사용

#### 기본 핸들러 사용

```typescript
import { server } from "@tests/msw-server";
import { beforeAll, afterAll, afterEach } from "vitest";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("기본 핸들러 사용", async () => {
  // 기본 핸들러가 자동으로 동작
  const result = await autocomplete({ keyword: "서울" });
  expect(result.data).toEqual([...]);
});
```

#### 테스트별 핸들러 오버라이드

```typescript
test("특정 응답 테스트", async () => {
  // 이 테스트에서만 다른 응답 반환
  server.use(
    http.get("/api/performances/search/autocomplete", () => {
      return HttpResponse.json([
        { id: 1, title: "서울 콘서트" },
        { id: 2, title: "서울 뮤지컬" },
      ]);
    })
  );

  render(<SearchInput />);
  // 테스트...
});
```

#### 에러 응답 테스트

```typescript
test("API 에러 처리", async () => {
  server.use(
    http.get("/api/performances/search/autocomplete", () => {
      return HttpResponse.json(
        { message: "서버 오류" },
        { status: 500 }
      );
    })
  );

  render(<SearchInput />);

  await waitFor(() => {
    expect(screen.getByText("검색 중 오류가 발생했습니다")).toBeInTheDocument();
  });
});
```

---

## Integration Testing

Integration 테스트는 여러 컴포넌트와 시스템이 함께 동작하는 것을 검증합니다.

### React Query + MSW Integration

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";

const renderWithQuery = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,  // 테스트에서는 재시도 비활성화
        gcTime: 0,     // 캐시 비활성화
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper });
};

test("API 호출 + 렌더링", async () => {
  server.use(
    http.get("/api/performances/search/autocomplete", () => {
      return HttpResponse.json([
        { id: 1, title: "서울 콘서트" },
      ]);
    })
  );

  renderWithQuery(<SearchInput />);

  const input = screen.getByPlaceholderText("어디로 떠나볼까요 ?");
  fireEvent.change(input, { target: { value: "서울" } });

  // API 응답 대기 + 렌더링 확인
  await waitFor(() => {
    expect(screen.getByText("서울 콘서트")).toBeInTheDocument();
  });
});
```

### 디바운스 테스트

#### fake timers를 사용한 디바운스 제어

**디바운스 동작 중 일부만 검증**하는 경우:

```typescript
test("디바운스 300ms 이내 → API 미호출", () => {
  vi.useFakeTimers();  // fake timers 활성화

  const handler = vi.fn(() => HttpResponse.json([]));
  server.use(http.get("/api/performances/search/autocomplete", handler));

  renderWithQuery(<SearchInput />);
  const input = screen.getByPlaceholderText("어디로 떠나볼까요 ?");

  fireEvent.change(input, { target: { value: "서울" } });

  // 100ms만 진행
  act(() => {
    vi.advanceTimersByTime(100);
  });

  expect(handler).not.toHaveBeenCalled();

  vi.useRealTimers();  // cleanup에서 타이머 복원
});
```

#### 실제 타이머를 사용한 완전한 플로우 테스트

**완전한 통합 플로우**를 테스트하는 경우 (권장):

```typescript
test("검색어 입력 → 디바운스 → API 호출 → 렌더링", async () => {
  // fake timers 사용 안 함 (실제 디바운스 대기)

  server.use(
    http.get("/api/performances/search/autocomplete", () => {
      return HttpResponse.json([
        { id: 1, title: "서울 콘서트" },
        { id: 2, title: "서울 뮤지컬" },
      ]);
    })
  );

  renderWithQuery(<SearchInput />);
  const input = screen.getByPlaceholderText("어디로 떠나볼까요 ?");

  fireEvent.change(input, { target: { value: "서울" } });

  // 디바운스(300ms) + API 응답 + 렌더링을 모두 기다림
  await waitFor(
    () => {
      expect(screen.getByText("서울 콘서트")).toBeInTheDocument();
      expect(screen.getByText("서울 뮤지컬")).toBeInTheDocument();
    },
    { timeout: 1000 }  // 충분한 대기 시간
  );
});
```

#### fake timers vs 실제 timers 선택 가이드

| 테스트 목적 | 방법 | 이유 |
|------------|------|------|
| **디바운스 동작 자체 검증** (300ms 이전/이후) | `vi.useFakeTimers()` + `vi.advanceTimersByTime()` | 타이머 제어가 필요 |
| **완전한 통합 플로우 검증** (입력 → 디바운스 → API → 렌더링) | 실제 타이머 + `waitFor` | 실제 사용자 시나리오와 동일, 안정적 |

**권장**: Integration 테스트에서는 **실제 타이머**를 사용하고, 디바운스 로직 자체는 **단위 테스트**에서 fake timers로 검증

### waitFor 사용법

비동기 동작(API 호출, state 업데이트 등)을 기다릴 때 사용:

```typescript
await waitFor(
  () => {
    expect(screen.getByText("예상 텍스트")).toBeInTheDocument();
  },
  {
    timeout: 1000,      // 최대 대기 시간 (기본값: 1000ms)
    interval: 50,       // 검증 재시도 간격 (기본값: 50ms)
  }
);
```

**주의사항**:
- `waitFor` 콜백 내부는 **여러 번 실행**됩니다 (기대값이 만족될 때까지 반복)
- 콜백 내부에는 **검증(expect)만** 넣고, 부수 효과(state 변경 등)는 넣지 않습니다

### 텍스트 매칭 베스트 프랙티스

#### 문제: 텍스트가 여러 요소로 분리된 경우

```html
<!-- 검색어 강조 예시 -->
<div>
  <strong>서울</strong> 콘서트
</div>
```

#### ❌ 취약한 방법

```typescript
// getByText는 여러 요소에 걸친 텍스트 매칭이 불안정할 수 있음
expect(screen.getByText("서울 콘서트")).toBeInTheDocument();  // 실패할 수 있음

// 정규식도 차선책 (구현에 의존)
expect(screen.getByText(/서울.*콘서트/)).toBeInTheDocument();
```

#### ✅ 권장 방법

**1. `toHaveTextContent` 사용 (가장 권장)**

```typescript
// 부모 요소의 전체 textContent 검증 (내부 HTML 구조 무시)
const link = screen.getByRole("link", { name: /서울 콘서트/ });
expect(link).toHaveTextContent("서울 콘서트");

// 또는 getAllByRole로 여러 항목 검증
const links = screen.getAllByRole("link");
expect(links[0]).toHaveTextContent("서울 콘서트");
expect(links[1]).toHaveTextContent("서울 뮤지컬");
```

**2. 고유한 부분만 검증**

```typescript
// 각 항목의 고유한 단어만 확인
expect(screen.getByText("콘서트")).toBeInTheDocument();
expect(screen.getByText("뮤지컬")).toBeInTheDocument();
```

**3. 데이터 기반 검증 (가장 robust)**

```typescript
const performanceLinks = screen.getAllByRole("link");

// 개수 검증
expect(performanceLinks).toHaveLength(2);

// 각 항목의 전체 내용 검증
expect(performanceLinks[0]).toHaveTextContent("서울 콘서트");
expect(performanceLinks[0]).toHaveTextContent("콘서트 · 서울");
expect(performanceLinks[1]).toHaveTextContent("서울 뮤지컬");
```

**왜 이 방법들이 더 나은가?**
- ✅ **구현 독립성**: HTML 구조(강조 방식)가 바뀌어도 테스트가 깨지지 않음
- ✅ **사용자 관점**: 사용자가 실제로 보는 텍스트를 검증
- ✅ **안정성**: 내부 DOM 구조 변경에 강함

---

## 자주 사용하는 함수

### Vitest 함수

#### 테스트 구조

| 함수 | 설명 | 예시 |
|------|------|------|
| `describe()` | 테스트 그룹화 | `describe("렌더링", () => {})` |
| `test()` / `it()` | 개별 테스트 케이스 (기능 동일) | `test("placeholder 표시", () => {})` |
| `expect()` | 검증 시작 | `expect(value).toBe(expected)` |

> **Note**: `test()`와 `it()`은 완전히 동일. 우리 프로젝트는 한글 사용으로 `test()` 권장

#### 생명주기

| 함수 | 실행 시점 | 용도 |
|------|----------|------|
| `beforeEach()` | 각 테스트 전 | Mock 초기화, 공통 setup |
| `afterEach()` | 각 테스트 후 | Mock 정리, cleanup |
| `beforeAll()` | 모든 테스트 전 1회 | 전역 setup |
| `afterAll()` | 모든 테스트 후 1회 | 전역 cleanup |

#### Mock 함수

| 함수 | 설명 | 예시 |
|------|------|------|
| `vi.fn()` | Mock 함수 생성 | `const mock = vi.fn()` |
| `vi.mock()` | 모듈 전체 mock | `vi.mock("next/navigation")` |
| `vi.mocked()` | Mock 타입 헬퍼 | `vi.mocked(useRouter)` |
| `mockReturnValue()` | 반환값 설정 | `mock.mockReturnValue("값")` |
| `mockImplementation()` | 구현 설정 | `mock.mockImplementation(() => {})` |
| `vi.clearAllMocks()` | 모든 mock 정리 | `afterEach(() => vi.clearAllMocks())` |

#### Matcher

| Matcher | 설명 | 예시 |
|---------|------|------|
| `toBe()` | 동일성 검증 (===) | `expect(value).toBe(5)` |
| `toEqual()` | 깊은 비교 | `expect(obj).toEqual({ a: 1 })` |
| `toBeTruthy()` / `toBeFalsy()` | 참/거짓 검증 | `expect(value).toBeTruthy()` |
| `toHaveBeenCalled()` | 함수 호출 검증 | `expect(mock).toHaveBeenCalled()` |
| `toHaveBeenCalledWith()` | 인자 검증 | `expect(mock).toHaveBeenCalledWith("arg")` |
| `toHaveBeenCalledTimes()` | 호출 횟수 검증 | `expect(mock).toHaveBeenCalledTimes(2)` |

### React Testing Library 함수

#### 렌더링

| 함수 | 설명 | 예시 |
|------|------|------|
| `render()` | 컴포넌트 렌더링 | `render(<Component />)` |
| `cleanup()` | DOM 정리 (globals: true로 자동) | `cleanup()` |

#### 쿼리 (screen)

**우선순위 순서**: getByRole > getByLabelText > getByPlaceholderText > getByText > getByTestId

| 함수 | 설명 | 예시 |
|------|------|------|
| `getByRole()` | role로 검색 | `screen.getByRole("button")` |
| `getByText()` | 텍스트로 검색 | `screen.getByText("검색")` |
| `getByPlaceholderText()` | placeholder로 검색 | `screen.getByPlaceholderText("입력...")` |
| `getByLabelText()` | label로 검색 | `screen.getByLabelText("이메일")` |
| `getByTestId()` | data-testid로 검색 | `screen.getByTestId("search-input")` |
| `getByDisplayValue()` | input value로 검색 | `screen.getByDisplayValue("서울")` |
| `queryBy*()` | 없어도 에러 안 남 (null 반환) | `screen.queryByText("없음")` |
| `findBy*()` | 비동기 검색 (Promise) | `await screen.findByText("로딩 완료")` |

#### 이벤트

| 함수 | 설명 | 예시 |
|------|------|------|
| `fireEvent.change()` | input 값 변경 | `fireEvent.change(input, { target: { value: "값" }})` |
| `fireEvent.click()` | 클릭 | `fireEvent.click(button)` |
| `fireEvent.keyDown()` | 키 입력 | `fireEvent.keyDown(input, { key: "Enter" })` |
| `fireEvent.focus()` | 포커스 | `fireEvent.focus(input)` |
| `fireEvent.blur()` | 포커스 해제 | `fireEvent.blur(input)` |

### jest-dom Matcher

| Matcher | 설명 | 예시 |
|---------|------|------|
| `toBeInTheDocument()` | DOM 존재 여부 | `expect(element).toBeInTheDocument()` |
| `toBeVisible()` | 가시성 검증 | `expect(element).toBeVisible()` |
| `toHaveValue()` | input 값 검증 | `expect(input).toHaveValue("서울")` |
| `toHaveTextContent()` | 텍스트 내용 검증 | `expect(div).toHaveTextContent("안녕")` |
| `toHaveClass()` | CSS 클래스 검증 | `expect(div).toHaveClass("active")` |
| `toBeDisabled()` | disabled 상태 검증 | `expect(button).toBeDisabled()` |
| `toHaveAttribute()` | 속성 검증 | `expect(link).toHaveAttribute("href", "/")` |

---

## 예제

### SearchInput - 기본 렌더링 테스트

```typescript
import { render, screen } from "@testing-library/react";
import { useSearchParams } from "next/navigation";
import { describe, test, expect, vi, afterEach } from "vitest";
import { SearchInput } from "../SearchInput";

// Mock 설정
vi.mock("@/features/service/performance-search", () => ({
  addRecentSearch: vi.fn(),
  SearchAutocomplete: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("SearchInput - 렌더링", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("placeholder '어디로 떠나볼까요 ?' 표시", () => {
    render(<SearchInput />);

    expect(
      screen.getByPlaceholderText("어디로 떠나볼까요 ?")
    ).toBeInTheDocument();
  });

  test("searchParams.q 값이 있으면 input 초기값으로 설정", () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams({ q: "서울" }) as ReturnType<typeof useSearchParams>
    );

    render(<SearchInput />);

    const input = screen.getByPlaceholderText("어디로 떠나볼까요 ?");
    expect(input).toHaveValue("서울");
  });
});
```

### SearchInput - 사용자 상호작용 테스트

```typescript
import { fireEvent } from "@testing-library/react";
import { useRouter } from "next/navigation";

describe("SearchInput - 사용자 상호작용", () => {
  test("X 버튼 클릭 시 input 값 초기화", () => {
    render(<SearchInput />);

    const input = screen.getByPlaceholderText("어디로 떠나볼까요 ?");

    // 값 입력
    fireEvent.change(input, { target: { value: "서울" } });
    expect(input).toHaveValue("서울");

    // X 버튼 클릭
    const clearButton = screen.getByRole("button");
    fireEvent.click(clearButton);

    // 검증
    expect(input).toHaveValue("");
  });

  test("Enter 키 입력 시 검색 실행", () => {
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);

    render(<SearchInput />);

    const input = screen.getByPlaceholderText("어디로 떠나볼까요 ?");

    // 검색어 입력
    fireEvent.change(input, { target: { value: "서울" } });

    // Enter 입력
    fireEvent.keyDown(input, { key: "Enter" });

    // router.push 호출 검증
    expect(mockPush).toHaveBeenCalledWith("/search?q=서울");
  });
});
```

---

## 디버깅 팁

### 1. screen.debug()

현재 DOM 상태 출력

```typescript
test("디버그", () => {
  render(<SearchInput />);

  // 전체 DOM 출력
  screen.debug();

  // 특정 요소만 출력
  const input = screen.getByPlaceholderText("...");
  screen.debug(input);
});
```

### 2. 쿼리 실패 시

쿼리가 실패하면 자동으로 현재 DOM 구조를 출력해줍니다.

```typescript
// 요소를 못 찾으면 자동으로 DOM 출력
screen.getByText("존재하지 않는 텍스트"); // ← 실패 시 DOM 출력
```

### 3. logRoles()

요소의 role 확인

```typescript
import { logRoles } from "@testing-library/react";

test("role 확인", () => {
  const { container } = render(<SearchInput />);
  logRoles(container); // 모든 role 출력
});
```

---

## 참고 자료

- [Vitest 공식 문서](https://vitest.dev/)
- [React Testing Library 공식 문서](https://testing-library.com/react)
- [jest-dom Matcher 목록](https://github.com/testing-library/jest-dom)
- [Testing Library 쿼리 우선순위](https://testing-library.com/docs/queries/about#priority)
