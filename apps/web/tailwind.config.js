/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // FotoOwl brand palette
        amber: {
          50: "#FEF9EE",
          100: "#FEF3E2",
          200: "#FDE4B4",
          300: "#FCCF7F",
          400: "#FBB13C", // primary
          500: "#F5A623",
          600: "#E89A0C",
          700: "#B87708",
          800: "#8A5906",
          900: "#5C3B04",
        },
        cream: {
          50: "#FDFDFB",
          100: "#FAFAF7", // main bg
          200: "#F5F5F0",
          300: "#EDEDE6",
        },
        ink: {
          50: "#F8F9FB",
          100: "#F1F3F7",
          200: "#E5E7EB", // subtle border
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280", // muted
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#0F1729", // primary text
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "card-hover":
          "0 10px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.06)",
        "amber-glow": "0 0 0 3px rgb(251 177 60 / 0.15)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
