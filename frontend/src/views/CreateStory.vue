<template>
  <div class="create-story">
    <div class="page-header">
      <h1 class="page-title">创建新故事</h1>
      <p class="page-subtitle">设置封面信息，开启精彩故事</p>
    </div>

    <div class="content-wrapper">
      <div class="form-section">
        <div class="cover-select-section">
          <h2 class="section-title">
            <span class="section-icon">🎨</span>
            选择封面信息
          </h2>

          <div class="cover-preview-wrapper">
            <div class="preview-label">封面预览</div>
            <div class="cover-preview-card">
              <div class="preview-cover" :style="{ background: selectedCoverColor }">
                <span class="preview-emoji">{{ selectedEmoji }}</span>
              </div>
              <div class="preview-body">
                <div class="preview-title" :class="{ placeholder: !formData.title }">
                  {{ formData.title || '故事标题预览' }}
                </div>
                <div class="preview-meta">
                  <span>✍️ {{ formData.author || '作者' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="select-group">
            <label class="select-label">
              <span class="label-text">封面色</span>
              <span class="label-hint">选择一个颜色作为卡片封面</span>
            </label>
            <div class="color-grid">
              <button
                v-for="color in coverColors"
                :key="color"
                type="button"
                class="color-item"
                :class="{ active: selectedCoverColor === color }"
                :style="{ background: color }"
                @click="selectedCoverColor = color"
              >
                <span v-if="selectedCoverColor === color" class="check-mark">✓</span>
              </button>
            </div>
          </div>

          <div class="select-group">
            <label class="select-label">
              <span class="label-text">代表表情</span>
              <span class="label-hint">选择一个表情代表故事主题</span>
            </label>
            <div class="emoji-grid">
              <button
                v-for="emoji in emojis"
                :key="emoji"
                type="button"
                class="emoji-item"
                :class="{ active: selectedEmoji === emoji }"
                @click="selectedEmoji = emoji"
              >
                {{ emoji }}
              </button>
            </div>
          </div>
        </div>

        <div class="form-group">
          <h2 class="section-title">
            <span class="section-icon">📝</span>
            填写故事信息
          </h2>

          <div class="field-wrapper">
            <label class="field-label" for="title">故事标题 <span class="required">*</span></label>
            <input
              id="title"
              v-model="formData.title"
              type="text"
              class="field-input"
              placeholder="给你的故事起个吸引人的标题"
              maxlength="50"
            />
            <div class="field-counter">{{ formData.title.length }}/50</div>
          </div>

          <div class="field-wrapper">
            <label class="field-label" for="author">作者名称 <span class="required">*</span></label>
            <input
              id="author"
              v-model="formData.author"
              type="text"
              class="field-input"
              placeholder="输入你的笔名或昵称"
              maxlength="20"
            />
            <div class="field-counter">{{ formData.author.length }}/20</div>
          </div>

          <div class="field-wrapper">
            <label class="field-label" for="content">开篇内容 <span class="required">*</span></label>
            <textarea
              id="content"
              v-model="formData.content"
              class="field-textarea"
              placeholder="写下故事的开头，为后续的创作者们设定基调..."
              :maxlength="maxChars"
              rows="8"
            ></textarea>
            <div class="field-counter">{{ formData.content.length }}/{{ maxChars }}</div>
          </div>
        </div>

        <div v-if="errorMsg" class="error-message">
          <span>⚠️</span>
          {{ errorMsg }}
        </div>

        <div class="action-buttons">
          <router-link to="/" class="btn-secondary">返回广场</router-link>
          <button
            type="button"
            class="btn-primary"
            :disabled="submitting"
            @click="handleSubmit"
          >
            <span v-if="submitting" class="btn-spinner"></span>
            <span>{{ submitting ? '创建中...' : '创建故事' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const coverColors = ref([])
const emojis = ref([])
const maxChars = ref(500)
const selectedCoverColor = ref('')
const selectedEmoji = ref('')
const submitting = ref(false)
const errorMsg = ref('')

const formData = reactive({
  title: '',
  author: '',
  content: ''
})

async function fetchConfig() {
  try {
    const res = await fetch('/api/config')
    if (res.ok) {
      const config = await res.json()
      coverColors.value = config.coverColors || []
      emojis.value = config.emojis || []
      maxChars.value = config.maxCharsPerStory || 500
      if (coverColors.value.length > 0 && !selectedCoverColor.value) {
        selectedCoverColor.value = coverColors.value[Math.floor(Math.random() * coverColors.value.length)]
      }
      if (emojis.value.length > 0 && !selectedEmoji.value) {
        selectedEmoji.value = emojis.value[Math.floor(Math.random() * emojis.value.length)]
      }
    }
  } catch (err) {
    console.error('获取配置失败:', err)
  }
}

function validateForm() {
  if (!formData.title.trim()) {
    errorMsg.value = '请输入故事标题'
    return false
  }
  if (!formData.author.trim()) {
    errorMsg.value = '请输入作者名称'
    return false
  }
  if (!formData.content.trim()) {
    errorMsg.value = '请输入开篇内容'
    return false
  }
  if (formData.content.length > maxChars.value) {
    errorMsg.value = `开篇内容不能超过 ${maxChars.value} 字`
    return false
  }
  errorMsg.value = ''
  return true
}

async function handleSubmit() {
  if (!validateForm()) return
  submitting.value = true
  errorMsg.value = ''
  try {
    const res = await fetch('/api/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.title.trim(),
        author: formData.author.trim(),
        content: formData.content.trim(),
        coverColor: selectedCoverColor.value,
        emoji: selectedEmoji.value
      })
    })
    const data = await res.json()
    if (res.ok) {
      router.push(`/story/${data.id}`)
    } else {
      errorMsg.value = data.error || '创建失败，请重试'
    }
  } catch (err) {
    console.error('创建故事失败:', err)
    errorMsg.value = '网络错误，请稍后重试'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchConfig()
})
</script>

<style scoped>
.create-story {
  min-height: 100%;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 15px;
  color: #666;
}

.content-wrapper {
  max-width: 760px;
  margin: 0 auto;
}

.form-section {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-icon {
  font-size: 22px;
}

.cover-select-section {
  padding-bottom: 28px;
  margin-bottom: 28px;
  border-bottom: 1px solid #f0f0f0;
}

.cover-preview-wrapper {
  margin-bottom: 24px;
}

.preview-label {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  margin-bottom: 10px;
}

.cover-preview-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  max-width: 320px;
  border: 2px solid #f0f0f0;
}

.preview-cover {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.preview-emoji {
  font-size: 44px;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.15));
  transition: all 0.3s ease;
}

