import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import { eslint } from 'rollup-plugin-eslint'
import analyze from 'rollup-plugin-analyzer'

const pkg = require('./package.json')

const libraryName = 'Cvent'

export default {
  input: `src/${libraryName.toLocaleLowerCase()}.ts`,
  output: [
    {
      file: pkg.main,
      name: libraryName,
      format: 'umd',
    },
  ],
  watch: {
    include: 'src/**',
  },
  plugins: [
    eslint(),
    // Compile TypeScript files
    typescript({ useTsconfigDeclarationDir: true }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),
    analyze(),
  ],
}
