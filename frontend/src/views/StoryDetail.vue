<template>
  <div class="story-detail">
    <router-link to="/" class="back-link">
      <span>←</span>
      <span>返回广场</span>
    </router-link>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="!story" class="empty-state">
      <div class="empty-icon">❓</div>
      <h3>故事不存在</h3>
      <p>该故事可能已被删除</p>
    </div>

    <div v-else class="story-content">
      <div class="story-header-card">
        <div class="story-cover" :style="{ background: story.coverColor }">
          <span class="story-emoji">{{ story.emoji }}</span>
        </div>
        <div class="story-info">
          <h1 class="story-title">{{ story.title }}</h1>
          <div class="story-meta-row">
            <div class="meta-tag">
              <span>👥</span>
              <span>{{ story.entries.length }}/{{ maxParticipants }} 人参与</span>
            </div>
            <div class="meta-tag">
              <span>📅</span>
              <span>{{ formatDate(story.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="entries-section">
        <h2 class="section-title">故事内容</h2>
        <div class="entries-list">
          <div
            v-for="(entry, index) in story.entries"
            :key="entry.id"
            class="entry-item"
          >
            <div class="entry-header">
              <div class="entry-author-info">
                <div class="author-avatar" :style="{ background: getAvatarColor(index) }">
                  {{ entry.author.charAt(0) }}
                </div>
                <div>
                  <div class="entry-author">{{ entry.author }}</div>
                  <div class="entry-time">{{ formatDate(entry.createdAt) }}</div>
                </div>
              </div>
              <div class="entry-number">第 {{ index + 1 }} 棒</div>
            </div>
            <div class="entry-content">
              <p>{{ entry.content }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="canContinue" class="continue-section">
        <h2 class="section-title">
          <span class="title-icon">✏️</span>
          续写故事
        </h2>
        <div class="continue-form">
          <div class="field-wrapper">
            <label class="field-label" for="continue-author">你的昵称 <span class="required">*</span></label>
            <input
              id="continue-author"
              v-model="continueForm.author"
              type="text"
              class="field-input"
              placeholder="输入你的昵称"
              maxlength="20"
            />
          </div>
          <div class="field-wrapper">
            <label class="field-label" for="continue-content">续写内容 <span class="required">*</span></label>
            <textarea
              id="continue-content"
              v-model="continueForm.content"
              class="field-textarea"
              placeholder="接过上一棒，继续这个故事..."
              :maxlength="maxChars"
              rows="6"
            ></textarea>
            <div class="field-counter">{{ continueForm.content.length }}/{{ maxChars }}</div>
          </div>

          <div v-if="errorMsg" class="error-message">
            <span>⚠️</span>
            {{ errorMsg }}
          </div>

          <div class="submit-row">
            <button
              type="button"
              class="submit-btn"
              :disabled="submitting"
              @click="handleContinue"
            >
              <span v-if="submitting" class="btn-spinner"></span>
              <span>{{ submitting ? '提交中...' : '提交续写' }}</span>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="completed-section">
        <div class="completed-card">
          <div class="completed-icon">🎉</div>
          <h3>故事已完成</h3>
          <p>已有 {{ story.entries.length }} 位创作者完成了这个故事</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const story = ref(null)
const loading = ref(true)
const maxChars = ref(500)
const maxParticipants = ref(10)
const submitting = ref(false)
const errorMsg = ref('')

const continueForm = reactive({
  author: '',
  content: ''
})

const PRESET_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8B500', '#52BE80'
]
const PRESET_EMOJIS = [
  '📖', '✨', '🌟', '🎭', '🏰', '🌈', '🦄', '🌙', '☀️', '🌸',
  '🎨', '🎪', '🚀', '🗺️', '🔮', '🎵', '❤️', '🔥', '💎', '🌊'
]
const DEFAULT_COVER_COLOR = '#85C1E9'
const DEFAULT_EMOJI = '📖'

function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

function normalizeStory(rawStory) {
  if (!rawStory) return null
  let coverColor = rawStory.coverColor
  let emoji = rawStory.emoji
  if (!coverColor || !emoji) {
    const seed = rawStory.id || rawStory.title || String(Date.now())
    const hash = hashString(seed)
    if (!coverColor) coverColor = PRESET_COLORS[hash % PRESET_COLORS.length] || DEFAULT_COVER_COLOR
    if (!emoji) emoji = PRESET_EMOJIS[hash % PRESET_EMOJIS.length] || DEFAULT_EMOJI
  }
  return { ...rawStory, coverColor, emoji }
}

const canContinue = computed(() => {
  return story.value && story.value.entries.length < maxParticipants.value
})

function getAvatarColor(index) {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ]
  return colors[index % colors.length]
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function fetchConfig() {
  try {
    const res = await fetch('/api/config')
    if (res.ok) {
      const config = await res.json()
      maxChars.value = config.maxCharsPerStory || 500
      maxParticipants.value = config.maxParticipants || 10
    }
  } catch (err) {
    console.error('获取配置失败:', err)
  }
}

async function fetchStory() {
  loading.value = true
  try {
    const res = await fetch(`/api/stories/${route.params.id}`)
    if (res.ok) {
      const data = await res.json()
      story.value = normalizeStory(data)
    } else {
      story.value = null
    }
  } catch (err) {
    console.error('获取故事详情失败:', err)
    story.value = null
  } finally {
    loading.value = false
  }
}

async function handleContinue() {
  if (!continueForm.author.trim()) {
    errorMsg.value = '请输入你的昵称'
    return
  }
  if (!continueForm.content.trim()) {
    errorMsg.value = '请输入续写内容'
    return
  }
  if (continueForm.content.length > maxChars.value) {
    errorMsg.value = `续写内容不能超过 ${maxChars.value} 字`
    return
  }

  submitting.value = true
  errorMsg.value = ''

  try {
    const res = await fetch(`/api/stories/${route.params.id}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author: continueForm.author.trim(),
        content: continueForm.content.trim()
      })
    })
    const data = await res.json()
    if (res.ok) {
      story.value = normalizeStory(data)
      continueForm.content = ''
      errorMsg.value = ''
    } else {
      errorMsg.value = data.error || '提交失败，请重试'
    }
  } catch (err) {
    console.error('提交续写失败:', err)
    errorMsg.value = '网络错误，请稍后重试'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchConfig()
  fetchStory()
})
</script>

<style scoped>
.story-detail {
  min-height: 100%;
  max-width: 760px;
  margin: 0 auto;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #667eea;
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 24px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.back-link:hover {
  background: rgba(102, 126, 234, 0.08);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: #666;
  font-size: 15px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 8px;
}

.empty-state p {
  color: #666;
  font-size: 15px;
}

.story-header-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 28px;
}

.story-cover {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.story-cover::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.08) 100%);
}

.story-emoji {
  font-size: 72px;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
}

.story-info {
  padding: 24px 28px 28px;
}

.story-title {
  font-size: 26px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 14px;
  line-height: 1.4;
}

.story-meta-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f5f7fa;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-icon {
  font-size: 22px;
}

.entries-section {
  margin-bottom: 32px;
}

.entries-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.entry-item {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.entry-author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 16px;
}

.entry-author {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.entry-time {
  font-size: 12px;
  color: #999;
}

.entry-number {
  padding: 4px 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
}

.entry-content {
  font-size: 15px;
  line-height: 1.8;
  color: #333;
}

.entry-content p {
  white-space: pre-wrap;
  word-break: break-word;
}

.continue-section {
  background: #fff;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.continue-form {
  margin-top: 8px;
}

.field-wrapper {
  margin-bottom: 20px;
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
  min-height: 120px;
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
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.submit-row {
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
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

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.submit-btn:disabled {
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

.completed-section {
  display: flex;
  justify-content: center;
}

.completed-card {
  background: #fff;
  border-radius: 16px;
  padding: 48px 32px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 420px;
}

.completed-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.completed-card h3 {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 8px;
}

.completed-card p {
  font-size: 14px;
  color: #666;
}
</style>
