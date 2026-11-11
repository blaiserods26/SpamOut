import type { Config } from "tailwindcss";
const flowbite = require("flowbite-react/tailwind");

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
    flowbite.content(),
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cyber: {
          darker: "#060a12",
          dark: "#0b1120",
          card: "#0f172a",
          surface: "#1e293b",
          border: "#1e293b",
          cyan: "#06b6d4",
          blue: "#3b82f6",
          emerald: "#10b981",
          rose: "#f43f5e",
          amber: "#f59e0b",
        },
      },
      backgroundImage: {
        'cyber-gradient': 'radial-gradient(ellipse at top, rgba(6, 182, 212, 0.15) 0%, rgba(15, 23, 42, 0) 70%)',
        'grid-pattern': "radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
        'glow-rose': '0 0 25px -5px rgba(244, 63, 94, 0.35)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
      },
    },
  },
  plugins: [flowbite.plugin()],
} satisfies Config;
