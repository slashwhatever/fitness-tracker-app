/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");

module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "../../packages/shared/src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6366f1", // Indigo 500
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        secondary: {
          DEFAULT: "#ec4899", // Pink 500
          50: "#fdf2f8",
          100: "#fce7f3",
          200: "#fbcfe8",
          300: "#f9a8d4",
          400: "#f472b6",
          500: "#ec4899",
          600: "#db2777",
          700: "#be185d",
          800: "#9d174d",
          900: "#831843",
        },
        // Semantic CSS variable-based colors
        background: "rgb(var(--color-background) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        card: "rgb(var(--color-card) / <alpha-value>)",
        "card-foreground": "rgb(var(--color-card-foreground) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        input: "rgb(var(--color-input) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        "muted-foreground":
          "rgb(var(--color-muted-foreground) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [
    ({ addBase }) =>
      addBase({
        ":root": {
          // Light mode
          "--color-background": "255 255 255", // white
          "--color-foreground": "15 23 42", // slate-900
          "--color-card": "255 255 255", // white
          "--color-card-foreground": "15 23 42", // slate-900
          "--color-border": "226 232 240", // slate-200
          "--color-input": "248 250 252", // slate-50
          "--color-muted": "248 250 252", // slate-50
          "--color-muted-foreground": "100 116 139", // slate-500
        },
        ".dark": {
          // Dark mode
          "--color-background": "15 23 42", // slate-900
          "--color-foreground": "255 255 255", // white
          "--color-card": "30 41 59", // slate-800
          "--color-card-foreground": "255 255 255", // white
          "--color-border": "51 65 85", // slate-700
          "--color-input": "15 23 42", // slate-900
          "--color-muted": "30 41 59", // slate-800
          "--color-muted-foreground": "148 163 184", // slate-400
        },
      }),
  ],
};
