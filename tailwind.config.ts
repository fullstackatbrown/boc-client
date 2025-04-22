import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        funky: ['Chelsea Market'],
        helvetica: ['Helvetica Neue', 'Helvetica'],
        montserrat: ['Montserrat', 'sans-serif'],
        sixtyfour: ['Sixtyfour Convergence', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        boc_green: '#5B913A',
        boc_darkgreen: "#678F44",
        boc_darkbrown: "#461300",
        boc_medbrown: "#A2826D",
        boc_lightbrown: "#FDE6BB",
        boc_yellow: "#EEC543",
        boc_slate: "#425863"
      },
      fontSize: {
        'boc_logo_size': '75px', // Customize as needed
      },
    },
  },
  plugins: [],
};
export default config;
