import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import eslintConfigPrettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  { linterOptions: { reportUnusedDisableDirectives: false } },
  ...nextVitals,
  { rules: eslintConfigPrettier.rules },
  {
    rules: {
      quotes: ["error", "double", { avoidEscape: true }],
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
