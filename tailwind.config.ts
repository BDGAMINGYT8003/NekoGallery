import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--m3-font-family-sans)", "sans-serif"],
      },
      borderRadius: {
        none: "var(--m3-shape-radius-none)",
        xs: "var(--m3-shape-radius-xs)",
        sm: "var(--m3-shape-radius-sm)",
        md: "var(--m3-shape-radius-md)",
        lg: "var(--m3-shape-radius-lg)",
        xl: "var(--m3-shape-radius-xl)",
        full: "var(--m3-shape-radius-full)",
      },
      colors: {
        border: "hsl(var(--m3-outline))",
        input: "hsl(var(--m3-outline-variant))",
        ring: "hsl(var(--m3-primary))",
        background: "hsl(var(--m3-surface))",
        foreground: "hsl(var(--m3-on-surface))",
        primary: {
          DEFAULT: "hsl(var(--m3-primary))",
          foreground: "hsl(var(--m3-on-primary))",
        },
        secondary: {
          DEFAULT: "hsl(var(--m3-secondary))",
          foreground: "hsl(var(--m3-on-secondary))",
        },
        destructive: {
          DEFAULT: "hsl(var(--m3-error))",
          foreground: "hsl(var(--m3-on-error))",
        },
        muted: {
          DEFAULT: "hsl(var(--m3-surface-container-high))",
          foreground: "hsl(var(--m3-on-surface-variant))",
        },
        accent: {
          DEFAULT: "hsl(var(--m3-secondary-container))",
          foreground: "hsl(var(--m3-on-secondary-container))",
        },
        popover: {
          DEFAULT: "hsl(var(--m3-surface-container-low))",
          foreground: "hsl(var(--m3-on-surface))",
        },
        card: {
          DEFAULT: "hsl(var(--m3-surface-container))",
          foreground: "hsl(var(--m3-on-surface))",
        },
        chart: {
          "1": "hsl(var(--m3-primary))",
          "2": "hsl(var(--m3-secondary))",
          "3": "hsl(var(--m3-tertiary))",
          "4": "hsl(var(--m3-primary-container))",
          "5": "hsl(var(--m3-secondary-container))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--m3-surface-container-low))",
          foreground: "hsl(var(--m3-on-surface))",
          primary: "hsl(var(--m3-primary))",
          "primary-foreground": "hsl(var(--m3-on-primary))",
          accent: "hsl(var(--m3-secondary-container))",
          "accent-foreground": "hsl(var(--m3-on-secondary-container))",
          border: "hsl(var(--m3-outline))",
          ring: "hsl(var(--m3-primary))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "spring-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "60%": { transform: "scale(1.02)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "spring-out": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.95)", opacity: "0" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "50%": { transform: "scale(1.1)", opacity: "1" },
          "70%": { transform: "scale(0.9)" },
          "90%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "spring-in": "spring-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "spring-out": "spring-out 0.2s ease-out",
        "bounce-in": "bounce-in 0.5s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
