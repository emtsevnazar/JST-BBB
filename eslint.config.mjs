import globals from 'globals';
import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['frontend/**/*.js', '!frontend/js/ws-manager.js', '!frontend/js/pwa.js', '!frontend/js/help-content.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        ...globals.browser,
        showToast: 'readonly',
        ti: 'readonly',
        t: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_' }],
      'no-undef': 'warn',
      'no-console': 'off',
      'no-var': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'prefer-const': 'warn',
      'prefer-arrow-callback': 'warn',
      'prefer-template': 'warn'
    }
  },
  {
    files: ['frontend/js/ws-manager.js', 'frontend/js/pwa.js', 'frontend/js/help-content.js'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: { ...globals.browser } }
  },
  {
    files: ['*.js', 'comprehensive-test.js', 'dt-test.js', 'smoke-test.js'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'script', globals: { ...globals.node } }
  },
  { ignores: ['frontend/*.bak*', 'frontend/*.min.js'] }
];
