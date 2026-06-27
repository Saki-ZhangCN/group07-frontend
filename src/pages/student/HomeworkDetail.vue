<template>
  <div class="homework-detail">
    <h1 class="hw-title">{{ homework.title }}</h1>
    <div class="hw-info">
      <span class="hw-course">{{ homework.course }}</span>
      <span class="hw-deadline">截止时间：{{ homework.deadline }}</span>
    </div>
    
    <div class="hw-content">
      <h3>题目内容</h3>
      <div class="question-list">
        <div class="question-item" v-for="(q, index) in homework.questions" :key="q.id">
          <div class="question-header">
            <span class="question-number">{{ index + 1 }}.</span>
            <span class="question-type">{{ q.type }}</span>
          </div>
          <div class="question-content">{{ q.content }}</div>
          <div class="question-options" v-if="q.type === '选择题'">
            <el-radio-group v-model="answers[q.id]">
              <el-radio label="A">{{ q.options.A }}</el-radio>
              <el-radio label="B">{{ q.options.B }}</el-radio>
              <el-radio label="C">{{ q.options.C }}</el-radio>
              <el-radio label="D">{{ q.options.D }}</el-radio>
            </el-radio-group>
          </div>
        </div>
      </div>
    </div>
    
    <div class="hw-actions">
      <el-button type="primary" size="large">提交作业</el-button>
      <el-button size="large">保存草稿</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const answers = ref({})

const homework = ref({
  id: '1',
  title: '第三章课后习题',
  course: 'Java编程基础',
  deadline: '2024-01-25 23:59',
  questions: [
    {
      id: 'q1',
      type: '选择题',
      content: 'Java中以下哪个关键字用于定义类？',
      options: {
        A: 'class',
        B: 'Class',
        C: 'define',
        D: 'new'
      }
    },
    {
      id: 'q2',
      type: '选择题',
      content: 'Java中基本数据类型int的默认值是？',
      options: {
        A: 'null',
        B: '0',
        C: '1',
        D: 'undefined'
      }
    }
  ]
})
</script>

<style scoped>
.homework-detail {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
}

.hw-title {
  font-size: var(--font-size-2xl);
  color: var(--gray-800);
}

.hw-info {
  display: flex;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-md);
  color: var(--gray-500);
  font-size: var(--font-size-sm);
}

.hw-content {
  margin-top: var(--spacing-xl);
}

.hw-content h3 {
  font-size: var(--font-size-lg);
  color: var(--gray-800);
  margin-bottom: var(--spacing-lg);
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.question-item {
  padding: var(--spacing-lg);
  background: var(--gray-50);
  border-radius: var(--radius-lg);
}

.question-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.question-number {
  font-weight: 600;
  color: var(--primary-500);
}

.question-type {
  font-size: var(--font-size-xs);
  padding: 4px 12px;
  background: var(--primary-50);
  color: var(--primary-500);
  border-radius: var(--radius-full);
}

.question-content {
  font-size: var(--font-size-base);
  color: var(--gray-800);
}

.question-options {
  margin-top: var(--spacing-lg);
}

.hw-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}
</style>