/**
 * Configuração ESLint corporativa para React 18 + Vite
 * 
 * Padrões utilizados:
 * - Airbnb base (com adaptações)
 * - Regras específicas para React 18
 * - Suporte a aliases (@/)
 * - Preparado para testes com Jest/Vitest
 */

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'prettier', // Desativa regras conflitantes com Prettier
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks', 'jsx-a11y', 'import'],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      alias: {
        map: [
          ['@', './src'],
          ['@components', './src/shared/components'],
          ['@features', './src/features'],
          ['@pages', './src/pages'],
          ['@hooks', './src/shared/hooks'],
          ['@utils', './src/shared/utils'],
          ['@styles', './src/styles'],
          ['@core', './src/core'],
          ['@data', './src/data'],
          ['@assets', './src/assets'],
        ],
        extensions: ['.js', '.jsx', '.json', '.css'],
      },
    },
  },
  rules: {
    // ========================================================================
    // REGRAS GERAIS DE QUALIDADE
    // ========================================================================
    'no-console': ['warn', { allow: ['warn', 'error'] }], // Permite apenas console.warn/error
    'no-debugger': 'error',
    'no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    'no-undef': 'error',
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'brace-style': ['error', '1tbs', { allowSingleLine: false }],
    'comma-dangle': ['error', 'always-multiline'],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'semi': ['error', 'always'],
    'indent': ['error', 2, { SwitchCase: 1 }],
    'max-len': ['warn', { 
      code: 100, 
      ignoreUrls: true, 
      ignoreStrings: true, 
      ignoreTemplateLiterals: true,
      ignoreComments: true,
    }],

    // ========================================================================
    // REGRAS DO REACT
    // ========================================================================
    'react/prop-types': 'error', // Obrigatório para documentação
    'react/display-name': 'error',
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-key': ['error', { checkFragmentShorthand: true }],
    'react/self-closing-comp': 'error',
    'react/jsx-curly-brace-presence': ['error', { 
      props: 'never', 
      children: 'never' 
    }],
    'react/function-component-definition': ['error', {
      namedComponents: 'arrow-function',
      unnamedComponents: 'arrow-function',
    }],

    // ========================================================================
    // REGRAS DE HOOKS
    // ========================================================================
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // ========================================================================
    // REGRAS DE ACESSIBILIDADE (WCAG)
    // ========================================================================
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-has-content': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-role': 'error',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
    'jsx-a11y/label-has-associated-control': ['error', {
      assert: 'htmlFor',
    }],

    // ========================================================================
    // REGRAS DE IMPORTS (ORGANIZAÇÃO)
    // ========================================================================
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
          'type',
        ],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
          {
            pattern: '@/**',
            group: 'internal',
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/no-duplicates': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-unresolved': 'error',
    'import/no-named-as-default': 'off',
  },
};