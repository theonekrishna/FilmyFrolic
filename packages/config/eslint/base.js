import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    rules: {
      "no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^[A-Z_]",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "no-console": "off",
      "no-undef": "warn",
      "no-empty": "warn",
      "no-extra-boolean-cast": "warn",
      "no-useless-catch": "warn",
    },
  },
];
