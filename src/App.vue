<template>
  <div>
    <nav class="navbar navbar-expand-lg">
      <div class="container-fluid">
        <router-link class="navbar-brand" to="/">工具箱</router-link>

        <!-- 颜色模式切换下拉菜单 -->
        <div class="dropdown ms-auto me-3">
          <button class="btn btn-outline-secondary dropdown-toggle" type="button"
                  id="colorModeDropdown" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi" :class="themeIcon"></i> {{ themeLabel }}
          </button>
          <ul class="dropdown-menu" aria-labelledby="colorModeDropdown">
            <li>
              <a class="dropdown-item" href="#" :class="{ active: theme === 'light' }"
                 @click.prevent="setTheme('light')">
                <i class="bi bi-sun"></i> 浅色模式
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="#" :class="{ active: theme === 'dark' }"
                 @click.prevent="setTheme('dark')">
                <i class="bi bi-moon"></i> 深色模式
              </a>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <a class="dropdown-item" href="#" :class="{ active: theme === 'auto' }"
                 @click.prevent="setTheme('auto')">
                <i class="bi bi-laptop"></i> 跟随系统
              </a>
            </li>
          </ul>
        </div>

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
              <router-link class="nav-link" to="/json">JSON格式化</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/table2json">JSON表格</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/xlsx2csv">XLSX转CSV</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/go2json">GO转JSON</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/wordfinder">查词工具</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/timetool">时间转换</router-link>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// 定义主题类型和当前主题
const theme = ref(localStorage.getItem('theme') || 'auto')
const systemTheme = ref('light')

// 计算属性：根据当前主题返回对应的图标
const themeIcon = computed(() => {
  switch (theme.value) {
    case 'light': return 'bi-sun'
    case 'dark': return 'bi-moon'
    default: return 'bi-laptop'
  }
})

// 计算属性：根据当前主题返回对应的标签文本
const themeLabel = computed(() => {
  switch (theme.value) {
    case 'light': return '浅色'
    case 'dark': return '深色'
    default: return '系统'
  }
})

// 检测系统主题变化
const updateSystemTheme = () => {
  systemTheme.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  if (theme.value === 'auto') {
    applyTheme(systemTheme.value)
  }
}

// 应用主题到页面
const applyTheme = (themeToApply) => {
  const actualTheme = themeToApply === 'auto' ? systemTheme.value : themeToApply
  document.body.setAttribute('data-bs-theme', actualTheme)
}

// 设置主题
const setTheme = (newTheme) => {
  theme.value = newTheme
  localStorage.setItem('theme', newTheme)
  applyTheme(newTheme)
}

// 监听主题变化
watch(theme, (newTheme) => {
  applyTheme(newTheme)
})

onMounted(() => {
  // 初始检测系统主题
  updateSystemTheme()

  // 监听系统主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', updateSystemTheme)

  // 应用保存的主题
  applyTheme(theme.value)
})

onUnmounted(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.removeEventListener('change', updateSystemTheme)
})
</script>

<style scoped>
.dropdown-toggle {
  min-width: 100px;
}

.dropdown-item.active {
  background-color: var(--bs-primary);
  color: white;
}

.bi {
  margin-right: 8px;
}

/* 为下拉菜单添加主题适配 */
.dropdown-menu {
  background-color: var(--bs-body-bg);
  border-color: var(--bs-border-color);
}

.dropdown-item {
  color: var(--bs-body-color);
}

.dropdown-item:hover {
  background-color: var(--bs-secondary-bg);
  color: var(--bs-body-color);
}

/* 导航栏品牌链接样式调整 */
.navbar-brand {
  font-weight: bold;
}

/* 确保导航链接在暗色主题下也有良好显示 */
.nav-link {
  color: var(--bs-nav-link-color) !important;
}

.nav-link:hover {
  color: var(--bs-nav-link-hover-color) !important;
}
</style>

<style>
body {
  padding-top: 0px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* 平滑过渡效果 */
.navbar, .container, .dropdown-menu {
  transition: background-color 0.3s ease, color 0.3s ease;
}
</style>