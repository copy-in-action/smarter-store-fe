import { createEvent, fireEvent, render, screen } from "@testing-library/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { mockRouterFunctions } from "../../../../../tests/setup";
import { SearchInput } from "../SearchInput";

vi.mock("@/features/service/performance-search", () => ({
  addRecentSearch: vi.fn(),
  SearchAutocomplete: ({
    children,
    selectedIndex,
    open,
    onItemCountChange,
  }: {
    children: React.ReactNode;
    selectedIndex?: number;
    open?: boolean;
    onItemCountChange?: (count: number) => void;
  }) => {
    // 팝업이 열려있을 때 가상의 검색결과 3개 시뮬레이션
    useEffect(() => {
      if (open && onItemCountChange) {
        onItemCountChange(3);
      } else if (!open && onItemCountChange) {
        onItemCountChange(0);
      }
    }, [open, onItemCountChange]);

    return (
      <div
        data-testid="search-autocomplete"
        data-selected-index={selectedIndex}
        data-open={open}
      >
        {children}
      </div>
    );
  },
}));

/**
 * useSearchParams mock 설정 헬퍼 함수
 * @param query - URL query 파라미터 (예: { q: "서울" })
 */
const mockSearchParams = (query?: Record<string, string>) => {
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams(query) as ReturnType<typeof useSearchParams>,
  );
};

/**
 * SearchInput input 요소 가져오기 헬퍼 함수
 */
const getSearchInput = () => screen.getByPlaceholderText("어디로 떠나볼까요 ?");

/**
 * X 버튼 (clear button) 가져오기 헬퍼 함수
 */
const getClearButton = () => screen.queryByRole("button");

