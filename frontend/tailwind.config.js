/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",
        "primary-dark": "#4338CA",
        "primary-light": "#EEF2FF",

        secondary: "#8B5CF6",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",

        "text-primary": "#172033",
        "text-secondary": "#64748B",
        "text-muted": "#94A3B8",

        background: "#F8FAFC",
        surface: "#FFFFFF",

        border: "#E5E7EB",
        "border-light": "#EEF2F7",
      },

      boxShadow: {
        card: "0 4px 20px rgba(15, 23, 42, 0.05)",
      },
    },
  },

  plugins: [],
};