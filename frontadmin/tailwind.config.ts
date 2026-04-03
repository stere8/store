import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

//Bento grid integration
const svgToDataUri = require("mini-svg-data-uri");
const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // ----------- Here we add custom style --------//
    /** 1- Responsive design */
    container: {
      center: true,
      padding: {
        DEFAULT: "0",
        sm: "0",
        md: "0",
        lg: "0",
        xl: "0",
        "2xl": "2rem",
        "3xl": "2rem",
        "4xl": "2rem",
      },
      screens: {
        xs: "360px",
        sm: "575px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1440px",
        "3xl": "1680px",
        "4xl": "1920px",
      },
    },
    colors: {
      primary: {
        "50": "#FFF3EB",
        "100": "#FFE7D6",
        "200": "#FFCEAD",
        "300": "#FFB685",
        "400": "#FF9D5C",
        "500": "#FA8232",
        "600": "#DE732D",
        "700": "#99501F",
        "800": "#663514",
        "900": "#331B0A",
      },
      secondary: {
        "50": "#f0f8ff",
        "100": "#e0f0fe",
        "200": "#bae2fd",
        "300": "#7ccbfd",
        "400": "#37b1f9",
        "500": "#0d97ea",
        "600": "#016fb9",
        "700": "#025fa2",
        "800": "#065186",
        "900": "#0c446e",
      },
      white: "#FFFFFF",
      black: colors.black,
      slate: colors.slate,
      pink: colors.pink,
      gray: colors.gray,
      indigo: colors.indigo,

      neutral: colors.neutral,
      red: colors.red,
      green: colors.green,
      blue: colors.blue,
      transparent: "transparent",

      heading: "#979798",
      paragraphe: colors.gray[600],
      label: colors.black,
      placeholder: colors.gray[400],
      body: colors.slate[700],

      table: colors.gray[900],
      background: colors.gray[100],

      border: colors.gray[200],
      "inputs-border": colors.gray[300],
      icon: colors.gray[500],
    },

    /** 3- Typography  */
    fontWeight: {
      thin: "100",
      hairline: "100",
      extralight: "200",
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
      black: "900",
    },

    fontSize: {
      // Default font size
      sm: "0.8rem",
      base: "1rem",
      xl: "1.25rem",
      "2xl": "1.563rem",
      "3xl": "1.953rem",
      "4xl": "2.441rem",
      "5xl": "3.052rem",

      //custom font size
      /** Root font size  = 16px how can be 64px  */
      h1: [
        "5rem",
        {
          lineHeight: "5rem",
          letterSpacing: "0.0375em",
          fontWeight: "700",
        },
      ],
      h2: [
        "3rem",
        {
          lineHeight: "2rem",
          letterSpacing: "0.035em",
          fontWeight: "700",
        },
      ],
      h3: [
        "2.5rem",
        {
          lineHeight: "3.5rem",
          letterSpacing: "0.05em",
          fontWeight: "700",
        },
      ],
      h4: [
        "2rem",
        {
          lineHeight: "2.75rem",
          letterSpacing: "0em",
          fontWeight: "700",
        },
      ],
      h5: [
        "1.5rem",
        {
          lineHeight: "2.5rem",
          letterSpacing: "0em",
          fontWeight: "600",
        },
      ],

      p: [
        "0.875rem",
        {
          lineHeight: "1.5rem",
          letterSpacing: "0rem",
          fontWeight: "400",
        },
      ],
      body: [
        "1rem",
        {
          lineHeight: "1.5rem",
          letterSpacing: "0rem",
          fontWeight: "400",
        },
      ],

      span: [
        "0.75rem",
        {
          lineHeight: "1.5rem",
          letterSpacing: "0rem",
          fontWeight: "400",
        },
      ],
    },

    extend: {
      boxShadow: {
        button:
          "rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "heart-beating": {
          "0%, 10%": { transform: "scale(1)" },
          "10%, 100%": { transform: "scale(1.01)" },
          "100%, 0%": { transform: "scale(1)" },
        },
        radius: {
          "0%": {
            borderRadius: "0px",
          },
          "10%, 30": {
            borderRadius: "10px",
            transition: "1s ease",
          },
          "30%, 100%": {
            borderRadius: "40px",
            boxShadow:
              "rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;",
          },
          "100%, 70%": {
            borderRadius: "20px",
          },
          "70%, 30%": {
            borderRadius: "0px",
            boxShadow:
              " rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px",
          },
          "30%, 0%": {
            borderRadius: "100px",
            background: "#e15381",
            transition: "1s ease",
            boxShadow:
              " rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "heart-beating": "heart-beating 2s infinite ease-out",
        radius: "radius 3s infinite ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    addVariablesForColors,
    function ({ matchUtilities, theme }: any) {
      matchUtilities(
        {
          "bg-grid": (value: any) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`
            )}")`,
          }),
          "bg-grid-small": (value: any) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="8" height="8" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`
            )}")`,
          }),
          "bg-dot": (value: any) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="1.6257413380501518"></circle></svg>`
            )}")`,
          }),
        },
        { values: flattenColorPalette(theme("backgroundColor")), type: "color" }
      );
    },
  ],
};

//bento grid
function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}
export default config;
