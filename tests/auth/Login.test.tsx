import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { LoginView } from "@/views/service/auth";

test("Page", () => {
  render(<LoginView />);
  expect(screen.getByRole("heading", { level: 1, name: "Home" })).toBeDefined();
});
