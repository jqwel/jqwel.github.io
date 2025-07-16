<template>
  <div class="p-4">
    <h2 class="mb-4 text-xl font-bold">查词工具</h2>

    <!-- 控制区 -->
    <div class="mb-3 flex flex-wrap items-center gap-2">
      <label class="mr-2">随机字母数量：</label>
      <input type="number" v-model.number="letterCount" min="1" max="20" class="border px-2 py-1" />
      <button @click="generateRandomLetters" class="btn btn-info ml-2 bg-gray-200 px-3 py-1 rounded">生成</button>
      <label class="mr-2">或手动输入字母：</label>
      <input
          type="text"
          v-model="manualLetters"
          @keyup.enter="findValidWords"
          class="border px-2 py-1 w-40"
          placeholder="如 abcde"
      />
      <button
          @click="findValidWords"
          class="btn btn-primary bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
          :disabled="!!loading || !dictionaryLoaded || manualLetters.length >= 30"
      >
        {{ loading === true ? '生成中...' : loading || '生成单词' }}
      </button>
    </div>

    <!-- 分页控件 -->
    <div v-if="dictionaryLoaded && validWords.length > pageSize" class="flex justify-between items-center mt-4">
      <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1 bg-gray-200 rounded">
        上一页
      </button>
      <span>第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 py-1 bg-gray-200 rounded">
        下一页
      </button>
    </div>

    <!-- 加载提示 -->
    <div v-if="loading && typeof loading === 'string'" class="mt-4 text-center p-4 bg-gray-100 rounded">
      {{ loading }}
    </div>

    <!-- 结果展示 -->
    <div v-if="dictionaryLoaded && validWords.length" class="mt-6 overflow-x-auto">
      <h3 class="font-semibold mb-2">结果（共 {{ validWords.length }} 个）</h3>

      <table class="table-auto border text-sm min-w-full">
        <thead>
        <tr class="bg-gray-100 text-left">
          <th class="px-3 py-2 border">单词</th>
          <th class="px-3 py-2 border">发音</th>
          <th class="px-3 py-2 border">翻译</th>
          <th class="px-3 py-2 border text-center">§</th>
          <th v-for="(site, idx) in dictSites" :key="idx" class="px-3 py-2 border text-center">
            {{ site.name }}
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in paginatedWords" :key="index" class="hover:bg-gray-50">
          <td class="px-3 py-1 border whitespace-pre" style="white-space: pre;">{{ item.word }}</td>
          <td class="px-3 py-1 border text-center">
            <button v-if="dictionarySel[item.word] && !(noVoiceCache[item.word])"
                    @click="playWordSound(item.word)"
                    class="btn btn-sm btn-outline-info">
              🔊
            </button>
            <span v-else>-</span>
          </td>
          <td class="px-3 py-1 border text-gray-600 max-w-xs truncate" :title="item.translation">
            {{ item.translation }}
          </td>
          <td class="px-3 py-1 border text-center">
            {{ dictionarySel[item.word] ? '⭐' : '-' }}
          </td>
          <td
              v-for="(site, idx) in dictSites"
              :key="idx"
              class="px-2 py-1 border text-center whitespace-nowrap"
          >
            <a :href="site.url(item.word)" target="_blank" class="text-blue-600 hover:underline">
              查词
            </a>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import Papa from 'papaparse'
import { fetchWithCache } from '@/utils/fetchWithCache'

const dictSites = [
  { name: 'Baidu', url: word => `https://fanyi.baidu.com/#en/zh/${encodeURIComponent(word)}` },
  { name: 'Google', url: word => `https://www.google.com/search?q=define+${encodeURIComponent(word)}` },
  { name: 'Oxford', url: word => `https://www.oxfordlearnersdictionaries.com/definition/english/${encodeURIComponent(word)}` },
  { name: 'Cambridge', url: word => `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(word)}` },
  { name: 'Merriam', url: word => `https://www.merriam-webster.com/dictionary/${encodeURIComponent(word)}` },
  { name: 'Dictionary', url: word => `https://www.dictionary.com/browse/${encodeURIComponent(word)}` },
  { name: 'Collins', url: word => `https://www.collinsdictionary.com/dictionary/english/${encodeURIComponent(word)}` },
]

const dictionary = ref([])
const validWords = ref([])
const manualLetters = ref('')
const letterCount = ref(11)
const sortDesc = ref(true)
const currentPage = ref(1)
const pageSize = 10
const loading = ref(false)
const dictionaryLoaded = ref(false)
const dictionarySel = ref({})
const noVoiceCache = ref({})
const audioCache = ref({}) // 音频缓存对象

const freqAlphabet = [
  'e','e','e','e','e','e','e','e','e','e','e','e',
  't','t','t','t','t','t','t','t',
  'a','a','a','a','a','a','a',
  'o','o','o','o','o','o',
  'i','i','i','i','i',
  'n','n','n','n','n',
  's','s','s','s','s',
  'h','h','h','h',
  'r','r','r','r',
  'd','d','d',
  'l','l','l',
  'c','c',
  'u','u',
  'm','m',
  'w','w',
  'f','f',
  'g','y','p','b','v','k','j','x','q','z'
]

