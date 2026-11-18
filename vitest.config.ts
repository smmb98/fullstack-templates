import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // Feature unit tests import the app's `@/` modules (Next handles this at build time).
      "@": fileURLToPath(new URL("./apps/shop/src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["packages/**/*.test.ts", "scripts/**/*.test.ts", "apps/shop/src/**/*.test.ts"],
  },
});
