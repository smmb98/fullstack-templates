/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("@fullstack-templates/ui/tailwind-preset")],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      maxWidth: {
        prose: "68ch",
      },
    },
  },
  plugins: [],
};
