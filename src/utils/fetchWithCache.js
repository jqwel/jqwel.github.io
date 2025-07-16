
export async function fetchWithCache(input, total = 0, loading = null, disableCache = false) {
  // 1. 创建 IndexedDB 数据库（基于浏览器原生 API）
  const dbName = 'FetchCacheDB';
  const storeName = 'responses';

  // 打开数据库连接（Promise 封装）
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        // 创建存储空间并建立索引（基于 URL 和过期时间）
        const store = db.createObjectStore(storeName, { keyPath: "url" });
        store.createIndex("expiry", "expiry", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  // 2. 检查缓存是否存在且有效
  const cached = await new Promise(resolve => {
    if (disableCache) {
      return resolve();
    }
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.get(input);

    request.onsuccess = () => {
      const data = request.result;
      // 验证缓存有效期（24小时）
      if (data && data.expiry > Date.now()) {
        resolve(data.chunks);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => resolve(null);
  });

  // 3. 直接返回有效缓存
  if (cached) {
    if (loading) loading.value = "使用缓存数据";
    return cached;
  }

  // 4. 无缓存时执行网络请求
  if (loading) loading.value = '数据加载中... 0%';

  const res = await fetch(input);
  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let received = 0;
  let chunks = '';

  // eslint-disable-next-line
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    received += value.length;
    chunks += decoder.decode(value, { stream: true });

    // 更新进度（如果传入了 total 和 loading）
    if (total && loading) {
      loading.value = `数据加载中... ${Math.floor((received / total) * 100)}%`;
    }
  }

  // 5. 将结果存入 IndexedDB
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  store.put({
    url: input,
    chunks: chunks,
    expiry: Date.now() + 7 * 86400000 // 7 * 24小时有效期
  });

  setTimeout(cleanupExpiredCache, 1e3)
  return chunks;
}

// 过期数据清理函数（独立于 fetchWithCache）
async function cleanupExpiredCache() {
  const dbName = 'FetchCacheDB';
  const storeName = 'responses';

  try {
    // 打开数据库连接
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    // 创建事务
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    // 使用索引筛选过期数据（当前时间 > 过期时间）
    const expiryIndex = store.index('expiry');
    const range = IDBKeyRange.upperBound(Date.now());  // 获取所有 expiry ≤ 当前时间的数据
    const request = expiryIndex.openCursor(range);

    let deletedCount = 0;

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        cursor.delete();  // 删除过期条目
        deletedCount++;
        cursor.continue();
      } else {
        console.log(`已清理 ${deletedCount} 条过期缓存`);
        // 可选：在清理后触发回调或事件
      }
    };

    request.onerror = (event) => {
      console.error('清理失败:', event.target.error);
    };

  } catch (error) {
    console.error('数据库访问失败:', error);
  }
}

// 启动定时清理任务（每天执行一次）
// function startAutoCleanup() {
//   // eslint-disable-next-line
//   // return
//   cleanupExpiredCache();  // 立即执行一次
//   // setInterval(cleanupExpiredCache, 24 * 60 * 60 * 1000);  // 每天执行
// }

// 在应用初始化时启动
// startAutoCleanup();
