import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["packages/**/*.test.ts", "scripts/**/*.test.ts", "apps/shop/src/**/*.test.ts"],
  },
});
