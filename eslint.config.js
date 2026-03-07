import eslintConfigLogux from '@logux/eslint-config/ts'

export default [
  {
    ignores: ['**/errors.ts', 'demo/vite.config.ts', 'vitest.config.ts']
  },
  ...eslintConfigLogux
]
