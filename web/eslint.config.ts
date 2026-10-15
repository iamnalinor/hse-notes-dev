import type { Linter } from "eslint";

/**
One flat config for the frontend. Principle: as strict as possible, except where a rule
makes code worse — every such exception is disabled here WITH a reason.
The rule set follows iamnalinor/pace-dev (see docs/linting.md).
*/
import comments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import eslintReact from "@eslint-react/eslint-plugin";
import eslint from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import prettier from "eslint-config-prettier";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import betterTailwind from "eslint-plugin-better-tailwindcss";
import checkFile from "eslint-plugin-check-file";
import functional from "eslint-plugin-functional";
import { flatConfigs as importX } from "eslint-plugin-import-x";
import perfectionist from "eslint-plugin-perfectionist";
import promise from "eslint-plugin-promise";
import reactHooks from "eslint-plugin-react-hooks";
import regexp from "eslint-plugin-regexp";
import security from "eslint-plugin-security";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

/** Fails loudly if a plugin stops shipping a config we rely on (instead of silently linting less). */
const required = <T>(value: T | undefined, name: string): T => {
  if (value === undefined) {
    throw new Error(`Missing ESLint config: ${name}`);
  }
  return value;
};

const TESTS = ["**/*.test.{ts,tsx}", "src/test/**/*.{ts,tsx}"];
const REACT = ["src/**/*.{ts,tsx}"];
// Tools require a default export from their config files.
const CONFIG_FILES = ["*.config.ts", ".dependency-cruiser.mjs", "**/*.d.ts"];
// Shared domain logic: pure and immutable (functional rules apply).
const PURE_LAYERS = ["src/domain/**/*.ts"];

