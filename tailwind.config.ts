import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.tsx", "./src/**/*.ts"],
  theme: {
    extend: {
      colors: {
        slate: {
          50: "#f3f2f7",
          100: "#e8e7ef",
          200: "#d1d0de",
          300: "#b9b8ca",
          400: "#a3a2b7",
          500: "#858498",
          600: "#62616f",
          700: "#41404d",
          800: "#2d2c38",
          900: "#19181e",
          950: "#0d0d10",
        },
        cyan: {
          50: "#effdff",
          100: "#d7faff",
          200: "#aff3fa",
          300: "#86e3e6",
          400: "#6fd6e0",
          500: "#4fc2d1",
          600: "#32a9b9",
          700: "#1d8290",
          800: "#206875",
          900: "#205663",
          950: "#103943",
        },
        rose: {
          50: "#fff4f6",
          100: "#ffe5eb",
          200: "#fbcdd7",
          300: "#eca4b0",
          400: "#e77d8e",
          500: "#e2546c",
          600: "#cf3658",
          700: "#ad2b4d",
          800: "#8c2944",
          900: "#70283d",
          950: "#451521",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
