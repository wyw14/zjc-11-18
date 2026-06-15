import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import StorySquare from './views/StorySquare.vue'
import CreateStory from './views/CreateStory.vue'
import StoryDetail from './views/StoryDetail.vue'

const routes = [
  { path: '/', name: 'StorySquare', component: StorySquare },
  { path: '/create', name: 'CreateStory', component: CreateStory },
  { path: '/story/:id', name: 'StoryDetail', component: StoryDetail }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')
