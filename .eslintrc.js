module.exports = {
  // 解析器
  parser: '@typescript-eslint/parser',

  // 继承的规则 [扩展]
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint'
  ],

  // 插件
  plugins: ['@typescript-eslint', 'prettier'],

  // 规则
  rules: {
    'prettier/prettier': 1,
    'max-len': ['warn', { 'code': 120 }],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/no-empty-function': 'off',
  }
}
