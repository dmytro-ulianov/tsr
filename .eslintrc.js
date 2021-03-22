module.exports = {
  extends: [
    'prettier',
    'plugin:import/errors',
    'plugin:import/typescript',
    'plugin:import/warnings',
  ],

  plugins: ['sonarjs', 'import'],

  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.d.ts', '.ts', '.tsx'],
        moduleDirectory: ['node_modules', '.'],
      },
    },
  },

  rules: {
    /* default overrides -------------------------------- */
    'guard-for-in': 2,
    'max-params': [2, 3],
    'no-alert': 1,
    'no-console': [
      1,
      {
        allow: [
          'debug',
          'error',
          'group',
          'groupCollapsed',
          'groupEnd',
          'info',
          'table',
          'warn',
        ],
      },
    ],
    'no-debugger': 1,
    'no-redeclare': 0,
    'no-unreachable': 1,
    'no-var': 2,
    'sort-imports': [2, { ignoreCase: true, ignoreDeclarationSort: true }],
    'use-isnan': 2,
    eqeqeq: [2, 'smart'],
    /* default overrides -------------------------------- */

    /* import overrides --------------------------------- */
    'import/named': 0, // throws with styled-components/macro
    'import/newline-after-import': [2, { count: 1 }],
    'import/no-absolute-path': 2,
    'import/no-cycle': 0, // throws on type-only imports
    'import/no-deprecated': 1,
    'import/no-extraneous-dependencies': 0,
    'import/no-internal-modules': 0,
    'import/no-named-as-default': 2,
    'import/order': [
      2,
      {
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
        groups: [
          ['external', 'builtin'],
          'internal',
          ['parent', 'sibling', 'index'],
        ],
      },
    ],
    /* import overrides --------------------------------- */

    /* sonar overrides -------------------------------- */
    'sonarjs/no-duplicate-string': [1, 3],
    'sonarjs/no-identical-functions': 1,
    'sonarjs/no-inverted-boolean-check': 2,
    /* sonar overrides -------------------------------- */

    /* react-app rules -------------------------------- */
    // TypeScript's `noFallthroughCasesInSwitch` option is more robust (#6906)
    'default-case': 'off',
    // 'tsc' already handles this (https://github.com/typescript-eslint/typescript-eslint/issues/291)
    'no-dupe-class-members': 'off',
    // 'tsc' already handles this (https://github.com/typescript-eslint/typescript-eslint/issues/477)
    'no-undef': 'off', // Add TypeScript specific rules (and turn off ESLint equivalents)
    '@typescript-eslint/consistent-type-assertions': 'warn',
    'no-array-constructor': 'off',
    '@typescript-eslint/no-array-constructor': 'warn',
    'no-redeclare': 'off',
    '@typescript-eslint/no-redeclare': 'warn',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': [
      'warn',
      { functions: false, classes: false, variables: false, typedefs: false },
    ],
    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': [
      'error',
      {
        allowShortCircuit: true,
        allowTernary: true,
        allowTaggedTemplates: true,
      },
    ],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { args: 'none', ignoreRestSiblings: true },
    ],
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': 'warn',
    /* react-app rules -------------------------------- */
  },

  overrides: [
    {
      files: ['**/*.ts?(x)'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/adjacent-overload-signatures': 2,
        '@typescript-eslint/array-type': [2, { default: 'array-simple' }],
        '@typescript-eslint/ban-types': 1,
        '@typescript-eslint/consistent-type-assertions': 2,
        '@typescript-eslint/consistent-type-definitions': 0,
        '@typescript-eslint/explicit-module-boundary-types': 0,
        '@typescript-eslint/member-ordering': 0, // no auto-fix
        '@typescript-eslint/naming-convention': 0,
        '@typescript-eslint/no-empty-function': 0,
        '@typescript-eslint/no-empty-interface': 0,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/no-misused-new': 2,
        '@typescript-eslint/no-unused-expressions': 2,
        '@typescript-eslint/no-unused-vars': 1,
        '@typescript-eslint/prefer-function-type': 2,
        '@typescript-eslint/unified-signatures': 2,
      },
    },

    {
      files: ['**/*.test.ts?(x)'],
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
      rules: {
        '@typescript-eslint/no-var-requires': 1,
        'jest/expect-expect': 1,
        'jest/no-mocks-import': 1,
        'prefer-const': 1,
        'sonarjs/no-duplicate-string': 0,
        'sonarjs/no-identical-functions': 0,
      },
    },
  ],
}
