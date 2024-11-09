/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: "#008170",
        yellow: "#faff00",
        lightcyan: "#dafffb",
        white: "#fff",
        darkslategray: {
          "100": "#005b4f",
          "200": "#303847",
        },
        palegoldenrod: "#f0f1ad",
        gray: "rgba(0, 0, 0, 0.3)",
      },
      spacing: {},
      fontFamily: {
        poppins: "sans-serif",
      },
      borderRadius: {
        "6xl-6": "25.6px",
        "smi-8": "12.8px",
        "5xs-2": "7.2px",
        "3xs-6": "9.6px",
        "8xs-8": "4.8px",
      },
      fontSize: {
        xs: "12px",
        "3xs-6": "9.6px",
        "6xs-4": "6.4px",
        "5xs": "8px",
        "mini-4": "14.4px",
        base: "16px",
        inherit: "inherit",
      },
    },
  },
  corePlugins: {
    preflight: true,
  },
  plugins: [],
};
