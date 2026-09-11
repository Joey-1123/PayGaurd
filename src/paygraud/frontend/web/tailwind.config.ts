import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        screen: "#000000",
        base: "#0A0A0A",
        card: "#0E0E0E",
        line: "rgba(255, 255, 255, 0.12)",
        soft: "#8E8E93",
        faint: "#555555",
        ink: "#FFFFFF",
        safe: "#00FF66",
        warn: "#FFB800",
        danger: "#FF2A2A",
        pending: "#888888",
      },
      borderRadius: {
        card: "14px",
        panel: "20px",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;