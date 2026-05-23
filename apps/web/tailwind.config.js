/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#07111b",
        panel: "#0d1d2d",
        panelSoft: "#12283d",
        line: "#294760",
        text: "#e6f1fb",
        muted: "#9eb6cb",
        accent: "#28d7a4",
        cyan: "#22b8f0"
      },
      boxShadow: {
        glow: "0 20px 70px rgba(8, 24, 36, 0.45)"
      }
    }
  },
  plugins: []
};
