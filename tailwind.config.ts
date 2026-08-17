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
         * Brand ramp — deep indigo through violet. 700 is the primary action
         * colour, 950 is the "ink" used for headings and dark surfaces. Every
         * component references these steps, so retuning the ramp restyles the
         * whole product without touching a single component.
         */
        brand: {
          50: "#F2EFFF",
          100: "#E6E0FF",
          200: "#CFC4FF",
          300: "#AE9BFF",
          400: "#8D70FB",
          500: "#7048F2",
          600: "#5B2FD9",
          700: "#4A24B8",
          800: "#3A1C92",
          900: "#2B1470",
          950: "#1B1145",
        },
        /** Violet used for gradient accents and highlight text. */
        violet: {
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
        },
        ink: {
          DEFAULT: "#1B1145",
          soft: "#2B1470",
          muted: "#5C5580",
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
        // Shadows are tinted with the brand ink rather than neutral black, which
        // is what keeps surfaces looking seated on the lavender canvas.
        xs: "0 1px 2px 0 rgb(27 17 69 / 0.05)",
        sm: "0 1px 3px 0 rgb(27 17 69 / 0.07), 0 1px 2px -1px rgb(27 17 69 / 0.05)",
        DEFAULT: "0 2px 6px -1px rgb(27 17 69 / 0.08), 0 1px 3px -1px rgb(27 17 69 / 0.05)",
        md: "0 8px 20px -6px rgb(27 17 69 / 0.10), 0 2px 6px -2px rgb(27 17 69 / 0.05)",
        lg: "0 18px 40px -12px rgb(27 17 69 / 0.14), 0 4px 12px -4px rgb(27 17 69 / 0.05)",
        xl: "0 32px 70px -20px rgb(27 17 69 / 0.22), 0 10px 24px -10px rgb(27 17 69 / 0.07)",
        card: "0 1px 2px 0 rgb(27 17 69 / 0.03), 0 10px 30px -18px rgb(27 17 69 / 0.16)",
        /** Detached floating surfaces: the pill navbar and hero product card. */
        float: "0 24px 60px -22px rgb(27 17 69 / 0.28), 0 8px 20px -12px rgb(27 17 69 / 0.12)",
        pill: "0 4px 16px -6px rgb(27 17 69 / 0.14), 0 1px 3px 0 rgb(27 17 69 / 0.06)",
        cta: "0 12px 28px -10px rgb(74 36 184 / 0.50), 0 4px 10px -4px rgb(74 36 184 / 0.30)",
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
        /** Continuous feature strip. Travels exactly half the track, which holds
         *  a duplicated list, so the loop is seamless. */
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        /** Gentle bob for the callout badges pinned around the hero card. */
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-7px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.3s ease-out both",
        "scale-in": "scale-in 0.16s cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-up": "slide-up 0.24s cubic-bezier(0.16, 1, 0.3, 1) both",
        marquee: "marquee 38s linear infinite",
        float: "float 5s ease-in-out infinite",
        "float-slow": "float 7s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
