/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'text': '#000000',
        'background': '#f4f4f4',
        'primary': '#231651',
        'secondary': '#3C493F',
        'accent': '#4DCCBD',
       },
       
    },
  },
  plugins: [],
}

