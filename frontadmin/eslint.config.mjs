import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

export default [
  {
    ignores: [
      ".next/**",
      "coverage/**",
      "legacy/**",
      "node_modules/**",
      "components/custom/**",
      "components/ui/**",
      "hooks/**",
      "lib/helpers.ts",
      "lib/regex.ts",
      "lib/api-client.ts",
      "lib/api-helpers.ts",
      "lib/dbConnect.ts",
      "lib/get-stripejs.ts",
      "lib/mergeOpenGraph.ts",
      "lib/roles.ts",
      "tailwind.config.ts",
      "postcss.config.mjs",
      "next-env.d.ts",
    ],
  },
  {
    files: [
      "app/**/*.{ts,tsx}",
      "components/frontadmin/**/*.{ts,tsx}",
      "lib/admin-actions.ts",
      "lib/admin-gaps.ts",
      "lib/admin-ui.ts",
      "lib/estore-api.ts",
      "middleware.ts",
    ],
    ignores: [
      "app/admin/stores/**",
    ],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/prop-types": "off",
    },
  },
];
