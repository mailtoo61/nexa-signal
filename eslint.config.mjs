import js from '@eslint/js';
import parser from '@typescript-eslint/parser';
import plugin from '@typescript-eslint/eslint-plugin';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx,mts}'],
    plugins: { '@typescript-eslint': plugin },
    languageOptions: {
      parser,
      parserOptions: {
        project: false,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-undef': 'off',
      'no-unused-vars': 'off',
    },
    ignores: ['node_modules/**', 'dist/**', 'build/**', '.expo/**'],
  },
];
