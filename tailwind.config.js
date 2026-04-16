import defaultTheme from "tailwindcss/defaultTheme";

export default {
  theme: {
    extend: {
      colors: {
        // Override all palette colors with legacy hex/rgb values
        primary: "#0ea5e9",
        secondary: "#64748b",
        success: "#22c55e",
        warning: "#eab308",
        danger: "#ef4444",
        info: "#38bdf8",
        // Add more as needed
      },
      animation: {
        slideInFromLeft: "slideInFromLeft 0.8s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        fadeIn: "fadeIn 0.6s ease-out forwards",
        slideInLeft: "slideInLeft 0.8s ease-out forwards",
        slideInRight: "slideInRight 0.8s ease-out forwards",
        scaleIn: "scaleIn 0.5s ease-out forwards",
      },
      keyframes: {
        slideInFromLeft: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-30px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(30px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
    // Use defaultTheme for all other settings
    ...defaultTheme,
  },
};
