/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "vf-bg": "#050505",
        "vf-panel": "#0a0a0a",
        "vf-border": "#262626",
        "vf-lime": "#ccff00",
        "vf-cyan": "#00f0ff",
        "vf-ai": "#d946ef",
        "vf-warn": "#f59e0b",
        "vf-dim": "#737373",
      },
      fontFamily: {
        sans: ['"Space Grotesk"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      animation: {
        blink: "blink 0.8s infinite",
        "pulse-purple": "pulse-purple 2s infinite",
        "pulse-lime": "pulse-lime 2s infinite",
        "fade-in": "fadeIn 0.3s ease-out forwards",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "pulse-purple": {
          "0%": { boxShadow: "0 0 0 0 rgba(217, 70, 239, 0.4)" },
          "70%": { boxShadow: "0 0 0 10px rgba(217, 70, 239, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(217, 70, 239, 0)" },
        },
        "pulse-lime": {
          "0%": { boxShadow: "0 0 0 0 rgba(204, 255, 0, 0.7)" },
          "70%": { boxShadow: "0 0 0 6px rgba(204, 255, 0, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(204, 255, 0, 0)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
