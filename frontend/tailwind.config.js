/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#0f172a",
          approved: "#059669",
          rejected: "#f43f5e"
        }
      },
      fontFamily: {
        sans: ["Segoe UI", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        panel: "0 20px 60px rgba(15, 23, 42, 0.25)"
      }
    }
  },
  plugins: []
};
