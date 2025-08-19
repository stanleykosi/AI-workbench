/**
 * @description
 * This configuration file sets up PostCSS for the Next.js application.
 * It integrates Tailwind CSS and Autoprefixer into the build process.
 *
 * Key features:
 * - `tailwindcss`: Processes Tailwind CSS directives and classes.
 * - `autoprefixer`: Adds vendor prefixes to CSS rules for cross-browser compatibility.
 */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
