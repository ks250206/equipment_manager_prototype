import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/app/",
        "src/components/ui/",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.config.ts",
        "**/*.config.mjs",
        "vitest.setup.ts",
        "src/middleware.ts",
        "src/auth.ts",
        "src/auth.config.ts",
        "src/lib/check-env.ts",
        "src/lib/test-auth.ts",
        "src/lib/migrate-building-hierarchy.ts",
        "src/lib/seed.ts",
        "src/types/",
      ],
    },
  },
});
