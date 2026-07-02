<template>
  <div class="wrong-book">
    <div class="wb-header">
      <h2>错题本</h2>
      <el-button type="primary">开始复习</el-button>
    </div>
    
    <div class="wb-stats">
      <div class="stat-item">
        <span class="stat-value">{{ wrongQuestions.length }}</span>
        <span class="stat-label">错题总数</span>
      </div>
    </div>
    
    <div class="wb-list">
      <div class="wb-card" v-for="q in wrongQuestions" :key="q.id">
        <div class="wb-meta">
          <span class="wb-course">{{ q.course }}</span>
          <span class="wb-date">错误时间：{{ q.date }}</span>
        </div>
        <div class="wb-question">{{ q.content }}</div>
        <div class="wb-actions">
          <el-button size="small" @click="showAnalysis(q)">查看解析</el-button>
          <el-button size="small" type="primary" @click="retry(q)">重新练习</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getWrongBook, retryWrongQuestion } from '../../api/homework.js'

const wrongQuestions = ref([])
async function load() {
  wrongQuestions.value = (await getWrongBook()).map(item => ({
    ...item, course: item.knowledge || '课程练习', date: item.lastWrongTime
  }))
}
function showAnalysis(question) { ElMessageBox.alert(question.analysis || '暂无解析', '题目解析') }
async function retry(question) {
  const { value } = await ElMessageBox.prompt('请输入答案', '重新练习')
  const result = await retryWrongQuestion(question.questionId, { answer: value })
  ElMessage[result.correct ? 'success' : 'warning'](result.message)
  await load()
}
onMounted(load)
</script>

<style scoped>
.wrong-book {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
}

.wb-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
}

.wb-header h2 {
  font-size: var(--font-size-xl);
  color: var(--gray-800);
}

.wb-stats {
  margin-bottom: var(--spacing-xl);
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--red-500);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

.wb-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.wb-card {
  padding: var(--spacing-lg);
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-lg);
}

.wb-meta {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  color: var(--gray-500);
  font-size: var(--font-size-sm);
}

.wb-question {
  color: var(--gray-800);
}

.wb-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}
</style>
