export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Legacy palette — swept in Step 5 once v2.1 components ship
        noir: '#1a1a1a',
        champagne: '#f7e7ce',
        rosegold: '#b76e79',
        ivory: '#fffff0',
        // v2.1 palette — see docs/design/v2.1/decisions.md (#6). White uses Tailwind default.
        cream: '#F5F1EA',
        ink: '#1A1A1A',
        clay: '#9C5B4A',
      },
    },
  },
  plugins: [],
}
