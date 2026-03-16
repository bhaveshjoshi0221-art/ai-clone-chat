import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        void:    "#080810",
        surface: "#0f0f1a",
        card:    "#14141f",
        border:  "#1e1e30",
        muted:   "#3a3a55",
        dim:     "#6b6b90",
        soft:    "#a0a0c0",
        light:   "#d4d4f0",
        // Accent
        violet: {
          DEFAULT: "#7c5cfc",
          light:   "#a688fd",
          glow:    "rgba(124,92,252,0.25)",
        },
        cyan: {
          DEFAULT: "#2dd4bf",
          light:   "#67e8f9",
          glow:    "rgba(45,212,191,0.2)",
        },
        // Clone accent (different from user)
        clone: {
          DEFAULT: "#f472b6",
          glow:    "rgba(244,114,182,0.2)",
        },
      },
      backgroundImage: {
        "bubble-me":    "linear-gradient(135deg, #7c5cfc 0%, #5b3fe8 100%)",
        "bubble-clone": "linear-gradient(135deg, #f472b6 0%, #db2777 100%)",
        "noise":        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        "violet-glow": "0 0 20px rgba(124,92,252,0.35), 0 0 60px rgba(124,92,252,0.1)",
        "cyan-glow":   "0 0 20px rgba(45,212,191,0.35), 0 0 60px rgba(45,212,191,0.1)",
        "clone-glow":  "0 0 20px rgba(244,114,182,0.35)",
        "input-focus": "0 0 0 2px rgba(124,92,252,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 80%, 100%": { transform: "scale(0.6)", opacity: "0.4" },
          "40%":           { transform: "scale(1)",   opacity: "1"   },
        },
        "slide-up": {
          from: { transform: "translateY(8px)", opacity: "0" },
          to:   { transform: "translateY(0)",   opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
      },
      animation: {
        "pulse-dot":   "pulse-dot 1.4s ease-in-out infinite",
        "pulse-dot-2": "pulse-dot 1.4s ease-in-out 0.2s infinite",
        "pulse-dot-3": "pulse-dot 1.4s ease-in-out 0.4s infinite",
        "slide-up":    "slide-up 0.2s ease-out",
        "fade-in":     "fade-in 0.15s ease-out",
        "shimmer":     "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
