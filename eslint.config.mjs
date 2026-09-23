import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import jupyterPlugin from '@jupyter/eslint-plugin';

export default defineConfig([
  {
    ignores: [
      'node_modules',
      'dist',
      'coverage',
      '**/*.js',
      '**/*.d.ts',
      '.venv',
      'jupyterlab_limit_output'
    ]
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  jupyterPlugin.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      jupyter: jupyterPlugin
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2015,
        ...globals.node
      },
      parserOptions: {
        project: ['tsconfig.json', 'tests/tsconfig.json'],
        sourceType: 'module'
      }
    },
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: {
            regex: '^I[A-Z]',
            match: true
          }
        }
      ],
      '@typescript-eslint/no-unused-vars': ['warn', { args: 'none' }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/quotes': [
        'error',
        'single',
        { avoidEscape: true, allowTemplateLiterals: false }
      ],
      curly: ['error', 'all'],
      eqeqeq: 'error',
      'jupyter/no-untranslated-string': 'off',
      'prefer-arrow-callback': 'error'
    }
  },
  {
    // Tests are linted too; chai assertions like `expect(x).to.exist` are
    // bare member expressions by design.
    files: ['tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off'
    }
  },
  prettierRecommended
]);
