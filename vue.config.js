const { defineConfig } = require('@vue/cli-service')
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = defineConfig({
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
      watch: {
        ignored: [path.join(__dirname, 'public/assets/**')] // ✅ 绝对路径更可靠
      }
    }
  },
  // 输出文件夹
  outputDir: 'dist_gh',

  // 修改 index.html 输出位置
  indexPath: '../index.html',

  publicPath: process.env.NODE_ENV === 'production' ? '/dist_gh/' : '/',

  transpileDependencies: true,

  chainWebpack: (config) => {
    config.module
      .rule('raw')
      .test(/\.(txt|csv)$/)
      .use('raw-loader')
      .loader('raw-loader')
      .end();

    // 删除 vue-cli 内部默认的 copy 插件
    config.plugins.delete('copy');

    // 重新添加 copy-webpack-plugin，只复制 public 除了 public/assets 的部分
    config
      .plugin('copy')
      .use(CopyWebpackPlugin, [
        {
          patterns: [
            {
              from: path.resolve(__dirname, 'public'),
              to: path.resolve(__dirname, 'dist_gh'),
              globOptions: {
                ignore: ['**/assets/**', '**/index.html'], // 关键：忽略 public/assets 内所有内容
              },
              noErrorOnMissing: true,
              info: { minimized: true }
            }
          ],
        },
      ]);
  }
})
