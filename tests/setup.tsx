import "@testing-library/jest-dom/vitest";
import type React from "react";
import { vi } from "vitest";

// globals: true 설정으로 React Testing Library가 자동 cleanup 수행

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string | { src: string };
    alt: string;
    [key: string]: unknown;
  }) => (
    <img src={typeof src === "object" ? src.src : src} alt={alt} {...props} />
  ),
}));

/**
 * useRouter mock 객체
 * 모든 테스트에서 공유되는 기본 mock 객체
 */
export const mockRouterFunctions = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouterFunctions,
  useSearchParams: vi.fn(() => new URLSearchParams()), // 빈 URLSearchParams 반환 (실제 객체)
  usePathname: vi.fn().mockReturnValue("/"),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
