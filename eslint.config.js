import js from '@eslint/js'
import globals from 'globals'

export default [
  js.configs.recommended,
  {
    files: ['packages/core/loadgo.js', 'packages/core/loadgo-vanilla.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        jQuery: 'readonly',
      },
    },
  },
  {
    files: ['examples/javascript/main.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        Loadgo: 'readonly',
      },
    },
    rules: {
      // interval vars and playDemo are used in HTML onclick handlers — ESLint can't see those
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['examples/jquery/main.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        jQuery: 'readonly',
        $: 'readonly',
      },
    },
    rules: {
      // interval vars and playDemo are used in HTML onclick handlers — ESLint can't see those
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: globals.node,
    },
  },
  {
    files: ['packages/core/tests/**/*.test.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
]
