import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        "extra-large": "var(--md-sys-shape-corner-extra-large)",
        lg: "var(--md-sys-shape-corner-large)",
        md: "var(--md-sys-shape-corner-medium)",
        sm: "var(--md-sys-shape-corner-small)",
        xs: "var(--md-sys-shape-corner-extra-small)",
      },
      colors: {
        background: "hsl(var(--md-sys-color-background))",
        foreground: "hsl(var(--md-sys-color-on-background))",
        card: {
          DEFAULT: "hsl(var(--md-sys-color-surface-container))",
          foreground: "hsl(var(--md-sys-color-on-surface))",
        },
        popover: {
          DEFAULT: "hsl(var(--md-sys-color-surface-container-high))",
          foreground: "hsl(var(--md-sys-color-on-surface))",
        },
        primary: {
          DEFAULT: "hsl(var(--md-sys-color-primary))",
          foreground: "hsl(var(--md-sys-color-on-primary))",
        },
        "primary-container": {
          DEFAULT: "hsl(var(--md-sys-color-primary-container))",
          foreground: "hsl(var(--md-sys-color-on-primary-container))",
        },
        secondary: {
          DEFAULT: "hsl(var(--md-sys-color-secondary))",
          foreground: "hsl(var(--md-sys-color-on-secondary))",
        },
        "secondary-container": {
          DEFAULT: "hsl(var(--md-sys-color-secondary-container))",
          foreground: "hsl(var(--md-sys-color-on-secondary-container))",
        },
        tertiary: {
          DEFAULT: "hsl(var(--md-sys-color-tertiary))",
          foreground: "hsl(var(--md-sys-color-on-tertiary))",
        },
        "tertiary-container": {
          DEFAULT: "hsl(var(--md-sys-color-tertiary-container))",
          foreground: "hsl(var(--md-sys-color-on-tertiary-container))",
        },
        muted: {
          DEFAULT: "hsl(var(--md-sys-color-surface-container-low))",
          foreground: "hsl(var(--md-sys-color-on-surface-variant))",
        },
        accent: {
          DEFAULT: "hsl(var(--md-sys-color-secondary-container))",
          foreground: "hsl(var(--md-sys-color-on-secondary-container))",
        },
        destructive: {
          DEFAULT: "hsl(var(--md-sys-color-error))",
          foreground: "hsl(var(--md-sys-color-on-error))",
        },
        border: "hsl(var(--md-sys-color-outline-variant))",
        input: "hsl(var(--md-sys-color-surface-container-high))",
        ring: "hsl(var(--md-sys-color-primary))",
        chart: {
          "1": "hsl(var(--md-sys-color-primary))",
          "2": "hsl(var(--md-sys-color-secondary))",
          "3": "hsl(var(--md-sys-color-tertiary))",
          "4": "hsl(var(--md-sys-color-primary-container))",
          "5": "hsl(var(--md-sys-color-secondary-container))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--md-sys-color-surface-container-low))",
          foreground: "hsl(var(--md-sys-color-on-surface))",
          primary: "hsl(var(--md-sys-color-primary))",
          "primary-foreground": "hsl(var(--md-sys-color-on-primary))",
          accent: "hsl(var(--md-sys-color-secondary))",
          "accent-foreground": "hsl(var(--md-sys-color-on-secondary))",
          border: "hsl(var(--md-sys-color-outline))",
          ring: "hsl(var(--md-sys-color-primary))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
