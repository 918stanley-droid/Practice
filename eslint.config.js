const globals = require("globals");
const pluginJs = require("@eslint/js");

module.exports = [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      ecmaVersion: 12,
      sourceType: "module",
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      "no-unused-vars": ["warn"],
      "no-console": "off",
    },
  },
  {
    files: ["**/*.test.js", "jest.setup.js"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
  {
    files: ["e2e/**/*.js", "playwright.config.js"],
    languageOptions: {
      globals: {
        test: true,
        expect: true,
        page: true,
      },
    },
  },
];
