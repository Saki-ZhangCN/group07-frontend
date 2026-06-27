<template>
  <div class="exercise-center">
    <div class="filter-bar">
      <el-select v-model="categoryFilter" placeholder="题目类别">
        <el-option label="全部" value="" />
        <el-option label="Java" value="java" />
        <el-option label="Python" value="python" />
      </el-select>
      <el-button type="primary">开始练习</el-button>
    </div>
    
    <div class="exercise-stats">
      <div class="stat-item">
        <span class="stat-value">{{ stats.total }}</span>
        <span class="stat-label">总题数</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.completed }}</span>
        <span class="stat-label">已练习</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.correctRate }}%</span>
        <span class="stat-label">正确率</span>
      </div>
    </div>
    
    <div class="exercise-list">
      <div class="exercise-card" v-for="ex in exercises" :key="ex.id">
        <h3 class="ex-title">{{ ex.title }}</h3>
        <div class="ex-meta">
          <span class="ex-category">{{ ex.category }}</span>
          <span class="ex-count">{{ ex.count }}题</span>
        </div>
        <el-button type="primary" size="small">开始练习</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const categoryFilter = ref('')

const stats = ref({
  total: 500,
  completed: 120,
  correctRate: 85
})

const exercises = ref([
  { id: '1', title: 'Java基础语法', category: 'Java', count: 50 },
  { id: '2', title: '面向对象编程', category: 'Java', count: 45 },
  { id: '3', title: '集合框架', category: 'Java', count: 40 },
  { id: '4', title: 'Python基础', category: 'Python', count: 30 }
])
</script>

<style scoped>
.exercise-center {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
}

.filter-bar {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.exercise-stats {
  display: flex;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--primary-500);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

.exercise-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

.exercise-card {
  padding: var(--spacing-lg);
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-lg);
}

.ex-title {
  font-size: var(--font-size-lg);
  color: var(--gray-800);
}

.ex-meta {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  color: var(--gray-500);
  font-size: var(--font-size-sm);
}
</style>