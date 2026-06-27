<template>
  <div class="live-manage">
    <h1>直播管理</h1>
    <div class="live-list">
      <div class="live-card" v-for="live in lives" :key="live.id">
        <h3>{{ live.title }}</h3>
        <p>{{ live.course }}</p>
        <div class="live-time">{{ live.time }}</div>
        <el-button type="primary" size="small">进入直播</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const lives = ref([
  { id: '1', title: 'Java基础直播', course: 'Java编程基础', time: '今晚 20:00' },
  { id: '2', title: 'Python实战直播', course: 'Python数据分析', time: '明天 19:00' }
])
</script>

<style scoped>
.live-manage {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
}

.live-manage h1 {
  font-size: var(--font-size-xl);
  color: var(--gray-800);
  margin-bottom: var(--spacing-xl);
}

.live-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.live-card {
  padding: var(--spacing-lg);
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-lg);
}
</style>