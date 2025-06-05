<template>
  <div>
    <nav class="navbar navbar-expand-lg">
      <div class="container-fluid">
        <router-link class="navbar-brand" to="/">工具箱</router-link>
        <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarTools"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarTools">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <router-link class="nav-link" to="/json">JSON 格式化</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/table2json">JSON表格</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/xlsx2csv">XLSX 转 CSV</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/go2json">GO 转 JSON</router-link>
            </li>
            <!-- 更多工具可以加这里 -->
          </ul>
        </div>
      </div>
    </nav>

    <div class="container mt-4">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  const updateTheme = () => {
    const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    document.body.setAttribute('data-bs-theme', theme)
  }

  updateTheme()
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme)

  // 如果你想在卸载时清除监听器，顺带写个 onUnmounted：
  onUnmounted(() => {
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', updateTheme)
  })
})
</script>

<style>
body {
  padding-top: 0px;
}
</style>
