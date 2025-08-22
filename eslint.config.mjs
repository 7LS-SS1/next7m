// eslint.config.mjs
import next from "eslint-config-next";
import prettier from "eslint-config-prettier";

export default [
  ...next(),
  {
    rules: {
      "no-console": ["warn", { allow: ["error", "warn"] }],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
  prettier,
];
