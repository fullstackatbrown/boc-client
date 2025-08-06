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
        standard: ['Gabarito', 'Helvetica Neue', 'Helvetica'],
        funky: ['Chelsea Market', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      colors: {
        background: "#FFF2DA",
        foreground: "#000000",
        boc_green: '#5B913A',
        boc_darkgreen: "#678F44",
        boc_lightgreen: "#DEDEAE",
        boc_darkbrown: "#461300",
        boc_medbrown: "#A2826D",
        boc_lightbrown: "#FDE6BB",
        boc_yellow: "#FFE8B6",
        boc_slate: "#425863",
        boc_earthyorange: "#fece99" //"#FF8A2A"
      },
      fontSize: {
        'boc_logo_size': '75px', // Customize as needed
      },
    },
  },
  plugins: [],
};
export default config;
