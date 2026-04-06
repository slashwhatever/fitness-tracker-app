import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": tseslint,
    },
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "ImportDeclaration[source.value=/^@fitness\\/shared/] > ImportSpecifier[imported.name=/^use/]",
          message:
            "Direct import of hooks from @fitness/shared is not allowed. Please use the local wrapper hook from @hooks/ instead to ensure dependencies are injected.",
        },
      ],
      "no-console": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["hooks/**"],
    rules: { "no-restricted-syntax": "off" },
  },
  {
    files: ["components/ThemeProvider.tsx"],
    rules: { "react-hooks/exhaustive-deps": "off" },
  },
  {
    files: ["**/*.{js}"],
    rules: {
      "no-console": "error",
    },
  },
];
