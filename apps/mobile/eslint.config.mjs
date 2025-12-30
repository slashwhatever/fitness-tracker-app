export default [
  {
    files: ["**/*.{js,ts,tsx}"],
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
    },
  },
];
