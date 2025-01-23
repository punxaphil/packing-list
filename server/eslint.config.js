import eslintJavascript from '@eslint/js';
import eslintTypescript from 'typescript-eslint';
import pluginPrettier from 'eslint-plugin-prettier/recommended';

export default eslintTypescript.config(
  eslintJavascript.configs.recommended,
  ...eslintTypescript.configs.recommended,
  // Define custom rules
  {
    rules: {
      'prefer-const': 'error',
    },
  },
  pluginPrettier,
);
