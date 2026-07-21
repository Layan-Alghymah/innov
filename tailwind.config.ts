import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-ibm-plex-arabic)", "IBM Plex Sans Arabic", "sans-serif"],
      },
      colors: {
        // Brand palette — matches reference design exactly
        primary: {
          DEFAULT: "#4F46E5",
          50: "#EEF0FD",
          100: "#DFE1FB",
          400: "#7671EE",
          500: "#4F46E5",
          600: "#4338CA",
          700: "#372CA8",
        },
        secondary: {
          DEFAULT: "#7C3AED",
          50: "#F3ECFE",
          400: "#9A64F1",
          500: "#7C3AED",
          600: "#6D28D9",
        },
        bg: {
          DEFAULT: "#F7F9FC",
          dark: "#0B1120",
        },
        sidebar: {
          DEFAULT: "#132A63",
          light: "#1B3A82",
          hover: "#1E3A73",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          dark: "#111A2E",
        },
        border: {
          DEFAULT: "#E6EAF2",
          dark: "#1F2A44",
        },
        muted: {
          DEFAULT: "#8A93A6",
          dark: "#6B7690",
        },
        success: { DEFAULT: "#16B364", bg: "#E7F9EF" },
        warning: { DEFAULT: "#F5A623", bg: "#FEF4E3" },
        danger: { DEFAULT: "#EF4444", bg: "#FDEEEE" },
        info: { DEFAULT: "#3B82F6", bg: "#EAF1FE" },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        soft: "0 4px 24px -4px rgba(19, 42, 99, 0.08)",
        card: "0 2px 12px -2px rgba(19, 42, 99, 0.06)",
        "card-hover": "0 12px 32px -8px rgba(79, 70, 229, 0.18)",
        glass: "0 8px 32px 0 rgba(19, 42, 99, 0.10)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
        "gradient-sidebar": "linear-gradient(180deg, #132A63 0%, #0E2050 100%)",
      },
      keyframes: {
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        "fade-up": "fade-up 0.5s ease-out",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
