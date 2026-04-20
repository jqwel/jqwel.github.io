// 这是一个 new Worker
let trie = null
let wordMap = new Map()
const normalizedMap = new Map();

class TrieNode {
  constructor() {
    this.children = {}
    this.isWord = false
  }
}

function buildTrie(words) {
  const root = new TrieNode()
  for (const word of words) {
    let node = root
    for (const char of word) {
      if (!node.children[char]) node.children[char] = new TrieNode()
      node = node.children[char]
    }
    node.isWord = true
  }
  return root
}

function normalize(str) {
  return str.toLowerCase() // .replace(/[^a-z0-9]/g, '♥')
}

self.onmessage = function (e) {
  // const { letters, dict } = e.data;
  const { init, dict, letters } = e.data;

  if (init && dict) {
    // 初始化，构建字典映射和 Trie 树
    wordMap.clear()
    const normalizedWords = []

    for (const entry of dict) {
      const norm = normalize(entry.word)
      if (!wordMap.has(norm)) {
        normalizedMap.set(norm, entry.word); // 保留原始大小写
        wordMap.set(norm, entry.translation)
        normalizedWords.push(norm)
      }
    }

    trie = buildTrie(normalizedWords)
    return
  }

  const results = new Set()

  function dfs(node, path, used) {
    if (node.isWord) results.add(path.join(''))

    for (let i = 0; i < letters.length; i++) {
      if (used[i]) continue
      const char = letters[i].toLowerCase()
      if (!node.children[char]) continue

      used[i] = true
      path.push(char)
      dfs(node.children[char], path, used)
      path.pop()
      used[i] = false
    }
  }
  if (letters && trie) {

    dfs(trie, [], Array(letters.length).fill(false))

    const final = [...results].map(normWord => ({
      word: normalizedMap.get(normWord) || normWord,
      translation: wordMap.get(normWord) || '',
    }))

    self.postMessage(final)
    return
  }

  return self.postMessage([])
};
