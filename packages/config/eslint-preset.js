/**
 * @description
 * This file contains the shared ESLint configuration for the AI Workbench monorepo.
 * It ensures consistent code style and quality across all applications and packages.
 *
 * Key features:
 * - Extends from `next/core-web-vitals` for Next.js best practices.
 * - Integrates `prettier` to avoid style conflicts.
 * - Uses `@vercel/style-guide` for a robust set of rules.
 * - Sets global variables for React to avoid undefined errors.
 *
 * @notes
 * - Rules like `import/no-default-export` are turned off to align with Next.js conventions.
 * - This preset is intended to be used in the `.eslintrc.js` file of each app/package.
 */
module.exports = {
  extends: [
    "next/core-web-vitals",
    "prettier",
    "@vercel/style-guide/eslint/next",
  ],
  globals: {
    React: true,
    JSX: true,
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  ignorePatterns: ["node_modules/", ".next/", "dist/", ".turbo/"],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "react/jsx-key": "off",
    "import/no-default-export": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "eslint-comments/require-description": "off",
    "react/function-component-definition": "off",
  },
};
