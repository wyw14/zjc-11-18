<template>
  <div class="story-square">
    <div class="page-header">
      <div class="header-text">
        <h1 class="page-title">故事广场</h1>
        <p class="page-subtitle">发现有趣的故事，开启你的创作之旅</p>
      </div>
      <router-link to="/create" class="create-story-btn">
        <span>➕</span>
        <span>创建新故事</span>
      </router-link>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="stories.length === 0" class="empty-state">
      <div class="empty-icon">📭</div>
      <h3>还没有故事</h3>
      <p>成为第一个创作故事的人吧！</p>
      <router-link to="/create" class="create-first-btn">立即创建</router-link>
    </div>

    <div v-else class="stories-grid">
      <router-link
        v-for="story in stories"
        :key="story.id"
        :to="`/story/${story.id}`"
        class="story-card"
      >
        <div class="card-cover" :style="{ background: story.coverColor }">
          <span class="card-emoji">{{ story.emoji }}</span>
        </div>
        <div class="card-content">
          <h3 class="card-title">{{ story.title }}</h3>
          <p class="card-preview">{{ story.preview }}</p>
          <div class="card-meta">
            <div class="meta-item">
              <span class="meta-icon">✍️</span>
              <span>{{ story.lastAuthor }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-icon">👥</span>
              <span>{{ story.entriesCount }} 人参与</span>
            </div>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const stories = ref([])
const loading = ref(true)

async function fetchStories() {
  try {
    const res = await fetch('/api/stories')
    if (res.ok) {
      stories.value = await res.json()
    }
  } catch (err) {
    console.error('获取故事列表失败:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStories()
})
</script>

<style scoped>
.story-square {
  min-height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
  gap: 24px;
  flex-wrap: wrap;
}

.header-text {
  flex: 1;
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

.create-story-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  white-space: nowrap;
}

.create-story-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
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
  margin-bottom: 24px;
}

.create-first-btn {
  padding: 12px 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.create-first-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.stories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.story-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.story-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.card-cover {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.card-cover::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 100%);
}

.card-emoji {
  font-size: 56px;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
}

.card-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 10px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-preview {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
  border-top: 1px solid #f0f0f0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #888;
}

.meta-icon {
  font-size: 14px;
}
</style>
