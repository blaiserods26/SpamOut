import type { Config } from "tailwindcss";
const flowbite = require("flowbite-react/tailwind");
//import { Flowbite } from "flowbite-react";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
    flowbite.content(),
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        
      },
    },
  },
  darkMode: "class",
  plugins: [flowbite.plugin()],
} satisfies Config;
