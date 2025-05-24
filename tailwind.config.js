// TODO: Add Tailwind config here
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}", // just in case you're using /app/
    "./data/**/*.{js,json}",       // to scan vendor data if needed
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