.preview-body {
  padding: 14px 16px;
  background: #fafafa;
}

.preview-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 6px;
  line-height: 1.4;
}

.preview-title.placeholder {
  color: #bbb;
  font-weight: 500;
}

.preview-meta {
  font-size: 12px;
  color: #888;
}

.select-group {
  margin-bottom: 22px;
}

.select-group:last-child {
  margin-bottom: 0;
}

.select-label {
  display: block;
  margin-bottom: 12px;
}

.label-text {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-right: 8px;
}

.label-hint {
  font-size: 12px;
  color: #999;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
  gap: 10px;
}

.color-item {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border: 3px solid transparent;
  position: relative;
}

.color-item:hover {
  transform: scale(1.1);
}

.color-item.active {
  border-color: #333;
  box-shadow: 0 0 0 2px #fff, 0 0 0 5px rgba(51, 51, 51, 0.2);
}

.check-mark {
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(52px, 1fr));
  gap: 10px;
}

.emoji-item {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: #f5f7fa;
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.emoji-item:hover {
  background: #eef1f6;
  transform: scale(1.1);
}

.emoji-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.field-wrapper {
  margin-bottom: 22px;
  position: relative;
}

.field-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.required {
  color: #ff4757;
}

.field-input,
.field-textarea {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  font-size: 15px;
  color: #333;
  background: #fafafa;
  transition: all 0.2s ease;
  resize: vertical;
}

.field-input:focus,
.field-textarea:focus {
  border-color: #667eea;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.field-textarea {
  line-height: 1.7;
  min-height: 160px;
}

.field-counter {
  position: absolute;
  right: 12px;
  bottom: 10px;
  font-size: 12px;
  color: #aaa;
}

.error-message {
  background: #fff5f5;
  border: 1px solid #ffd4d4;
  color: #ff4757;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.btn-secondary {
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  background: #f5f7fa;
  color: #555;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #eef1f6;
  color: #333;
}

.btn-primary {
  padding: 14px 32px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
