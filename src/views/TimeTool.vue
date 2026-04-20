<template>
  <div class="container py-4">
    <div class="card shadow-sm border-0">
      <div class="card-body">
        <!-- 当前时间戳 -->
        <div class="text-center mb-4">
          <h5 class="card-title mb-2">当前时间戳</h5>
          <h2 class="fw-bold text-primary mb-3 clickable-timestamp" @click="fillCurrentTimestamp">
            {{ displayTimestamp }} {{ {ms: '毫秒', s: '秒' }[displayUnit] }}
          </h2>
          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-outline-primary btn-sm" @click="toggleDisplayUnit">
              切换单位
            </button>

            <button
                class="btn btn-outline-success btn-sm position-relative"
                :disabled="copied"
                @click="handleCopy"
            >
              <span v-if="!copied">复制</span>
              <span v-else>✅ 已复制</span>
            </button>

            <button
                class="btn btn-danger btn-sm"
                @click="toggleTimer"
            >
              {{ timerActive ? '停止' : '开始' }}
            </button>
          </div>
        </div>

        <!-- 时间戳转日期时间 -->
        <div class="mb-4">
          <label class="form-label fw-semibold">🕒 时间戳转日期时间</label>
          <div class="controls-row">
            <div class="control-group">
              <input
                  v-model="timestampInput"
                  type="text"
                  placeholder="输入时间戳"
                  class="form-control"
              />
            </div>

            <div class="control-group">
              <select v-model="convertUnit1" class="form-select">
                <option value="s">秒(s)</option>
                <option value="ms">毫秒(ms)</option>
              </select>
            </div>

            <button class="btn btn-outline-primary convert-btn" @click="convertToDateTime">转换</button>

            <div class="control-group">
              <select v-model="timezone" class="form-select">
                <option v-for="tz in timezones" :key="tz.value" :value="tz.value">{{ tz.label }}</option>
              </select>
            </div>

            <div class="control-group result-group">
              <input
                  type="text"
                  class="form-control"
                  readonly
                  :value="timestampResult"
                  placeholder="转换结果"
              />
            </div>
          </div>
        </div>

        <!-- 日期转时间戳 -->
        <div class="mb-4">
          <label class="form-label fw-semibold">📅 日期时间转时间戳</label>
          <div class="controls-row">
            <div class="control-group">
              <input
                  v-model="datetimeInput"
                  type="text"
                  placeholder="例如 2025-10-11 13:27:45"
                  class="form-control"
              />
            </div>

            <div class="control-group">
              <select v-model="timezone" class="form-select">
                <option v-for="tz in timezones" :key="tz.value" :value="tz.value">{{ tz.label }}</option>
              </select>
            </div>

            <button class="btn btn-outline-primary convert-btn" @click="convertToTimestamp">转换</button>

            <div class="control-group">
              <select v-model="convertUnit2" class="form-select">
                <option value="s">秒(s)</option>
                <option value="ms">毫秒(ms)</option>
              </select>
            </div>

            <div class="control-group result-group">
              <input
                  type="text"
                  class="form-control"
                  readonly
                  :value="datetimeResult"
                  placeholder="转换结果"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezonePlugin from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(timezonePlugin)

const timerActive = ref(true)
const displayUnit = ref('s') // 当前时间戳显示单位
const convertUnit1 = ref('s') // 时间戳转日期时间的单位
const convertUnit2 = ref('s') // 日期时间转时间戳的单位
const timezone = ref('Asia/Shanghai')

// 扩展时区列表，包含用户要求的时区[4,5](@ref)
const timezones = ref([
  { value: 'Asia/Shanghai', label: '亚洲/上海 (UTC+08:00)' },
  { value: 'Asia/Tokyo', label: '亚洲/东京 (UTC+09:00)' },
  { value: 'Asia/Seoul', label: '亚洲/首尔 (UTC+09:00)' },
  { value: 'America/Los_Angeles', label: '美洲/洛杉矶 (UTC-07:00/-08:00)' },
  { value: 'America/New_York', label: '美洲/纽约 (UTC-05:00/-04:00)' },
  { value: 'Europe/London', label: '欧洲/伦敦 (UTC+00:00/+01:00)' },
  { value: 'UTC', label: '协调世界时 (UTC)' }
])

const timestampInput = ref('')
const datetimeInput = ref('')
const timestampResult = ref('')
const datetimeResult = ref('')

const copied = ref(false)
const currentTimestamp = ref(Date.now())
let timer = null

const displayTimestamp = computed(() => {
  return displayUnit.value === 'ms' ? currentTimestamp.value : Math.floor(currentTimestamp.value / 1000)
})

const startTimer = () => {
  timerActive.value = true
  timer = setInterval(() => (currentTimestamp.value = Date.now()), 1000)
}
const stopTimer = () => {
  timerActive.value = false
  clearInterval(timer)
}
const toggleTimer = () => (timerActive.value ? stopTimer() : startTimer())

const toggleDisplayUnit = () => {
  displayUnit.value = displayUnit.value === 'ms' ? 's' : 'ms'
}

const handleCopy = async () => {
  await navigator.clipboard.writeText(displayTimestamp.value.toString())
  copied.value = true
  setTimeout(() => (copied.value = false), 1200)
}

// 新增功能：点击当前时间戳填充到输入框
const fillCurrentTimestamp = () => {
  // 将当前时间戳的值填充到输入框
  timestampInput.value = displayTimestamp.value.toString()

  // 将当前显示单位同步到转换单位
  convertUnit1.value = displayUnit.value

  // 自动触发转换
  convertToDateTime()
}

const convertToDateTime = () => {
  if (!timestampInput.value) return
  let ts = parseInt(timestampInput.value)
  if (convertUnit1.value === 's') ts *= 1000
  const date = dayjs(ts).tz(timezone.value)
  timestampResult.value = date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : '无效时间戳'
}

const convertToTimestamp = () => {
  if (!datetimeInput.value) return
  const date = dayjs.tz(datetimeInput.value, timezone.value)
  datetimeResult.value = date.isValid()
      ? convertUnit2.value === 's'
          ? date.unix()
          : date.valueOf()
      : '无效日期格式'
}

onMounted(() => {
  startTimer()
  onUnmounted(() => {
    stopTimer()
  })
})
</script>

<style scoped>
.controls-row {
  display: grid;
  grid-template-columns: 2fr 1fr auto 1.5fr 2fr;
  gap: 12px;
  align-items: end;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.convert-btn {
  white-space: nowrap;
  height: fit-content;
  margin-bottom: 6px;
}

/* 新增样式：可点击的时间戳 */
.clickable-timestamp {
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px 16px;
  border-radius: 8px;
  display: inline-block;
}

.clickable-timestamp:hover {
  background-color: #f8f9fa;
  transform: scale(1.02);
}

.clickable-timestamp:active {
  transform: scale(0.98);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .controls-row {
    grid-template-columns: 2fr 1fr 1.5fr;
    grid-template-areas:
      "input unit timezone"
      "button result result";
    gap: 12px;
  }

  .control-group:nth-child(1) { grid-area: input; }
  .control-group:nth-child(2) { grid-area: unit; }
  .control-group:nth-child(3) { grid-area: timezone; }
  .convert-btn { grid-area: button; }
  .result-group { grid-area: result; }
}

@media (max-width: 768px) {
  .controls-row {
    grid-template-columns: 1fr;
    grid-template-areas:
      "input"
      "unit"
      "timezone"
      "button"
      "result";
    gap: 10px;
  }

  .control-group, .convert-btn {
    grid-area: unset;
  }
}

.btn[disabled] {
  opacity: 0.7;
}
</style>