/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    

  ],
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],

  
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        grey: '#BFBFBF',
        blue: '#4C9DFC',
        lightblue: '#4C9DFC',
        green: '#10B981'
      },
    },
  },
  plugins: [],
};


