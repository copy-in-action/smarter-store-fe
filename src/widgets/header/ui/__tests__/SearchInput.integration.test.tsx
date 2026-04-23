import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { server } from "@tests/msw-server";
import { mockRouterFunctions } from "@tests/setup/base.setup";
import { HttpResponse, http } from "msw";
import { useSearchParams } from "next/navigation";
import { afterEach, describe, expect, test, vi } from "vitest";
import { addRecentSearch } from "@/features/service/performance-search";
import { SearchInput } from "../SearchInput";

vi.mock("@/features/service/performance-search", async (importOriginal) => {
  const original =
    await importOriginal<
      typeof import("@/features/service/performance-search")
    >();
  return { ...original, addRecentSearch: vi.fn() };
});

const AUTOCOMPLETE_URL = "/api/performances/search/autocomplete";

const mockPerformances = [
  { id: 1, title: "서울 콘서트", category: "콘서트", regionName: "SEOUL" },
  { id: 2, title: "서울 뮤지컬", category: "뮤지컬", regionName: "SEOUL" },
];

const mockSearchParams = (query?: Record<string, string>) => {
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams(query) as ReturnType<typeof useSearchParams>,
  );
};

const renderWithQuery = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(ui, { wrapper: Wrapper });
};

/**
 * 검색 입력 + 자동완성 대기 헬퍼 함수
 * @param searchValue - 입력할 검색어
 * @returns input 요소
 */
const setupSearchWithAutocomplete = (searchValue: string) => {
  mockSearchParams();

  server.use(
    http.get(AUTOCOMPLETE_URL, () => HttpResponse.json(mockPerformances)),
  );

  renderWithQuery(<SearchInput />);
  const input = screen.getByPlaceholderText("어디로 떠나볼까요 ?");

  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: searchValue } });

  return input;
};

describe("SearchInput Integration", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe("3.1 디바운스 + 자동완성 API 연동", () => {
    test("검색어 입력 후 300ms 이내 → API 미호출", async () => {
      vi.useFakeTimers();
      mockSearchParams();

      const handler = vi.fn(() => HttpResponse.json(mockPerformances));
      server.use(http.get(AUTOCOMPLETE_URL, handler));

      renderWithQuery(<SearchInput />);
      const input = screen.getByPlaceholderText("어디로 떠나볼까요 ?");

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "서울" } });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(handler).not.toHaveBeenCalled();
    });

    test("검색어 입력 후 300ms 경과 → 자동완성 API 호출", async () => {
      mockSearchParams();

      const handler = vi.fn(() => HttpResponse.json(mockPerformances));
      server.use(http.get(AUTOCOMPLETE_URL, handler));

      renderWithQuery(<SearchInput />);
      const input = screen.getByPlaceholderText("어디로 떠나볼까요 ?");

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "서울" } });

      // 디바운스 대기 + API 호출 확인
      await waitFor(() => expect(handler).toHaveBeenCalled(), {
        timeout: 1000,
      });
    });

    test("API 응답 후 자동완성 항목 렌더링", async () => {
      setupSearchWithAutocomplete("서울");

      // 디바운스 대기 + API 응답 대기 + 렌더링 확인
      await waitFor(
        () => {
          const links = screen.getAllByRole("link");
          expect(links).toHaveLength(2);
          expect(links[0]).toHaveTextContent("서울 콘서트");
          expect(links[1]).toHaveTextContent("서울 뮤지컬");
        },
        { timeout: 1000 },
      );
    });
  });

  describe("3.2 자동완성 항목 클릭", () => {
    test("자동완성 항목 클릭 → 팝업 닫힘, 입력값 초기화", async () => {
      const input = setupSearchWithAutocomplete("서울");

      // 자동완성 항목이 렌더링될 때까지 대기
      await waitFor(
        () => {
          expect(screen.getAllByRole("link")).toHaveLength(2);
        },
        { timeout: 1000 },
      );

      // 첫번째 검색 결과 클릭
      const links = screen.getAllByRole("link");
      fireEvent.click(links[0]);

      // 팝업이 닫히고 입력값이 초기화되어야 함
      expect(input).toHaveValue("");
    });

    test("자동완성 항목 클릭 → `addRecentSearch` 호출 안 됨", async () => {
      setupSearchWithAutocomplete("서울");

      // 자동완성 항목이 렌더링될 때까지 대기
      await waitFor(
        () => {
          expect(screen.getAllByRole("link")).toHaveLength(2);
        },
        { timeout: 1000 },
      );

      const links = screen.getAllByRole("link");
      fireEvent.click(links[0]);

      // 자동완성 항목 클릭 시에는 addRecentSearch가 호출되지 않음
      const mockAddRecentSearch = vi.mocked(addRecentSearch);
      expect(mockAddRecentSearch).not.toHaveBeenCalled();
    });
  });

  describe("3.3 Enter로 검색 실행", () => {
    test("Enter 입력 → `addRecentSearch` 호출", () => {
      const input = setupSearchWithAutocomplete("서울");
      fireEvent.keyDown(input, { key: "Enter" });

      const mockAddRecentSearch = vi.mocked(addRecentSearch);
      expect(mockAddRecentSearch).toHaveBeenCalledWith("서울");
    });

    test("Enter 입력 → `router.push('/search?q=키워드')` 실행", () => {
      const input = setupSearchWithAutocomplete("서울");
      fireEvent.keyDown(input, { key: "Enter" });
      expect(mockRouterFunctions.push).toHaveBeenCalledWith(
        `/search?q=${encodeURIComponent("서울")}`,
      );
    });
  });

  describe("3.4 외부 클릭 처리", () => {
    test("InputGroup 내부 클릭 → 팝업 유지", async () => {
      const input = setupSearchWithAutocomplete("서울");

      // 자동완성 항목이 나타날 때까지 대기
      await waitFor(
        () => {
          expect(screen.getAllByRole("link")).toHaveLength(2);
        },
        { timeout: 1000 },
      );

      // InputGroup 내부(input) 클릭
      fireEvent.click(input);

      // 팝업이 유지되어 자동완성 항목이 여전히 존재해야 함
      expect(screen.getAllByRole("link")).toHaveLength(2);
    });
  });
});
