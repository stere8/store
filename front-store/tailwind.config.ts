import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    /** Resposive breakpoints  */
    screens: {
      xs: "320px",
      // => @media (min-width: 640px) { ... }

      tiny: "360px",
      // => @media (min-width: 640px) { ... }

      sm: "575px",
      // => @media (min-width: 640px) { ... }

      md: "768px",
      // => @media (min-width: 768px) { ... }

      lg: "1024px",
      // => @media (min-width: 1024px) { ... }

      xl: "1320px",
      // => @media (min-width: 1320px) { ... }
    },

    extend: {
  /** Brand 
		1. Colors
		2. Typography
		3. Responsive layout
	*/

      /** Colors 
		1.a Primary
		1.b Secondary
		1.c Success
		1.d Warning
		1.e Danger
	*/
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
          "50": "#EAF6FE",
          "100": "#D5EDFD",
          "200": "#ABDBFA",
          "300": "#81C9F8",
          "400": "#57B7F5",
          "500": "#2DA5F3",
          "600": "#2484C2",
          "700": "#1B6392",
          "800": "#124261",
          "900": "#092131",
        },

        gray: {
          "00": "#FFFFFF", //white color
          "50": "#F2F4F5",
          "100": "#E4E7E9",
          "200": "#C9CFD2",
          "300": "#ADB7BC",
          "400": "#929FA5",
          "500": "#77878F",
          "600": "#5F6C72",
          "700": "#475156",
          "800": "#303639",
          "900": "#191C1F",
        },

        success: {
          "50": "#EAF7E9",
          "100": "#D5F0D3",
          "200": "#ABE0A7",
          "300": "#81D17C",
          "400": "#57C150",
          "500": "#2DB224",
          "600": "#248E1D",
          "700": "#12470E",
          "800": "#12470E",
          "900": "#092407",
        },
        warning: {
          "50": "#FDFAE7",
          "100": "#FBF4CE",
          "200": "#F7E99E",
          "300": "#F3DE6D",
          "400": "#EFD33D",
          "500": "#EBC80C",
          "600": "#BCA00A",
          "700": "#8D7807",
          "800": "#5E5005",
          "900": "#2F2802",
        },
        danger: {
          "50": "#FDEEEE",
          "100": "#FCDEDE",
          "200": "#F8BCBC",
          "300": "#F59B9B",
          "400": "#F17979",
          "500": "#EE5858",
          "600": "#BE4646",
          "700": "#8F3535",
          "800": "#5F2323",
          "900": "#301212",
        },
      },

      white: "#FFFFFF",
      black: "#600",

      /** Typography 
		2.a Display
		2.b Heading
		2.c Label
		2.d Body
	*/
      fontSize: {
        //1.
        display1: [
          "64px",
          {
            lineHeight: "72px",
            letterSpacing: "0",
            fontWeight: "600",
          },
        ],
        display2: [
          "56px",
          {
            lineHeight: "64px",
            letterSpacing: "0",
            fontWeight: "600",
          },
        ],
        display3: [
          "48px",
          {
            lineHeight: "56px",
            letterSpacing: "0",
            fontWeight: "600",
          },
        ],
        display4: [
          "40px",
          {
            lineHeight: "48px",
            letterSpacing: "0",
            fontWeight: "600",
          },
        ],
        display5: [
          "36px",
          {
            lineHeight: "44px",
            letterSpacing: "0",
            fontWeight: "600",
          },
        ],

        //2.
        heading1: [
          "32px",
          {
            lineHeight: "40px",
            letterSpacing: "0",
            fontWeight: "600",
          },
        ],
        heading2: [
          "28px",
          {
            lineHeight: "32px",
            letterSpacing: "0",
            fontWeight: "600",
          },
        ],

        heading3: [
          "24px",
          {
            lineHeight: "32px",
            letterSpacing: "0",
            fontWeight: "600",
          },
        ],

        heading4: [
          "16px",
          {
            lineHeight: "56px",
            letterSpacing: "0",
            fontWeight: "700",
          },
        ],

        heading5: [
          "14px",
          {
            lineHeight: "48px",
            letterSpacing: "0",
            fontWeight: "700",
          },
        ],

        //3.
        label1: [
          "18x",
          {
            lineHeight: "28px",
            letterSpacing: "0",
            fontWeight: "500",
          },
        ],
        label2: [
          "16px",
          {
            lineHeight: "24px",
            letterSpacing: "0",
            fontWeight: "500",
          },
        ],
        label3: [
          "14px",
          {
            lineHeight: "20px",
            letterSpacing: "0",
            fontWeight: "500",
          },
        ],
        label4: [
          "12px",
          {
            lineHeight: "1.5rem",
            letterSpacing: "0",
            fontWeight: "700",
          },
        ],
        label5: [
          "11px",
          {
            lineHeight: "16px",
            letterSpacing: "0",
            fontWeight: "500",
          },
        ],

        //4.
        "body-xl-400": [
          "20px",
          {
            lineHeight: "28px",
            letterSpacing: "0",
            fontWeight: "400",
          },
        ],
        "body-xl-500": [
          "20px",
          {
            lineHeight: "28px",
            letterSpacing: "0",
            fontWeight: "500",
          },
        ],
        "body-xl-600": [
          "20px",
          {
            lineHeight: "28px",
            letterSpacing: "0",
            fontWeight: "600",
          },
        ],

        "body-l-400": [
          "18px",
          {
            lineHeight: "24px",
            letterSpacing: "0",
            fontWeight: "600",
          },
        ],
        "body-l-500": [
          "18px",
          {
            lineHeight: "24px",
            letterSpacing: "0",
            fontWeight: "600",
          },
        ],
        "body-l-600": [
          "18px",
          {
            lineHeight: "24px",
            letterSpacing: "0",
            fontWeight: "600",
          },
        ],

        "body-md-400": [
          "16px",
          {
            lineHeight: "24px",
            letterSpacing: "0",
            fontWeight: "400",
          },
        ],
        "body-md-500": [
          "16px",
          {
            lineHeight: "24px",
            letterSpacing: "0",
            fontWeight: "500",
          },
        ],
        "body-md-600": [
          "16px",
          {
            lineHeight: "24px",
            letterSpacing: "0",
            fontWeight: "600",
          },
        ],

        "body-sm-400": [
          "14px",
          {
            lineHeight: "20px",
            letterSpacing: "0",
            fontWeight: "400",
          },
        ],
        "body-sm-500": [
          "14px",
          {
            lineHeight: "20px",
            letterSpacing: "0",
            fontWeight: "500",
          },
        ],
        "body-sm-600": [
          "14px",
          {
            lineHeight: "20px",
            letterSpacing: "0",
            fontWeight: "600",
          },
        ],

        "body-tiny-400": [
          "12px",
          {
            lineHeight: "16px",
            letterSpacing: "0",
            fontWeight: "400",
          },
        ],
        "body-tiny-500": [
          "12px",
          {
            lineHeight: "16px",
            letterSpacing: "0",
            fontWeight: "500",
          },
        ],
        "body-tiny-600": [
          "12px",
          {
            lineHeight: "16px",
            letterSpacing: "0",
            fontWeight: "600",
          },
        ],

        "body-xs-400": [
          "11px",
          {
            lineHeight: "12px",
            letterSpacing: "0",
            fontWeight: "400",
          },
        ],
        "body-xs-500": [
          "11px",
          {
            lineHeight: "12px",
            letterSpacing: "0",
            fontWeight: "500",
          },
        ],
        "body-xs-600": [
          "11px",
          {
            lineHeight: "12px",
            letterSpacing: "0",
            fontWeight: "600",
          },
        ],
      },

      /** Responsive layout container */
      container: {
        center: true,
        padding: {
          DEFAULT: "0rem",
          xs: "0rem",
          sm: "0rem",
          md: "0rem",
          lg: "0rem",
          xl: "0rem",
        },
        screens: {
          xs: "320px",
          // => @media (min-width: 640px) { ... }

          tiny: "360px",
          // => @media (min-width: 640px) { ... }

          sm: "575px",
          // => @media (min-width: 640px) { ... }

          md: "768px",
          // => @media (min-width: 768px) { ... }

          lg: "1024px",
          // => @media (min-width: 1024px) { ... }

          xl: "1320px",
          // => @media (min-width: 1320px) { ... }
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