const len = w => (w.word.match(/[a-zA-Z]/g) || []).length
const sortedWords = computed(() =>
    [...validWords.value].sort((a, b) => {
      if (manualLetters.value.toLowerCase() === a.word.toLowerCase()) {
        return -100
      } else if (manualLetters.value.toLowerCase() === b.word.toLowerCase()) {
        return 100
      }
      const aStar = dictionarySel.value[a.word] ? 1 : 0
      const bStar = dictionarySel.value[b.word] ? 1 : 0

      if (bStar !== aStar) return bStar - aStar
      return sortDesc.value ? len(b) - len(a) : len(a) - len(b)
    })
)

const totalPages = computed(() => Math.ceil(validWords.value.length / pageSize))
const paginatedWords = computed(() =>
    sortedWords.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize)
)

let worker = null

// 单词发音功能[6,7](@ref)
function playWordSound(word) {
  const encodedWord = encodeURIComponent(word.replaceAll(/\//g, '%2F'));
  const audioUrl = `${process.env.VUE_APP_PUBLIC_BASE_URL}assets/voices/${encodedWord}.mp3`

  // 缓存优化：避免重复创建Audio对象[6](@ref)
  if (!audioCache.value[word]) {
    audioCache.value[word] = new Audio(audioUrl);

    // 预加载但不立即播放
    audioCache.value[word].load();
    audioCache.value[word].addEventListener('error', (e) => {
      console.error('音频加载失败（404或其他错误）:', e);
      // 删除缓存中的无效对象
      delete audioCache.value[word];
    });

    // 添加结束事件重置播放位置
    audioCache.value[word].addEventListener('ended', () => {
      audioCache.value[word].currentTime = 0;
    });
  }

  // 播放处理
  const audio = audioCache.value[word];
  audio.currentTime = 0;
  audio.play().catch(error => {
    console.error('播放失败:', error);
  });
}

// 清理音频资源[6](@ref)
onBeforeUnmount(() => {
  Object.values(audioCache.value).forEach(audio => {
    audio.pause();
    audio.src = '';
  });
  audioCache.value = {};

  if (worker) {
    worker.terminate();
  }
});

onMounted(async () => {
  try {
    const no_voice_data = await fetchWithCache(`${process.env.VUE_APP_PUBLIC_BASE_URL}assets/novoice.txt`, 0, null, true);
    no_voice_data.replaceAll("\r", "").split('\n').forEach(w => {
      if (!w) return;
      noVoiceCache.value[w] = true;
    })
    console.log(noVoiceCache.value)

    const input_sel = `${process.env.VUE_APP_PUBLIC_BASE_URL}assets/words_20250715.txt`;
    if (input_sel) {
      const words_sel = await fetchWithCache(input_sel, 0, null);
      words_sel.replaceAll("\r", "").split('\n').forEach(w => {
        if (!w) return;
        dictionarySel.value[w] = 1
      })
    }

    const input = `${process.env.VUE_APP_PUBLIC_BASE_URL}assets/ecdict_202507141516.csv`;
    const total = 35534978;
    const chunks = await fetchWithCache(input, total, loading);

    const parsed = Papa.parse(chunks, {
      header: true,
      skipEmptyLines: true,
    })

    const entries = parsed.data.map(row => ({
      word: (row.word || '').trim(),
      translation: (row.translation || '').trim(),
    }))

    dictionary.value = entries
    dictionaryLoaded.value = true
    loading.value = false

    worker = new Worker(new URL('../workers/trieWorker-n1.js', import.meta.url), { type: 'module' })
    worker.postMessage({ init: true, dict: entries })
    worker.onmessage = function (e) {
      validWords.value = e.data
      loading.value = false
      currentPage.value = 1
    }
  } catch (error) {
    console.error('加载词典失败:', error)
    loading.value = false
  }
})

function generateRandomLetters() {
  manualLetters.value = Array.from({ length: letterCount.value }, () =>
      freqAlphabet[Math.floor(Math.random() * freqAlphabet.length)]
  ).join('')
}

var selWords = null

function findValidWords() {
  const letters = manualLetters.value.toLowerCase().split('') // .filter(c => /[a-z]/.test(c))

  if (!letters.length) {
    if (!selWords) {
      selWords = Object.keys(dictionarySel.value)
    }
    const sampled = []

    while (sampled.length < 10 && selWords.length > 0) {
      const idx = Math.floor(Math.random() * selWords.length)
      const word = selWords.splice(idx, 1)[0]
      const entry = dictionary.value.find(e => e.word === word)
      if (entry) sampled.push(entry)
    }

    validWords.value = sampled
    currentPage.value = 1
    return
  }

  loading.value = true

  // let n = letters.length
  // if (n > 9) n = 9
  // if (n < 5) n = 5
  // const padding = Array(n).fill('♥')
  const padding = `!""&$%'''()()*+,,,     -------......:;?[]_~`.split('')
  worker.postMessage({ letters: [...letters, ...padding] })
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}
</script>

<style scoped>
input {
  outline: none;
  border: 1px solid #cbd5e0;
  transition: border-color 0.2s;
}

input:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

a {
  text-decoration: none;
}

tr:hover {
  background-color: rgba(20, 143, 20, 0.15);
}
</style>