import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { SearchInput } from "../SearchInput";

vi.mock("@/features/service/performance-search", () => ({
  addRecentSearch: vi.fn(),
  SearchAutocomplete: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("렌더링", () => {
  test("placeholder '어디로 떠나볼까요 ?' 표시", () => {
    render(<SearchInput />);
    expect(
      screen.getByPlaceholderText("어디로 떠나볼까요 ?"),
    ).toBeInTheDocument();
  });
});
