import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import { eslint } from 'rollup-plugin-eslint'
import { terser } from 'rollup-plugin-terser'
import analyze from 'rollup-plugin-analyzer'

const pkg = require('./package.json')

const libraryName = 'Cvent'
const banner =
  `//  Cvent v${pkg.version}\n` +
  '//  https://github.com/littleLane/cvent\n' +
  `//  (c) 2020-${new Date().getFullYear()} littleLane\n` +
  '//  Cvent may be freely distributed under the MIT license.\n'

const basicPlugins = [
  // Allow json resolution
  eslint(),
  // Compile TypeScript files
  typescript({ useTsconfigDeclarationDir: true }),
  // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
  commonjs(),
  // Allow node_modules resolution, so you can use 'external' to control
  // which external modules to include in the bundle
  // https://github.com/rollup/rollup-plugin-node-resolve#usage
  resolve(),
]

export default [
  {
    input: `src/${libraryName.toLocaleLowerCase()}.ts`,
    output: {
      file: pkg.main,
      format: 'umd',
      name: libraryName,
      banner: banner,
    },
    plugins: basicPlugins,
  },
  {
    input: `src/${libraryName.toLocaleLowerCase()}.ts`,
    output: {
      file: pkg.unpkg,
      format: 'umd',
      name: libraryName,
      banner: banner,
    },
    plugins: basicPlugins.concat([
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
      analyze(),
    ]),
  },
  {
    input: `src/${libraryName.toLocaleLowerCase()}.ts`,
    output: {
      file: pkg.module,
      format: 'es',
      name: libraryName,
      banner: banner,
    },
    plugins: basicPlugins,
  },
]
