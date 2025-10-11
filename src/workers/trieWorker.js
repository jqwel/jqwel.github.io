self.onmessage = function (e) {
  const { letters, dict } = e.data;

  class TrieNode {
    constructor() {
      this.children = {};
      this.isWord = false;
    }
  }

  function buildTrie(words) {
    const root = new TrieNode();
    for (const word of words) {
      let node = root;
      for (const char of word) {
        if (!node.children[char]) node.children[char] = new TrieNode();
        node = node.children[char];
      }
      node.isWord = true;
    }
    return root;
  }

  const wordMap = new Map();
  const wordList = [];
  const normalizedMap = new Map();

  function normalize(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '♥');
  }

  for (const entry of dict) {
    const originalWord = entry.word;
    const normalized = normalize(originalWord);
    if (!normalizedMap.has(normalized)) {
      normalizedMap.set(normalized, originalWord); // 保留原始大小写
      wordMap.set(normalized, entry.translation);
      wordList.push(normalized);
    }
  }

  const trie = buildTrie(wordList);
  const results = new Set();

  function dfs(node, path, used) {
    if (node.isWord) results.add(path.join(''));

    for (let i = 0; i < letters.length; i++) {
      if (used[i]) continue;
      const char = letters[i].toLowerCase();
      if (!node.children[char]) continue;

      used[i] = true;
      path.push(char);
      dfs(node.children[char], path, used);
      path.pop();
      used[i] = false;
    }
  }

  dfs(trie, [], Array(letters.length).fill(false));

  const final = [...results].map(word => ({
    word: normalizedMap.get(word) || word,
    translation: wordMap.get(word) || ''
  }));

  self.postMessage(final);
};
