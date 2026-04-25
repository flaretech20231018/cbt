import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname })

export default tseslint.config(
  { ignores: ['.next/**', 'node_modules/**'] },
  // Layer 1: Next.js core-web-vitals + React
  // Layer 2: Next.js typescript (typescript-eslint/recommended)
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  // Layer 3: typescript-eslint strict (recommended → strict へ引き上げ)
  ...tseslint.configs.strict,
  // Layer 4: eslint-config-prettier (Prettier との競合ルール無効化)
  prettierConfig,
  {
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'react/jsx-no-leaked-render': ['error', { validStrategies: ['ternary'] }],
    },
  }
)
