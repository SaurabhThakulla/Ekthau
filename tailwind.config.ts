import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "monospace"],
      },

      colors: {
        /**
         * Brand ramp. 700 (#1E3A8A) is the primary action colour and 950
         * (#0B132B) is the "ink" used for headings and dark surfaces. Both
         * were the original brand values — the ramp just makes the in-between
         * steps available instead of hand-written hex literals.
         */
        brand: {
          50: "#EFF4FF",
          100: "#DBE5FF",
          200: "#BFD0FE",
          300: "#93B0FD",
          400: "#6086FA",
          500: "#3B60F6",
          600: "#2542EB",
          700: "#1E3A8A",
          800: "#1A2F6D",
          900: "#16264F",
          950: "#0B132B",
        },
        ink: {
          DEFAULT: "#0B132B",
          soft: "#1C2541",
          muted: "#475569",
        },

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },

      /**
       * Values the markup already referenced but that do not exist in the
       * Tailwind v3 default theme (they are v4-only names). Defining them here
       * keeps the intended design instead of silently dropping the rule.
       */
      spacing: {
        4.5: "1.125rem",
        15: "3.75rem",
        18: "4.5rem",
        22: "5.5rem",
      },
      scale: {
        98: "0.98",
      },
      transitionDuration: {
        400: "400ms",
      },

      borderRadius: {
        xs: "calc(var(--radius) - 6px)",
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 16px)",
      },

      boxShadow: {
        xs: "0 1px 2px 0 rgb(11 19 43 / 0.05)",
        sm: "0 1px 3px 0 rgb(11 19 43 / 0.08), 0 1px 2px -1px rgb(11 19 43 / 0.06)",
        DEFAULT: "0 2px 6px -1px rgb(11 19 43 / 0.09), 0 1px 3px -1px rgb(11 19 43 / 0.06)",
        md: "0 6px 16px -4px rgb(11 19 43 / 0.10), 0 2px 6px -2px rgb(11 19 43 / 0.06)",
        lg: "0 14px 32px -10px rgb(11 19 43 / 0.16), 0 4px 10px -4px rgb(11 19 43 / 0.06)",
        xl: "0 26px 56px -18px rgb(11 19 43 / 0.24), 0 8px 18px -8px rgb(11 19 43 / 0.08)",
        card: "0 1px 2px 0 rgb(11 19 43 / 0.04), 0 8px 24px -16px rgb(11 19 43 / 0.18)",
      },

      maxWidth: {
        content: "72rem",
        prose: "68ch",
      },

      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.3s ease-out both",
        "scale-in": "scale-in 0.16s cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-up": "slide-up 0.24s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
