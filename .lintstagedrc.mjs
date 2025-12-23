export default {
  "apps/web/**/*.{js,jsx,ts,tsx}": [
    "cd apps/web && ../../node_modules/.bin/eslint --fix",
  ],
  "packages/shared/**/*.{js,jsx,ts,tsx}": [
    "cd packages/shared && ./node_modules/.bin/eslint --fix",
  ],
};
