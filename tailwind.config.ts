// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // warna utama UI
        brand: {
          blue: "#43C4FF",   // background utama
          yellow: "#FFEC40", // button penting
        },
      },
      boxShadow: {
        // shadow kotak kartun
        cartoon: "5px 5px 0px rgba(0,0,0,1)",
        cartoonTwo: "2px 2px 0px #000000",
      },
      borderRadius: {
        xl2: "1.5rem", // buat card besar
      },
      fontFamily: {
      sans: ['var(--font-satoshi)', 'ui-sans-serif', 'system-ui'],
    },
    },
  },
  plugins: [],
};
export default config;
