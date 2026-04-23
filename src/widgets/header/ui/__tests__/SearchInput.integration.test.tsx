import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { server } from "@tests/msw-server";
import { HttpResponse, http } from "msw";
import { useSearchParams } from "next/navigation";
import { afterEach, describe, expect, test, vi } from "vitest";
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
      mockSearchParams();

      server.use(
        http.get(AUTOCOMPLETE_URL, () => HttpResponse.json(mockPerformances)),
      );

      renderWithQuery(<SearchInput />);
      const input = screen.getByPlaceholderText("어디로 떠나볼까요 ?");

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "서울" } });

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
});
