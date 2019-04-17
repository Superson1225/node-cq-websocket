const isCI = require('is-ci')
const path = require('path')
const ENTRY_FILE = path.join(__dirname, 'src', 'index.js')
const OUTPUT_DIR = path.join(__dirname, isCI ? 'dist' : '.dist')

const fs = require('fs-extra')
const chalk = require('chalk')
try {
  fs.accessSync(ENTRY_FILE, 'r')
} catch (e) {
  console.warn(chalk.yellow('Try `npm run build` before `npm run webpack`.'))
  console.error(chalk.red('%s\n'), e.message)
  process.exit(1)
}

fs.ensureDirSync(OUTPUT_DIR)

const KaomojifyWebpackPlugin = require('kaomojify-webpack-plugin')

const COMMON_CONFIG = {
  mode: 'production',
  entry: ENTRY_FILE,
  output: {
    library: {
      root: 'CQWebSocketSDK',
      amd: 'cq-websocket',
      commonjs: 'cq-websocket'
    },
    libraryTarget: 'umd',
    libraryExport: '',
    path: OUTPUT_DIR
  }
}

module.exports = [
  { // minified bundle
    ...COMMON_CONFIG,
    output: {
      ...COMMON_CONFIG.output,
      filename: 'cq-websocket.min.js'
    }
  },
  { // kaomojified bundle (x100 in size) (*´∇｀*)/
    ...COMMON_CONFIG,
    output: {
      ...COMMON_CONFIG.output,
      filename: 'cq-websocket.kaomojified.js'
    },
    plugins: [
      new KaomojifyWebpackPlugin({
        outputPath: OUTPUT_DIR
      })
    ]
  }
]
