import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/widgets/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "var(--citadel-bg-base)",
        surface: {
          DEFAULT: "var(--citadel-bg-surface)",
          2: "var(--citadel-bg-surface-2)",
          3: "var(--citadel-bg-surface-3)",
        },
        gold: {
          100: "var(--citadel-gold-100)",
          200: "var(--citadel-gold-200)",
          300: "var(--citadel-gold-300)",
          400: "var(--citadel-gold-400)",
          500: "var(--citadel-gold-500)",
          600: "var(--citadel-gold-600)",
          700: "var(--citadel-gold-700)",
          800: "var(--citadel-gold-800)",
          DEFAULT: "var(--citadel-gold-500)",
        },
        ink: {
          DEFAULT: "var(--citadel-text-primary)",
          secondary: "var(--citadel-text-secondary)",
          muted: "var(--citadel-text-muted)",
          faint: "var(--citadel-text-faint)",
        },
        line: {
          DEFAULT: "var(--citadel-border-subtle)",
          strong: "var(--citadel-border-strong)",
          gold: "var(--citadel-border-gold)",
        },
        success: "var(--citadel-success)",
        warning: "var(--citadel-warning)",
        danger: "var(--citadel-danger)",
        info: "var(--citadel-info)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        ui: ["var(--font-ui)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      letterSpacing: {
        brand: "0.22em",
        wider2: "0.14em",
      },
      borderRadius: {
        card: "1rem",
        panel: "0.875rem",
        control: "0.625rem",
      },
      boxShadow: {
        card: "0 2px 16px rgba(0, 0, 0, 0.45)",
        gold: "0 0 24px rgba(212, 175, 55, 0.12)",
        "gold-strong": "0 0 32px rgba(212, 175, 55, 0.28)",
        inset: "inset 0 1px 0 rgba(255, 255, 255, 0.04)",
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, var(--citadel-gold-300) 0%, var(--citadel-gold-500) 50%, var(--citadel-gold-700) 100%)",
        "gold-line":
          "linear-gradient(90deg, transparent 0%, var(--citadel-gold-500) 50%, transparent 100%)",
        "surface-gradient":
          "linear-gradient(180deg, var(--citadel-bg-surface-2) 0%, var(--citadel-bg-surface) 100%)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "gold-pulse": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
        "gold-pulse": "gold-pulse 2.6s ease-in-out infinite",
        shimmer: "shimmer 2.4s linear infinite",
      },
      maxWidth: {
        content: "1400px",
      },
    },
  },
  plugins: [],
};

export default config;