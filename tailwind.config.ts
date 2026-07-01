import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        void: {
          950: "#03050a",
          900: "#050914",
          800: "#080f1f",
          700: "#0c162b",
          600: "#111f3d",
        },
        cyan: {
          glow: "#3ee6ff",
        },
        navy: {
          DEFAULT: "#0a1440",
          light: "#132257",
        },
        accent: {
          blue: "#2f6bff",
          cyan: "#22d3ee",
          amber: "#ffb347",
        },
      },
      fontFamily: {
        display: ["var(--font-orbitron)", "sans-serif"],
        body: ["var(--font-sora)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "radar-grid":
          "linear-gradient(rgba(62,230,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(62,230,255,0.08) 1px, transparent 1px)",
        "hud-radial":
          "radial-gradient(circle at 50% 50%, rgba(62,230,255,0.15), transparent 60%)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(62,230,255,0.35), 0 0 60px rgba(47,107,255,0.15)",
        "glow-sm": "0 0 10px rgba(62,230,255,0.4)",
      },
      animation: {
        "radar-sweep": "radar-sweep 6s linear infinite",
        "pulse-slow": "pulse-slow 4s ease-in-out infinite",
        scan: "scan 3s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        "radar-sweep": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
