/**
Architecture as code. `bun lint` fails when a dependency crosses a boundary.

  app ─► features/* ─► shared ─► api ─► domain

domain is pure (no React, no fetch, no other layer); api (zod schemas, data access) knows only
domain; shared (UI kit, the fragment reader) reaches down to api and domain; a feature folder
never imports another feature — shared pieces move to shared/.
*/
import { builtinModules } from "node:module";

/** @type {import("dependency-cruiser").IConfiguration} */
const config = {
  forbidden: [
    {
      name: "domain-is-pure",
      comment: "domain = pure rules and types: no other layer of the app.",
      severity: "error",
      from: { path: "^src/domain/", pathNot: "[.]test[.]tsx?$" },
      to: { path: "^src/(api|shared|features|app)/" },
    },
    {
      name: "api-only-needs-domain",
      severity: "error",
      from: { path: "^src/api/", pathNot: "[.]test[.]tsx?$" },
      to: { path: "^src/(shared|features|app)/" },
    },
    {
      name: "shared-does-not-know-features",
      severity: "error",
      from: { path: "^src/shared/", pathNot: "[.]test[.]tsx?$" },
      to: { path: "^src/(features|app)/" },
    },
    {
      name: "features-do-not-know-app",
      severity: "error",
      from: { path: "^src/features/" },
      to: { path: "^src/app/" },
    },
    {
      name: "features-are-isolated",
      comment: "A feature folder must not reach into another one. Share via src/shared.",
      severity: "error",
      from: { path: "^src/features/([^/]+)/" },
      to: { path: "^src/features/", pathNot: "^src/features/$1/" },
    },

    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "no-orphans",
      comment: "Unreachable module: delete it or import it.",
      severity: "error",
      from: {
        orphan: true,
        pathNot: [
          "(^|/)[.][^/]+[.](?:js|cjs|mjs|ts)$",
          "[.]d[.]ts$",
          "[.]config[.](ts|js)$",
          "^scripts/",
          "^src/test/setup[.]ts$", // loaded by vitest.config.ts
        ],
      },
      to: {},
    },
    {
      name: "not-to-test",
      comment: "Production code must not depend on tests or test fixtures.",
      severity: "error",
      from: { pathNot: ["[.]test[.]tsx?$", "^src/test/"] },
      to: { path: "[.]test[.]tsx?$|^src/test/" },
    },
    {
      name: "not-to-dev-dep",
      comment: "Production code must not import devDependencies.",
      severity: "error",
      from: { path: "^src/", pathNot: ["[.]test[.]tsx?$", "^src/test/"] },
      to: {
        dependencyTypes: ["npm-dev"],
        dependencyTypesNot: ["type-only"],
        pathNot: ["node_modules/@types/"],
      },
    },
    {
      name: "not-to-unresolvable",
      severity: "error",
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: "no-non-package-json",
      comment: "Every imported package must be declared in package.json.",
      severity: "error",
      from: {},
      to: { dependencyTypes: ["npm-no-pkg", "npm-unknown"] },
    },
  ],
  options: {
    builtInModules: {
      add: [],
      override: [...builtinModules, "bun", "bun:test"],
    },
    doNotFollow: { path: ["node_modules"] },
    exclude: { path: ["^dist/", "^coverage/", "^public/", "[.]d[.]ts$"] },
    tsConfig: { fileName: "tsconfig.json" },
    tsPreCompilationDeps: true,
    combinedDependencies: true,
    enhancedResolveOptions: {
      conditionNames: ["import", "require", "node", "default"],
      exportsFields: ["exports"],
      extensions: [".ts", ".tsx", ".js", ".mjs", ".cjs", ".json"],
      mainFields: ["module", "main"],
    },
  },
};

export default config;
