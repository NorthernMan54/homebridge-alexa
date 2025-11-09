/** @type {import('eslint').FlatConfig[]} */
import pluginJs from "@eslint/js";
import pluginJest from "eslint-plugin-jest";
import globals from "globals";


export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs", // This is necessary to parse imports/exports
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.jest, // Add Jest globals
        ...globals.node, // Add Node.js globals
      },
    },
    // Add any other specific rules here
  },
  pluginJs.configs.recommended,
  {
    plugins: {
      jest: pluginJest,
    },
    rules: {
      ...pluginJest.configs.recommended.rules,
      "no-unused-vars": "warn", // Change no-unused-vars to a warning
      "no-undef": "warn", // Change undefined variable errors to warnings
    },
  },
  {
    // Exclude test, tools, and lib directories from linting
    ignores: [
      "test/**/*",
      "tools/**/*.js",
      "coverage/**/*",
      "node_modules/**/*",
      "*.notest.js"
    ],
  }
];
