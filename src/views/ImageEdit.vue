<template>
  <div class="container-fluid my-4">
    <div class="row">
      <div class="col-12">
        <h1 class="text-center mb-4">图片编辑器</h1>
      </div>
    </div>

    <!-- 文件上传区域 -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">上传图片</h5>
          </div>
          <div class="card-body">
            <div class="input-group">
              <input
                  type="file"
                  class="form-control"
                  id="imageInput"
                  accept="image/*"
                  @change="handleFileUpload"
                  ref="fileInput"
              >
              <button class="btn btn-outline-secondary" type="button" @click="resetEditor">
                重置
              </button>
            </div>
            <div class="form-text">
              支持 JPEG、PNG、GIF 等格式，最大文件大小 10MB
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑区域 -->
    <div class="row" v-if="imageSrc">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">图片编辑</h5>
            <div class="btn-group">
              <button class="btn btn-sm btn-outline-primary" @click="zoomIn">
                <i class="bi bi-zoom-in"></i> 放大
              </button>
              <button class="btn btn-sm btn-outline-primary" @click="zoomOut">
                <i class="bi bi-zoom-out"></i> 缩小
              </button>
            </div>
          </div>
          <div class="card-body">
            <div class="cropper-container">
              <img :src="imageSrc" ref="imageElement" class="img-fluid" alt="编辑图片">
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">编辑工具</h5>
          </div>
          <div class="card-body">
            <!-- 裁剪比例选择 -->
            <div class="mb-3">
              <label class="form-label">裁剪比例</label>
              <select class="form-select" v-model="selectedAspectRatio" @change="setAspectRatio">
                <option value="NaN">自由比例</option>
                <option value="1">1:1 (正方形)</option>
                <option value="16/9">16:9 (宽屏)</option>
                <option value="4/3">4:3 (标准)</option>
                <option value="3/4">3:4 (竖屏)</option>
                <option value="2/1">2:1 (超宽)</option>
              </select>
            </div>

            <!-- 旋转控制 -->
            <div class="mb-3">
              <label class="form-label">旋转角度: {{ rotation }}°</label>
              <input type="range" class="form-range" min="0" max="360" v-model="rotation" @input="rotateImage">
            </div>

            <!-- 缩放控制 -->
            <div class="mb-3">
              <label class="form-label">缩放: {{ Math.round(scale * 100) }}%</label>
              <input type="range" class="form-range" min="10" max="300" v-model="scale" @input="scaleImage">
            </div>

            <!-- 操作按钮 -->
            <div class="d-grid gap-2">
              <button class="btn btn-primary" @click="cropImage">
                <i class="bi bi-crop"></i> 应用裁剪
              </button>
              <button class="btn btn-outline-secondary" @click="flipHorizontal">
                <i class="bi bi-arrow-left-right"></i> 水平翻转
              </button>
              <button class="btn btn-outline-secondary" @click="flipVertical">
                <i class="bi bi-arrow-up-down"></i> 垂直翻转
              </button>
            </div>
          </div>
        </div>

        <!-- 图片属性设置 -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">图片属性</h5>
          </div>
          <div class="card-body">
            <!-- 输出格式 -->
            <div class="mb-3">
              <label class="form-label">输出格式</label>
              <select class="form-select" v-model="outputFormat">
                <option value="image/jpeg">JPEG</option>
                <option value="image/png">PNG</option>
                <option value="image/webp">WebP</option>
              </select>
            </div>

            <!-- 图片质量 -->
            <div class="mb-3">
              <label class="form-label">图片质量: {{ quality }}%</label>
              <input type="range" class="form-range" min="10" max="100" v-model="quality">
            </div>

            <!-- 输出尺寸 -->
            <div class="mb-3">
              <label class="form-label">输出宽度 (px)</label>
              <input type="number" class="form-control" v-model="outputWidth" min="10" max="5000">
            </div>

            <div class="mb-3">
              <label class="form-label">输出高度 (px)</label>
              <input type="number" class="form-control" v-model="outputHeight" min="10" max="5000">
            </div>

            <!-- 保持宽高比 -->
            <div class="form-check mb-3">
              <input class="form-check-input" type="checkbox" v-model="maintainAspectRatio" id="maintainAspect">
              <label class="form-check-label" for="maintainAspect">
                保持宽高比
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预览和输出 -->
    <div class="row" v-if="editedImageSrc">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">预览与输出</h5>
            <div class="btn-group">
              <button class="btn btn-sm btn-success" @click="downloadImage">
                <i class="bi bi-download"></i> 下载图片
              </button>
              <button class="btn btn-sm btn-outline-info" @click="copyToClipboard" v-if="!isCopied">
                <i class="bi bi-clipboard"></i> 复制Base64
              </button>
              <button class="btn btn-sm btn-outline-success" v-else disabled>
                <i class="bi bi-check"></i> 已复制
              </button>
            </div>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <div class="preview-container">
                  <img :src="editedImageSrc" class="img-fluid" alt="编辑后图片">
                </div>
                <div class="mt-2 text-center">
                  <small class="text-muted">
                    预览图 | 格式: {{ outputFormat }} | 大小: {{ editedImageSize ? (editedImageSize / 1024).toFixed(2) + ' KB' : '计算中...' }}
                  </small>
                </div>
              </div>
              <div class="col-md-6">
                <div class="image-info">
                  <h6>图片信息</h6>
                  <ul class="list-group">
                    <li class="list-group-item d-flex justify-content-between">
                      <span>原始尺寸:</span>
                      <span>{{ originalWidth }} × {{ originalHeight }} px</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                      <span>输出尺寸:</span>
                      <span>{{ outputWidth }} × {{ outputHeight }} px</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                      <span>文件格式:</span>
                      <span>{{ outputFormat.split('/')[1].toUpperCase() }}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                      <span>文件大小:</span>
                      <span>{{ editedImageSize ? (editedImageSize / 1024).toFixed(2) + ' KB' : '计算中...' }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'

export default {
  name: 'ImageEditor',
  setup() {
    // 响应式数据
    const imageSrc = ref(null)
    const editedImageSrc = ref(null)
    const imageElement = ref(null)
    const fileInput = ref(null)
    const cropper = ref(null)
    const editedImageSize = ref(0)

    // 编辑参数
    const selectedAspectRatio = ref('NaN')
    const rotation = ref(0)
    const scale = ref(100)
    const outputFormat = ref('image/jpeg')
    const quality = ref(85)
    const outputWidth = ref(800)
    const outputHeight = ref(600)
    const maintainAspectRatio = ref(true)
    const originalWidth = ref(0)
    const originalHeight = ref(0)
    const isCopied = ref(false)

    // 初始化Cropper
    const initCropper = () => {
      if (imageElement.value && imageSrc.value) {
        cropper.value = new Cropper(imageElement.value, {
          aspectRatio: selectedAspectRatio.value === 'NaN' ? NaN : eval(selectedAspectRatio.value),
          viewMode: 1,
          autoCropArea: 1,
          responsive: true,
          scalable: true,
          zoomable: true,
          rotatable: true
        })
      }
    }

    // 处理文件上传
    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (!file) return

      // 检查文件类型和大小
      if (!file.type.includes('image/')) {
        alert('请选择图片文件')
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        alert('图片大小不能超过10MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        imageSrc.value = e.target.result

        // 获取原始图片尺寸
        const img = new Image()
        img.onload = () => {
          originalWidth.value = img.width
          originalHeight.value = img.height
          outputWidth.value = img.width
          outputHeight.value = img.height
        }
        img.src = e.target.result

        nextTick(() => {
          if (cropper.value) {
            cropper.value.destroy()
          }
          initCropper()
        })
      }
      reader.readAsDataURL(file)
    }

    // 设置裁剪比例
    const setAspectRatio = () => {
      if (cropper.value) {
        const ratio = selectedAspectRatio.value === 'NaN' ? NaN : eval(selectedAspectRatio.value)
        cropper.value.setAspectRatio(ratio)
      }
    }

    // 旋转图片
    const rotateImage = () => {
      if (cropper.value) {
        cropper.value.rotateTo(rotation.value)
      }
    }

    // 缩放图片
    const scaleImage = () => {
      if (cropper.value) {
        const scaleValue = scale.value / 100
        cropper.value.scale(scaleValue)
      }
    }

    // 放大
    const zoomIn = () => {
      if (cropper.value) {
        cropper.value.zoom(0.1)
      }
    }

    // 缩小
    const zoomOut = () => {
      if (cropper.value) {
        cropper.value.zoom(-0.1)
      }
    }

    // 水平翻转
    const flipHorizontal = () => {
      if (cropper.value) {
        cropper.value.scaleX(-cropper.value.getData().scaleX || -1)
      }
    }

    // 垂直翻转
    const flipVertical = () => {
      if (cropper.value) {
        cropper.value.scaleY(-cropper.value.getData().scaleY || -1)
      }
    }

    // 应用裁剪并生成新图片
    const cropImage = () => {
      if (cropper.value) {
        // 获取裁剪后的Canvas
        const canvas = cropper.value.getCroppedCanvas({
          width: outputWidth.value,
          height: outputHeight.value
        })

        // 转换为DataURL
        editedImageSrc.value = canvas.toDataURL(outputFormat.value, quality.value / 100)

        // 计算文件大小
        editedImageSize.value = Math.floor((editedImageSrc.value.length * 3) / 4)
      }
    }

    // 下载图片
    const downloadImage = () => {
      if (editedImageSrc.value) {
        const link = document.createElement('a')
        link.download = `edited-image.${outputFormat.value.split('/')[1]}`
        link.href = editedImageSrc.value
        link.click()
      }
    }

    // 复制Base64到剪贴板
    const copyToClipboard = async () => {
      if (editedImageSrc.value) {
        try {
          await navigator.clipboard.writeText(editedImageSrc.value)
          isCopied.value = true
          setTimeout(() => {
            isCopied.value = false
          }, 2000)
        } catch (err) {
          console.error('复制失败: ', err)
          // 降级方案
          const textArea = document.createElement('textarea')
          textArea.value = editedImageSrc.value
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          isCopied.value = true
          setTimeout(() => {
            isCopied.value = false
          }, 2000)
        }
      }
    }

    // 重置编辑器
    const resetEditor = () => {
      if (cropper.value) {
        cropper.value.destroy()
        cropper.value = null
      }
      imageSrc.value = null
      editedImageSrc.value = null
      rotation.value = 0
      scale.value = 100
      selectedAspectRatio.value = 'NaN'
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }

    // 监听宽高比保持
    const updateOutputDimensions = () => {
      if (maintainAspectRatio.value && originalWidth.value && originalHeight.value) {
        const aspectRatio = originalWidth.value / originalHeight.value
        outputHeight.value = Math.round(outputWidth.value / aspectRatio)
      }
    }

    // 监听输出宽度变化
    const watchOutputWidth = () => {
      if (maintainAspectRatio.value) {
        updateOutputDimensions()
      }
    }

    onMounted(() => {
      // 初始化任何需要的设置
    })

    return {
      imageSrc,
      editedImageSrc,
      imageElement,
      fileInput,
      editedImageSize,
      selectedAspectRatio,
      rotation,
      scale,
      outputFormat,
      quality,
      outputWidth,
      outputHeight,
      maintainAspectRatio,
      originalWidth,
      originalHeight,
      isCopied,
      handleFileUpload,
      setAspectRatio,
      rotateImage,
      scaleImage,
      zoomIn,
      zoomOut,
      flipHorizontal,
      flipVertical,
      cropImage,
      downloadImage,
      copyToClipboard,
      resetEditor,
      updateOutputDimensions,
      watchOutputWidth
    }
  }
}
</script>

<style scoped>
.cropper-container {
  max-height: 80vh; /* 用视口高度而不是固定像素 */
  overflow: hidden;
}

.preview-container {
  max-height: 80vh;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 10px;
}

.image-info {
  height: 100%;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.btn {
  border-radius: 0.375rem;
}

.form-range {
  padding: 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .cropper-container {
    max-height: 300px;
  }

  .preview-container {
    max-height: 200px;
  }
}
</style>