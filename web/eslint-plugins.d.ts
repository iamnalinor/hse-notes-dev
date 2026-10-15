// These ESLint plugins ship without type definitions. Declaring the shape we use
// keeps eslint.config.ts type-checked instead of silently `any`.
declare module "eslint-plugin-promise" {
  import type { Linter } from "eslint";

  const plugin: { configs: Record<"flat/recommended", Linter.Config> };
  export default plugin;
}
