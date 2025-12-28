// This file extracts colors from tailwind.config.js for use in React Native
// It's a separate file to avoid bundling the entire Tailwind config
const tailwindConfig = require("../tailwind.config.js");

const twColors = tailwindConfig.theme.extend.colors;

module.exports = {
  primary: twColors.primary,
  secondary: twColors.secondary,
  dark: twColors.dark,
};
