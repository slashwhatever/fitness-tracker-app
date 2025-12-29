// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Exclude Storybook files from production builds
      "**/*.stories.ts",
      "**/*.stories.tsx",
      "**/*.stories.js",
      "**/*.stories.jsx",
      "src/stories/**",
      ".storybook/**",
      // Exclude test files from production builds
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "vitest.setup.ts",
      "vitest.config.ts",
      "**/__tests__/**",
    ],
  },
  ...storybook.configs["flat/recommended"],
  {
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "ImportDeclaration[source.value='@fitness/shared'] > ImportSpecifier[imported.name=/^use/]",
          message:
            "Direct import of hooks from @fitness/shared is not allowed. Please use the local wrapper hook from src/hooks/ instead to ensure dependencies are injected.",
        },
      ],
    },
  },
];

export default eslintConfig;
