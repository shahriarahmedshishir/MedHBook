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
    },
    // Use defaultTheme for all other settings
    ...defaultTheme,
  },
};
