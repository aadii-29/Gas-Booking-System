module.exports = {
    env: {
      browser: true,
      es2021: true,
      node: true, // Enable Node.js globals (e.g., module)
    },
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:@typescript-eslint/recommended', // If using TypeScript
    ],
    parserOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
    },
    plugins: ['react', '@typescript-eslint'], // If using TypeScript
    rules: {
      'no-undef': 'error',
      // Add custom rules as needed
    },
    overrides: [
      {
        files: ['*.cjs', 'postcss.config.js'], // Apply to CommonJS files
        env: {
          node: true,
          commonjs: true, // Explicitly allow CommonJS
        },
        parserOptions: {
          sourceType: 'script', // Treat as CommonJS
        },
      },
    ],
    settings: {
      react: {
        version: 'detect',
      },
    },
  };