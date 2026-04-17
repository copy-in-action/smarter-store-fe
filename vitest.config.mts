import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    globals: true, // describe, test, expect 등 전역 사용 + 자동 cleanup
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    setupFiles: ["./tests/setup.tsx"],
  },
});
