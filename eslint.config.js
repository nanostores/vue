import eslintConfigLogux from '@logux/eslint-config/ts'

export default [
  {
    ignores: ['**/errors.ts']
  },
  ...eslintConfigLogux
]
