import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    projects: [
      {
        plugins: [react()],
        resolve: {
          tsconfigPaths: true,
        },
        test: {
          name: "unit",
          globals: true,
          environment: "jsdom",
          include: ["src/**/*.test.{ts,tsx}"],
          exclude: ["src/**/*.integration.test.{ts,tsx}"],
          setupFiles: ["./tests/setup/unit.setup.tsx"],
        },
      },
      {
        plugins: [react()],
        resolve: {
          tsconfigPaths: true,
        },
        test: {
          name: "integration",
          globals: true,
          environment: "jsdom",
          include: ["src/**/*.integration.test.{ts,tsx}"],
          setupFiles: ["./tests/setup/integration.setup.tsx"],
        },
      },
    ],
  },
});
