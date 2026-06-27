<template>
  <div class="homework-manage">
    <h1>作业管理</h1>
    <div class="homework-list">
      <div class="homework-card" v-for="hw in homeworks" :key="hw.id">
        <h3>{{ hw.title }}</h3>
        <p>{{ hw.course }}</p>
        <el-button type="primary" size="small">编辑</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const homeworks = ref([
  { id: '1', title: '第一章习题', course: 'Java编程基础' },
  { id: '2', title: '第二章习题', course: 'Java编程基础' }
])
</script>

<style scoped>
.homework-manage {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
}

.homework-manage h1 {
  font-size: var(--font-size-xl);
  color: var(--gray-800);
  margin-bottom: var(--spacing-xl);
}

.homework-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.homework-card {
  padding: var(--spacing-lg);
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-lg);
}
</style>