import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import nextPlugin from "@next/eslint-plugin-next";
import storybook from "eslint-plugin-storybook";

export default [
  // Next.js recommended + Core Web Vitals rules
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },

  // TypeScript rules (replaces next/typescript)
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": tseslint,
    },
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      // Allow _-prefixed names to mark intentionally unused variables/args
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },

  // Storybook
  ...storybook.configs["flat/recommended"],

  // Ignores
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "**/*.stories.ts",
      "**/*.stories.tsx",
      "**/*.stories.js",
      "**/*.stories.jsx",
      "src/stories/**",
      ".storybook/**",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "vitest.setup.ts",
      "vitest.config.ts",
      "**/__tests__/**",
    ],
  },

  // Custom rules (app-wide)
  {
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "ImportDeclaration[source.value=/^@fitness\\/shared/] > ImportSpecifier[imported.name=/^use/]",
          message:
            "Direct import of hooks from @fitness/shared is not allowed. Please use the local wrapper hook from src/hooks/ instead to ensure dependencies are injected.",
        },
      ],
    },
  },

  // src/hooks/ files ARE the wrappers — they must import use* from @fitness/shared
  {
    files: ["src/hooks/**"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },

  // shadcn/ui generated component library files — exports that aren't consumed
  // within the same file are intentional (they form the public component API).
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];
