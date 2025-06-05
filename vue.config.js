const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  // 输出文件夹
  outputDir: 'dist_gh',  // 仍然将其他文件放入 dist 文件夹
  // 修改 index.html 输出位置
  indexPath: '../index.html',  // 让 index.html 文件输出到项目根目录
  publicPath: process.env.NODE_ENV === 'production' ? './dist_gh/' : '/',
  transpileDependencies: true
})
