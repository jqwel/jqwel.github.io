const fs = require('fs');
const path = require('path');
const https = require('https');
const { promisify } = require('util');

// 使用 __dirname 确保路径正确性 [1,2,3](@ref)
// const WORD_FILE = path.join(__dirname, 'temp.txt');
const WORD_FILE = path.join(__dirname, 'words_20250715.txt');
const VOICE_DIR = path.join(__dirname, 'voices');
const BASE_URL = 'https://audio.beingfine.cn/speeches/US/US-speech/';

// 将回调函数转为 Promise 格式
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

// 实现 sleep 功能（非阻塞）[9,10,11](@ref)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 检查文件是否存在
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
};

// 下载 MP3 文件
const downloadMP3 = (url, savePath) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(savePath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(savePath, () => reject(err));
    });
  });
};

// 主逻辑
const processWords = async () => {
  try {
    // 确保 voices 目录存在
    if (!fileExists(VOICE_DIR)) {
      await mkdirAsync(VOICE_DIR);
      console.log(`创建目录: ${VOICE_DIR}`);
    }

    // 读取单词文件
    const data = await readFileAsync(WORD_FILE, 'utf8');
    const words = data.replaceAll('\r', '').split('\n').filter(word => word.trim() !== '').sort(() => Math.random() - 0.5);

    console.log(`找到 ${words.length} 个单词`);

    // 处理每个单词
    for (const [index, word] of words.entries()) {
      const safeWord = word.replaceAll(/\//g, '%2F');
      const fileName = `${safeWord}.mp3`;
      const filePath = path.join(VOICE_DIR, fileName);
      const encodedWord = encodeURIComponent(word);
      const mp3Url = `${BASE_URL}${encodedWord}.mp3`;

      // 检查文件是否存在
      if (fileExists(filePath)) {
        console.log(`[${index + 1}/${words.length}] ✓ ${fileName} 已存在`);
        continue;
      }

      // 下载文件
      try {
        console.log(`[${index + 1}/${words.length}] ↓ 下载: ${fileName} ${mp3Url}`);
        await downloadMP3(mp3Url, filePath);
        console.log(`[${index + 1}/${words.length}] ✓ 下载完成: ${fileName}`);

        // 下载完成后延迟 1 秒 [9,10](@ref)
        await sleep(1000);
        console.log(`[${index + 1}/${words.length}] ⏱️ 延迟 1 秒`);
      } catch (err) {
        console.error(`[${index + 1}/${words.length}] × 下载失败: ${fileName} (${err.message})`);
      }
    }

    console.log('处理完成!');
  } catch (err) {
    console.error('发生错误:', err.message);
    await sleep(1000);
  }
};

// 使用 require.main 判断是否直接执行 [6](@ref)
if (require.main === module) {
  console.log('脚本直接执行，开始处理...');
  processWords();
} else {
  console.log('作为模块被引用，不自动执行');
  module.exports = { processWords, downloadMP3 };
}