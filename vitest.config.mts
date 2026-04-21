import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    projects: [
      {
        plugins: [tsconfigPaths(), react()],
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
        plugins: [tsconfigPaths(), react()],
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
