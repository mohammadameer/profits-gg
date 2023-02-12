/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
    project: ["./apps/**/tsconfig.json", "./packages/**/tsconfig.json"],
  },
  settings: {
    next: {
      rootDir: ["./apps/*/", "./packages/*/"],
    },
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "next",
    "turbo",
  ],
  rules: {
    "@typescript-eslint/consistent-type-imports": "warn",
    "@typescript-eslint/ban-ts-comment": "off",
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:@calcom/eslint/recommended",
      ],
      plugins: ["@typescript-eslint", "@calcom/eslint"],
      parser: "@typescript-eslint/parser",
    },
  ],
};
