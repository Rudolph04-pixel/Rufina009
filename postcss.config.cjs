// postcss.config.js
module.exports = {
  plugins: [
    require('@tailwindcss/nesting'), // esto permite anidar @layer y selectores
    require('tailwindcss'),
    require('autoprefixer'),
  ]
}
