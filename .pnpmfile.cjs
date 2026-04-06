/**
 * Patch @typescript-eslint/utils to use @eslint/eslintrc@^3 instead of ^2.
 *
 * @typescript-eslint/utils@8.x declares @eslint/eslintrc@^2 as a direct
 * dependency. ESLint 9 requires v3, so pnpm preserves a nested v2 copy inside
 * @typescript-eslint/utils/node_modules/ rather than deduplicating against the
 * v3 copy used everywhere else. That nested v2 ships an incompatible bundled
 * ajv that crashes at startup ("Cannot set properties of undefined (setting
 * 'defaultMeta')"). Rewriting the range here forces pnpm to resolve a single
 * shared v3 copy so the nested directory is never created.
 */
function readPackage(pkg) {
  if (pkg.dependencies?.["@eslint/eslintrc"]) {
    pkg.dependencies["@eslint/eslintrc"] = "^3.0.0";
  }
  if (pkg.devDependencies?.["@eslint/eslintrc"]) {
    pkg.devDependencies["@eslint/eslintrc"] = "^3.0.0";
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
