# 테스트 가이드

> Vitest + React Testing Library 기반 테스트 작성 가이드

## 목차

1. [테스트 환경 구성](#테스트-환경-구성)
2. [핵심 라이브러리](#핵심-라이브러리)
3. [테스트 기본 구조](#테스트-기본-구조)
4. [Mock 사용법](#mock-사용법)
5. [자주 사용하는 함수](#자주-사용하는-함수)
6. [예제](#예제)
7. [디버깅 팁](#디버깅-팁)

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
