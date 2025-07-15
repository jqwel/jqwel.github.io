<template>
  <div class="p-4">
    <h2 class="mb-4">查词</h2>

    <!-- 控制区 -->
    <div class="mb-3">
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
          <th class="px-3 py-2 border">翻译</th>
          <th v-if="false" class="px-3 py-2 border text-center">长度</th>
          <th class="px-3 py-2 border text-center">§</th>
          <th v-for="(site, idx) in dictSites" :key="idx" class="px-3 py-2 border text-center">
            {{ site.name }}
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in paginatedWords" :key="index" class="hover:bg-gray-50">
          <td class="px-3 py-1 border whitespace-pre word-cell" style="white-space: pre;" @click="speakWord(item.word)">{{ item.word }}</td>
          <td class="px-3 py-1 border text-gray-600 max-w-xs truncate" :title="item.translation">
            {{ item.translation }}
          </td>
          <td v-if="false" class="px-3 py-1 border text-center">
            {{ (item.word.match(/[a-zA-Z]/g) || []).length }}
          </td>
          <td class="px-3 py-1 border text-center">
            {{ dictionarySel[item.word] ? '⭐' : '' }}
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
import { ref, computed, onMounted } from 'vue'
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

      if (bStar !== aStar) return bStar - aStar // 星号优先（1排在前面）
      return sortDesc.value ? len(b) - len(a) : len(a) - len(b)
    })
)

const totalPages = computed(() => Math.ceil(validWords.value.length / pageSize))
const paginatedWords = computed(() =>
    sortedWords.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize)
)

let worker = null

onMounted(async () => {
  try {
    const input_sel = `${process.env.VUE_APP_BASE_URL}assets/words_20250715.txt`
    if (input_sel) {
      const words_sel = await fetchWithCache(input_sel, 0, null);
      words_sel.replaceAll("\r", "").split('\n').forEach(w => {
        if (!w) return;
        dictionarySel.value[w] = 1
      })
    }

    const input = `${process.env.VUE_APP_BASE_URL}assets/ecdict_202507141516.csv`
    const total = 35534978
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
  const letters = manualLetters.value.toLowerCase().split('').filter(c => /[a-z]/.test(c))

  if (!letters.length) {
    // 没输入字母：随机从 dictionarySel 拿10个词
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

  // 有输入字母，发给 worker
  loading.value = true

  let n = letters.length
  if (n > 9) n = 9
  if (n < 5) n = 5
  const padding = Array(n).fill('♥')
  worker.postMessage({ letters: [...letters, ...padding] })
}

function speakWord(word) {
  const utterance = new SpeechSynthesisUtterance(word)
  // 尝试找美音
  const voices = speechSynthesis.getVoices().filter(v => v.lang.startsWith('en-US'))
  if (voices.length) {
    utterance.voice = voices[0]
  }
  utterance.rate = 0.9
  speechSynthesis.speak(utterance)
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
}
a {
  text-decoration: none;
}
table {
  border-collapse: collapse;
}
.word-cell {
  cursor: pointer;
/*  user-select: none;*/
  transition: background-color 0.15s ease;
}
.word-cell:hover {
/*  background-color: #ebf4ff;*/
}
</style>