export default defineConfig([
  globalIgnores(["dist/", "coverage/", "public/data/", "public/pdf/", "src/styles/fonts/"]),

  // ── Base: JS + TypeScript, type-aware ───────────────────────────────────────
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    linterOptions: { reportUnusedDisableDirectives: "error", reportUnusedInlineConfigs: "error" },
    rules: {
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/consistent-type-exports": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports", prefer: "type-imports" },
      ],
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        // `onClick={async () => ...}` is idiomatic React; the promise is handled inside.
        { checksVoidReturn: { attributes: false } },
      ],
      "@typescript-eslint/no-unnecessary-qualifier": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-useless-empty-export": "error",
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/promise-function-async": "error",
      "@typescript-eslint/require-array-sort-compare": "error",
      "@typescript-eslint/return-await": ["error", "always"],
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
      "@typescript-eslint/strict-boolean-expressions": [
        "error",
        { allowNullableObject: false, allowNumber: false, allowString: false },
      ],
      "@typescript-eslint/switch-exhaustiveness-check": [
        "error",
        { considerDefaultExhaustiveForUnions: false, requireDefaultForNonUnion: true },
      ],
      "@typescript-eslint/naming-convention": [
        "error",
        { format: ["PascalCase"], selector: "typeLike" },
        {
          // UPPER_CASE for true constants, PascalCase for React components and zod schemas.
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
          leadingUnderscore: "allow",
          selector: "variable",
        },
      ],
    },
  },

  // ── Core rules: correctness and WPS-style size limits ────────────────────────
  {
    rules: {
      complexity: ["error", 10],
      curly: ["error", "all"],
      eqeqeq: ["error", "always"],
      "max-depth": ["error", 3],
      "max-lines": ["error", { max: 300, skipBlankLines: true, skipComments: true }],
      "max-lines-per-function": ["error", { max: 60, skipBlankLines: true, skipComments: true }],
      "max-nested-callbacks": ["error", 3],
      "max-params": ["error", 3],
      "max-statements": ["error", 15],
      "no-console": "error",
      "no-else-return": ["error", { allowElseIf: false }],
      "no-implicit-coercion": "error",
      "no-param-reassign": ["error", { props: true }],
      "no-restricted-syntax": [
        "error",
        {
          message: "Use a union of string literals instead of enum.",
          selector: "TSEnumDeclaration",
        },
        {
          message: "for..in iterates inherited keys; use Object.entries/keys.",
          selector: "ForInStatement",
        },
      ],
      "no-useless-rename": "error",
      "object-shorthand": ["error", "always"],
      "prefer-const": "error",
      "prefer-template": "error",
    },
  },

  // ── Plugins ──────────────────────────────────────────────────────────────────
  unicorn.configs.recommended,
  {
    rules: {
      // File names are enforced by check-file (single source of truth).
      "unicorn/filename-case": "off",
      // null is part of JSON, the DOM and React APIs; banning it forces awkward conversions.
      "unicorn/no-null": "off",
      // Fights conventional short names (props, params, ref, el) — noise, not clarity.
      "unicorn/name-replacements": "off",
      // `() => undefined` is the explicit "ignore" callback; `() => {}` reads like a mistake.
      "unicorn/no-useless-undefined": ["error", { checkArrowFunctionBody: false }],
      // One-line JSDoc (`/** ... */`) is the idiomatic way to document a declaration.
      "unicorn/single-line-block-comment-style": "off",
    },
  },

  // Typed as legacy-or-flat; "recommended" is the flat one ("recommended-legacy" is legacy).
  required(sonarjs.configs?.["recommended"], "sonarjs recommended") as Linter.Config,
  {
    rules: {
      "sonarjs/cognitive-complexity": ["error", 10],
      // Duplicated with @typescript-eslint equivalents (which are type-aware).
      "sonarjs/deprecation": "off",
      "sonarjs/no-unused-vars": "off",
      // TODO comments are allowed only with a tracking reference (enforced in review).
      "sonarjs/todo-tag": "off",
    },
  },

  importX.recommended,
  importX.typescript,
  {
    rules: {
      "import-x/consistent-type-specifier-style": "off", // inline style via consistent-type-imports
      "import-x/first": "error",
      "import-x/newline-after-import": "error",
      "import-x/no-cycle": "error",
      "import-x/no-default-export": "error",
      "import-x/no-duplicates": ["error", { "prefer-inline": true }],
      "import-x/no-extraneous-dependencies": "error",
      "import-x/no-mutable-exports": "error",
      "import-x/no-relative-packages": "error",
      "import-x/no-self-import": "error",
      "import-x/no-useless-path-segments": "error",
      // Resolution is TypeScript's job (tsc runs in `bun lint`); avoids false positives on `bun:*`.
      "import-x/no-unresolved": "off",
    },
    settings: {
      "import-x/resolver-next": [
        createTypeScriptImportResolver({
          noWarnOnMultipleProjects: true,
          project: ["tsconfig.json"],
        }),
      ],
    },
  },

  {
    plugins: { perfectionist },
    rules: {
      "perfectionist/sort-exports": "error",
      "perfectionist/sort-heritage-clauses": "error",
      "perfectionist/sort-imports": [
        "error",
        { internalPattern: ["^#web/.*"], newlinesBetween: 1 },
      ],
      "perfectionist/sort-intersection-types": "error",
      "perfectionist/sort-jsx-props": "error",
      "perfectionist/sort-named-exports": "error",
      "perfectionist/sort-named-imports": "error",
      "perfectionist/sort-union-types": "error",
      // NOT enabled: sort-objects / sort-object-types / sort-interfaces / sort-classes.
      // They destroy meaningful order (id first, table columns, config sections).
    },
    settings: { perfectionist: { ignoreCase: true, type: "natural" } },
  },

  {
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.{ts,tsx}": "KEBAB_CASE" },
        { ignoreMiddleExtensions: true },
      ],
      "check-file/folder-naming-convention": ["error", { "src/**/": "KEBAB_CASE" }],
      "check-file/no-index": "error",
    },
  },

  promise.configs["flat/recommended"],
  {
    rules: {
      "promise/always-return": "off", // async/await style: .then chains are banned below anyway
      "promise/prefer-await-to-callbacks": "error",
      "promise/prefer-await-to-then": ["error", { strict: true }],
    },
  },

  regexp.configs["flat/recommended"],

  security.configs.recommended,
  {
    rules: {
      // Flags every obj[key] — pure noise in type-checked code (keys are typed unions).
      "security/detect-object-injection": "off",
    },
  },

  comments.recommended,
  {
    rules: {
      "@eslint-community/eslint-comments/no-unlimited-disable": "error",
      "@eslint-community/eslint-comments/require-description": ["error", { ignore: [] }],
    },
  },

  // ── Domain logic is pure and immutable ───────────────────────────────────────
  {
    files: PURE_LAYERS,
    ignores: TESTS,
    plugins: { functional },
    rules: {
      "functional/immutable-data": ["error", { ignoreClasses: true }],
      "functional/no-classes": "error",
      "functional/no-let": "error",
      "functional/no-this-expressions": "error",
      "functional/no-throw-statements": "error",
      "functional/prefer-property-signatures": "error",
      "functional/readonly-type": ["error", "keyword"],
    },
  },

  // ── Dev scripts own stdout/stderr and the exit code ──────────────────────────
  {
    files: ["scripts/**"],
    rules: {
      "no-console": "off",
      "unicorn/no-process-exit": "off",
      "security/detect-non-literal-fs-filename": "off",
    },
  },

  // ── React ────────────────────────────────────────────────────────────────────
  {
    ...eslintReact.configs["strict-type-checked"],
    files: REACT,
  },
  {
    ...reactHooks.configs.flat["recommended-latest"],
    files: REACT,
  },
  {
    files: REACT,
    rules: {
      // JSX components: the inferred return type (JSX.Element) is noise.
      "@typescript-eslint/explicit-module-boundary-types": "off",
      // `useContext` is fine: the Context objects here are read in hooks, not conditionally.
      "@eslint-react/no-use-context": "off",
      // React 19's ReactNode includes Promise, so this rule would "fix" components that
      // return children into `async` components — which breaks them.
      "@typescript-eslint/promise-function-async": "off",
      "max-lines-per-function": ["error", { max: 80, skipBlankLines: true, skipComments: true }],
    },
  },

  // ── Tailwind v4 classes ──────────────────────────────────────────────────────
  {
    files: REACT,
    plugins: { "better-tailwindcss": betterTailwind },
    rules: {
      ...betterTailwind.configs["recommended-error"].rules,
      "better-tailwindcss/enforce-consistent-line-wrapping": "off",
      // Hand-written classes of src/styles/prose.css (styling of the build's HTML fragments).
      "better-tailwindcss/no-unknown-classes": [
        "error",
        { ignore: ["^ref$", "^prose-notes$", "^math-display$", "^math-inline$", "^flash$"] },
      ],
    },
    settings: {
      "better-tailwindcss": { entryPoint: "src/styles/app.css" },
    },
  },

  // ── Tests ────────────────────────────────────────────────────────────────────
  {
    files: TESTS,
    rules: {
      // describe/test callbacks are long and nested by design; tests favour DAMP over DRY.
      "max-lines-per-function": "off",
      "max-lines": "off",
      "max-nested-callbacks": ["error", 5],
      "max-statements": "off",
      "sonarjs/no-duplicate-string": "off",
      "unicorn/no-await-expression-member": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "sonarjs/no-nested-functions": "off",
    },
  },
  {
    ...vitest.configs.recommended,
    files: ["src/**/*.test.{ts,tsx}"],
  },

  // ── Config files ─────────────────────────────────────────────────────────────
  {
    files: CONFIG_FILES,
    rules: {
      "import-x/no-default-export": "off",
      // A config file is one `export default defineConfig(...)` call by design.
      "unicorn/no-top-level-side-effects": "off",
      // Tool configs are declarative lists; several plugins ship without type definitions.
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "import-x/no-named-as-default-member": "off",
      "max-lines": "off",
    },
  },

  // Turns off purely stylistic rules that would fight the formatter (Biome).
  prettier,

  // ...but it also turns off these "special" rules, which do not conflict with Biome
  // (Biome never adds or removes braces, and we always use semicolons).
  {
    rules: {
      curly: ["error", "all"],
      "no-unexpected-multiline": "error",
    },
  },
]);
