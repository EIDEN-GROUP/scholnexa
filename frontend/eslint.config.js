import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", ".output", ".vinxi", "backend", "src/routeTree.gen.ts"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "server-only",
              message:
                "TanStack Start does not use the Next.js `server-only` package. Rename the module to `*.server.ts` or mark it with `@tanstack/react-start/server-only`.",
            },
          ],
        },
      ],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    // Transplanted ISTEPM dashboard code. It was written against a more lenient
    // config; downgrade the stylistic/`any` rules to warnings here so `lint`
    // stays meaningful for the landing code while the dashboard is polished
    // page-by-page.
    files: [
      "**/routes/dashboard*",
      "**/routes/login.tsx",
      "**/components/dash-*",
      "**/components/ai-chat.tsx",
      "**/components/brand-loader.tsx",
      "**/components/calendar-views.tsx",
      "**/components/import-*",
      "**/components/affectation-stages-dialog.tsx",
      "**/components/structures-accueil-dialog.tsx",
      "**/components/student-fields.tsx",
      "**/components/support-*",
      "**/components/table-pagination.tsx",
      "**/components/ui/**",
      "**/lib/istpm-*",
      "**/lib/dash-*",
      "**/lib/dashboard-i18n.tsx",
      "**/lib/auth.tsx",
      "**/lib/api.ts",
      "**/lib/branded-doc.ts",
      "**/lib/stamp.ts",
      "**/lib/doc-store.ts",
      "**/lib/database-types.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "no-empty": "warn",
      "no-useless-escape": "warn",
      "no-irregular-whitespace": "warn",
      "prefer-const": "warn",
      "react-hooks/exhaustive-deps": "warn",
      // Pre-existing in the ISTEPM code, shipped in production there. Downgraded
      // to a warning until the dashboard gets its page-by-page polish pass.
      "react-hooks/rules-of-hooks": "warn",
    },
  },
  eslintPluginPrettier,
);
