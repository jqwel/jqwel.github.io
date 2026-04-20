const fs = require('fs');
const path = require('path');
const https = require('https');
const { promisify } = require('util');
const {HttpsProxyAgent} = require('https-proxy-agent');
const {forEach} = require("core-js/stable/dom-collections"); // 新增代理库 [1,7](@ref)

// 代理配置
const PROXY_CONFIG = {
  host: '127.0.0.1',
  port: 3213,
  protocol: 'http' // 若代理支持HTTPS可改为https
};

const WORD_FILE = path.join(__dirname, 'words_20250716.txt');
// const WORD_FILE = path.join(__dirname, 'temp.txt');
const VOICE_DIR = path.join(__dirname, 'voices');
const NO_VOICE_FILE = path.join(__dirname, 'novoice.txt');
const BASE_URL = 'https://audio.beingfine.cn/speeches/US/US-speech/';

// Promise化工具函数
const readFileAsync = promisify(fs.readFile);
const mkdirAsync = promisify(fs.mkdir);

// 非阻塞延迟
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 检查文件是否存在
const fileExists = (filePath) => fs.existsSync(filePath);

// 下载MP3文件（支持代理）
const downloadMP3 = (url, savePath) => {
  return new Promise((resolve, reject) => {
    const agent = new HttpsProxyAgent(PROXY_CONFIG); // 创建代理Agent [1,7](@ref)

    const reqOptions = {
      agent, // 关键：注入代理配置
      rejectUnauthorized: false // 忽略证书验证（适用于调试，生产环境需谨慎）[1](@ref)
    };

    https.get(url, reqOptions, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      const file = fs.createWriteStream(savePath);
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

async function extractedMethod(word, index, words, words_no_voice) {
  const safeWord = word.replaceAll(/\//g, '%2F');
  const fileName = `${safeWord}.mp3`;
  const filePath = path.join(VOICE_DIR, fileName);
  const encodedWord = encodeURIComponent(word);
  const mp3Url = `${BASE_URL}${encodedWord}.mp3`;

  if (fileExists(filePath)) {
    console.log(`[${index + 1}/${words.length}] ✓ ${fileName} 已存在`);
    return;
  }
  if (words_no_voice.includes(word)) {
    console.log(`[${index + 1}/${words.length}] ✓ ${word} 没有发音`);
    return;
  }

  try {
    console.log(`[${index + 1}/${words.length}] ↓ 下载: ${word}`);
    await downloadMP3(mp3Url, filePath);
    console.log(`[${index + 1}/${words.length}] ✓ 下载完成`);
    const minDelay = 500;
    const maxDelay = 1500;
    const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    await sleep(randomDelay / 1000); // 延迟3秒避免请求过频
  } catch (err) {
    console.error(`[${index + 1}/${words.length}] × 失败: ${err.message}`);
    if (err.message === "HTTP 404") {
      fs.appendFileSync(NO_VOICE_FILE, `${word}\n`);
    }
    await sleep(1000); // 延迟3秒避免请求过频
  }
}

// 主逻辑
const processWords = async () => {
  const data_no_voice = await readFileAsync(NO_VOICE_FILE, 'utf8');
  const words_no_voice = data_no_voice.replaceAll('\r', '')
    .split('\n')
    .filter(word => word.trim() !== '');
  try {
    // 创建输出目录
    if (!fileExists(VOICE_DIR)) {
      await mkdirAsync(VOICE_DIR);
      console.log(`创建目录: ${VOICE_DIR}`);
    }

    // 读取单词文件
    const data = await readFileAsync(WORD_FILE, 'utf8');
    const words = data.replaceAll('\r', '')
      .split('\n')
      .filter(word => word.trim() !== '')
      .sort(() => Math.random() - 0.5);

    console.log(`找到 ${words.length} 个单词 | 代理: ${PROXY_CONFIG.host}:${PROXY_CONFIG.port}`);

    // words.entries().forEach((entry) => {
    //   const [index, word] = entry;
    //   console.log(index, word)
    // })
    // return
    // 处理每个单词
    for (const [index, word] of words.entries()) {
      if (false) {
        // s 1
        extractedMethod(word, index, words, words_no_voice);
        await sleep(1000); // 延迟3秒避免请求过频
      } else {
        // s 2
        await extractedMethod(word, index, words, words_no_voice);
      }
    }

    console.log('处理完成!');
  } catch (err) {
    console.error('全局错误:', err.message);
  }
};

// 执行入口
if (require.main === module) {
  console.log('启动下载任务（使用代理）...');
  processWords();
} else {
  module.exports = {
    processWords,
    downloadMP3,
    setProxy: (host, port) => {
      PROXY_CONFIG.host = host;
      PROXY_CONFIG.port = port;
    }
  };
}