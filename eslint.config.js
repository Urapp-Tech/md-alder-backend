import pkgConfig from '@eslint/js';
import { flatConfigs } from 'eslint-plugin-import';
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import pkg from 'eslint-plugin-promise';
import pkgGlobal from 'globals';
const { node } = pkgGlobal;

const { configs } = pkgConfig;
const { configs: _configs } = pkg;

export default [
  {
    languageOptions: {
      globals: node,
      ecmaVersion: 'latest',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
  configs.recommended,
  flatConfigs.recommended,
  _configs['flat/recommended'],
  pluginPrettierRecommended,
  {
    rules: {
      'no-console': 'warn',
      camelcase: 'error',
      'import/no-unresolved': 'off',
      'import/named': 'off',
      'import/namespace': 'off',
      'import/no-named-as-default': 'off',
      'import/default': 'off',
      'import/no-named-as-default-member': 'off',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
];
