module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: ['react'],
  rules: {
    // React
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'warn',
    'react/jsx-uses-react': 'off',
    
    // Geral
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    
    // ES6+
    'prefer-const': 'error',
    'no-var': 'error',
    
    // Indentação e espaçamento
    'indent': ['error', 2, { SwitchCase: 1 }],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never']
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};