describe("SearchInput", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("렌더링", () => {
    test("초기 렌더링 시 placeholder '어디로 떠나볼까요 ?' 표시", () => {
      mockSearchParams();
      render(<SearchInput />);

      expect(getSearchInput()).toBeInTheDocument();
    });

    test("searchParams.q 값이 있으면 input 초기값으로 설정", () => {
      mockSearchParams({ q: "서울" });
      render(<SearchInput />);

      expect(getSearchInput()).toHaveValue("서울");
    });

    test("searchParams.q 값이 없으면 input 초기값 빈 문자열", () => {
      mockSearchParams();
      render(<SearchInput />);

      expect(getSearchInput()).toHaveValue("");
    });
  });

  describe("X 버튼 (검색어 지우기)", () => {
    test("입력값이 없을 때 X 버튼 미노출", () => {
      mockSearchParams();
      render(<SearchInput />);

      expect(getClearButton()).not.toBeInTheDocument();
    });

    test("입력값이 있을 때 X 버튼 노출", () => {
      mockSearchParams({ q: "공연" });
      render(<SearchInput />);

      expect(getClearButton()).toBeInTheDocument();
    });

    test("X 버튼 클릭 시 input 값 초기화", () => {
      mockSearchParams({ q: "공연" });
      render(<SearchInput />);

      const clearButton = getClearButton();
      fireEvent.click(clearButton!);

      expect(getSearchInput()).toHaveValue("");
    });
  });

  describe("handleSearch 경계값", () => {
    test("빈 문자열 입력 후 Enter → 검색 미실행 (router.push 미호출)", () => {
      mockSearchParams();
      render(<SearchInput />);
      const searchInput = getSearchInput();

      // 빈 문자열 상태에서 Enter 입력
      fireEvent.keyDown(searchInput, { key: "Enter" });

      // router.push가 호출되지 않았음을 검증
      expect(mockRouterFunctions.push).not.toHaveBeenCalled();
    });

    test("공백만 입력 후 Enter → trim 후 검색 미실행", () => {
      mockSearchParams();
      render(<SearchInput />);
      const searchInput = getSearchInput();

      // 공백만 입력
      fireEvent.change(searchInput, { target: { value: "   " } });
      fireEvent.keyDown(searchInput, { key: "Enter" });

      // router.push가 호출되지 않았음을 검증
      expect(mockRouterFunctions.push).not.toHaveBeenCalled();
    });

    test("정상 키워드 입력 후 Enter → router.push 호출", () => {
      mockSearchParams();
      render(<SearchInput />);
      const searchInput = getSearchInput();

      // 정상 키워드 입력
      fireEvent.change(searchInput, { target: { value: "서울" } });
      fireEvent.keyDown(searchInput, { key: "Enter" });

      // router.push가 올바른 URL로 호출되었음을 검증
      expect(mockRouterFunctions.push).toHaveBeenCalledWith(
        "/search?q=%EC%84%9C%EC%9A%B8",
      );
    });

    test("키워드 앞뒤 공백 → trim 적용 후 검색 실행", () => {
      mockSearchParams();
      render(<SearchInput />);
      const searchInput = getSearchInput();

      // 앞뒤 공백이 있는 키워드 입력
      fireEvent.change(searchInput, { target: { value: "  서울  " } });
      fireEvent.keyDown(searchInput, { key: "Enter" });

      // trim된 키워드로 router.push 호출되었음을 검증
      expect(mockRouterFunctions.push).toHaveBeenCalledWith(
        "/search?q=%EC%84%9C%EC%9A%B8",
      );
    });
  });

  describe("키보드 네비게이션", () => {
    test('IME 조합 중("isComposing: true") ArrowDown → selectedIndex 변경 없음', () => {
      mockSearchParams();
      render(<SearchInput />);
      const searchInput = getSearchInput();

      fireEvent.focus(searchInput);

      // "ㅅ" 입력 (IME 조합 시작)
      const compositionStartEvent = createEvent.compositionStart(searchInput, {
        data: "ㅅ",
      });
      fireEvent(searchInput, compositionStartEvent);

      // 입력값 변경
      fireEvent.change(searchInput, { target: { value: "ㅅ" } });

      // IME 조합 중 ArrowDown 입력 → handleKeyDown에서 early return 검증
      const arrowDownEvent = createEvent.keyDown(searchInput, {
        key: "ArrowDown",
      });
      Object.defineProperty(arrowDownEvent, "isComposing", {
        value: true,
      });
      fireEvent(searchInput, arrowDownEvent);

      // selectedIndex가 초기값(-1)을 유지하는지 확인
      const autocomplete = screen.getByTestId("search-autocomplete");
      expect(autocomplete).toHaveAttribute("data-selected-index", "-1");
    });

    test("팝업 닫힌 상태에서 ArrowDown → selectedIndex 변경 없음", () => {
      mockSearchParams();
      render(<SearchInput />);
      const searchInput = getSearchInput();

      // 입력값 설정
      fireEvent.change(searchInput, { target: { value: "서울" } });
      fireEvent.focus(searchInput);

      // Escape로 팝업 닫기
      fireEvent.keyDown(searchInput, { key: "Escape" });

      // 팝업 닫힌 상태에서 ArrowDown → handleKeyDown에서 조건 미충족으로 selectedIndex 변경 안 됨
      fireEvent.keyDown(searchInput, { key: "ArrowDown" });

      const autocomplete = screen.getByTestId("search-autocomplete");
      expect(autocomplete).toHaveAttribute("data-selected-index", "-1");
    });

    test("ArrowDown 연속 → 마지막 항목에서 더 이상 증가하지 않음 (경계값)", () => {
      mockSearchParams();
      render(<SearchInput />);
      const searchInput = getSearchInput();

      // 팝업 열기
      fireEvent.change(searchInput, { target: { value: "서울" } });
      fireEvent.focus(searchInput);

      const autocomplete = screen.getByTestId("search-autocomplete");

      // ArrowDown 3회로 마지막 항목(2)까지 이동 (mock에서 itemCount=3)
      fireEvent.keyDown(searchInput, { key: "ArrowDown" }); // -1 → 0
      fireEvent.keyDown(searchInput, { key: "ArrowDown" }); // 0 → 1
      fireEvent.keyDown(searchInput, { key: "ArrowDown" }); // 1 → 2
      expect(autocomplete).toHaveAttribute("data-selected-index", "2");

      // 추가 ArrowDown → 2 유지 (경계값 검증)
      fireEvent.keyDown(searchInput, { key: "ArrowDown" });
      expect(autocomplete).toHaveAttribute("data-selected-index", "2");
    });

    test("ArrowUp → 첫 번째 항목(0)에서 -1로 돌아옴 (선택 해제)", () => {
      mockSearchParams();
      render(<SearchInput />);
      const searchInput = getSearchInput();

      // 팝업 열기
      fireEvent.change(searchInput, { target: { value: "서울" } });
      fireEvent.focus(searchInput);

      // ArrowDown으로 첫 번째 항목 선택 (selectedIndex: -1 → 0)
      fireEvent.keyDown(searchInput, { key: "ArrowDown" });

      const autocomplete = screen.getByTestId("search-autocomplete");
      expect(autocomplete).toHaveAttribute("data-selected-index", "0");

      // ArrowUp으로 선택 해제 (selectedIndex: 0 → -1)
      fireEvent.keyDown(searchInput, { key: "ArrowUp" });

      expect(autocomplete).toHaveAttribute("data-selected-index", "-1");
    });

    test("ArrowUp → 이미 -1이면 -1 유지", () => {
      mockSearchParams();
      render(<SearchInput />);
      const searchInput = getSearchInput();

      // 팝업 열기
      fireEvent.change(searchInput, { target: { value: "서울" } });
      fireEvent.focus(searchInput);
      fireEvent.keyDown(searchInput, { key: "ArrowUp" });

      const autocomplete = screen.getByTestId("search-autocomplete");
      expect(autocomplete).toHaveAttribute("data-selected-index", "-1");
    });

    test("Escape → 팝업 닫힘, selectedIndex -1 리셋", () => {
      mockSearchParams();
      render(<SearchInput />);
      const searchInput = getSearchInput();

      // 팝업 열기
      fireEvent.change(searchInput, { target: { value: "서울" } });
      fireEvent.focus(searchInput);
      fireEvent.keyDown(searchInput, { key: "Escape" });

      const autocomplete = screen.getByTestId("search-autocomplete");
      expect(autocomplete).toHaveAttribute("data-open", "false");
      expect(autocomplete).toHaveAttribute("data-selected-index", "-1");
    });
  });
});
