<template>
  <div class="homework-detail">
    <h1 class="hw-title">{{ homework.title }}</h1>
    <div class="hw-info">
      <span class="hw-course">{{ homework.course }}</span>
      <span class="hw-deadline">截止时间：{{ formatDate(homework.deadline) }}</span>
      <span class="hw-score">总分：{{ homework.totalScore }}分</span>
    </div>

    <div v-if="result && result.status === 'graded'" class="result-section">
      <div class="result-header">
        <span class="result-status">已批改</span>
        <span class="result-score" :class="result.score >= homework.passScore ? 'pass' : 'fail'">
          得分：{{ result.score }}/{{ result.totalScore }}
        </span>
      </div>
      <div v-if="result.comment" class="result-comment">
        <span class="comment-label">教师评语：</span>
        {{ result.comment }}
      </div>
      <div class="result-meta">
        <span>提交时间：{{ result.submitTime }}</span>
        <span>批改时间：{{ result.gradeTime }}</span>
      </div>
    </div>

    <div class="hw-content">
      <h3>题目内容</h3>
      <div class="question-list">
        <div class="question-item" v-for="(q, index) in homework.questions" :key="q.id">
          <div class="question-header">
            <span class="question-number">{{ index + 1 }}.</span>
            <span class="question-type">{{ getQuestionTypeName(q.type) }}</span>
            <span class="question-score">（{{ q.score }}分）</span>
            <span v-if="getAnswerResult(q.id)" class="answer-status" :class="getAnswerResult(q.id).correct ? 'correct' : 'wrong'">
              {{ getAnswerResult(q.id).correct ? '正确' : '错误' }}
            </span>
          </div>
          <div class="question-content">{{ q.content }}</div>
          
          <template v-if="!isGraded">
              <div v-if="q.type === 'single' || q.type === 'judge'" class="question-options">
                <el-radio-group v-model="answers[q.id]">
                  <el-radio v-for="(option, optIndex) in q.options" :key="optIndex" :label="option">{{ option }}</el-radio>
                </el-radio-group>
              </div>
              <div v-else-if="q.type === 'multiple'" class="question-options">
                <el-checkbox-group v-model="answers[q.id]">
                  <el-checkbox v-for="(option, optIndex) in q.options" :key="optIndex" :label="option">{{ option }}</el-checkbox>
                </el-checkbox-group>
              </div>
              <div v-else class="question-textarea">
                <el-textarea v-model="answers[q.id]" :rows="4" placeholder="请输入答案"></el-textarea>
              </div>
            </template>

          <div v-if="isGraded" class="answer-result">
            <div class="answer-row">
              <span class="label">你的答案：</span>
              <span class="value" :class="getAnswerResult(q.id)?.correct ? 'correct' : 'wrong'">
                {{ getAnswerResult(q.id)?.answer || '未作答' }}
              </span>
            </div>
            <div class="answer-row">
              <span class="label">标准答案：</span>
              <span class="value correct">{{ getAnswerResult(q.id)?.standardAnswer }}</span>
            </div>
            <div v-if="getAnswerResult(q.id)?.teacherComment" class="answer-row">
              <span class="label">教师点评：</span>
              <span class="value">{{ getAnswerResult(q.id)?.teacherComment }}</span>
            </div>
            <div v-if="getAnswerResult(q.id)?.analysis" class="answer-row">
              <span class="label">解析：</span>
              <span class="value">{{ getAnswerResult(q.id)?.analysis }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="hw-actions" v-if="!isGraded">
      <el-button type="primary" size="large" :loading="submitting" @click="submit">提交作业</el-button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getHomeworkDetail, getHomeworkResult, submitHomework } from '../../api/homework.js'
import { formatDate } from '../../utils/date.js'

const answers = ref({})
const route = useRoute()
const submitting = ref(false)
const result = ref(null)

const homework = ref({ questions: [], passScore: 60 })

const isGraded = computed(() => result.value && result.value.status === 'graded')

function getQuestionTypeName(type) {
  const types = {
    'single': '单选题',
    'multiple': '多选题',
    'judge': '判断题',
    'fill': '填空题',
    'essay': '问答题'
  }
  return types[type] || type
}

function getAnswerResult(questionId) {
  if (!result.value || !result.value.answers) return null
  return result.value.answers.find(a => a.questionId === questionId)
}

onMounted(async () => { 
  homework.value = await getHomeworkDetail(route.params.id)
  try {
    result.value = await getHomeworkResult(route.params.id)
  } catch (e) {
    result.value = null
  }
})

async function submit() {
  submitting.value = true
  try {
    await submitHomework(route.params.id, { answers: answers.value })
    ElMessage.success('提交成功')
    result.value = await getHomeworkResult(route.params.id)
  } finally { 
    submitting.value = false 
  }
}
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

.result-section {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--gray-50);
  border-radius: var(--radius-lg);
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.result-status {
  font-size: var(--font-size-sm);
  padding: 4px 12px;
  background: rgba(34, 197, 94, 0.1);
  color: var(--green-500);
  border-radius: var(--radius-full);
}

.result-score {
  font-size: var(--font-size-xl);
  font-weight: 600;
}

.result-score.pass {
  color: var(--green-500);
}

.result-score.fail {
  color: var(--red-500);
}

.result-comment {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background: white;
  border-radius: var(--radius-md);
}

.comment-label {
  font-weight: 500;
  color: var(--gray-600);
}

.result-meta {
  display: flex;
  gap: var(--spacing-lg);
  font-size: var(--font-size-sm);
  color: var(--gray-500);
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

.answer-status {
  font-size: var(--font-size-xs);
  padding: 4px 12px;
  border-radius: var(--radius-full);
}

.answer-status.correct {
  background: rgba(34, 197, 94, 0.1);
  color: var(--green-500);
}

.answer-status.wrong {
  background: rgba(239, 68, 68, 0.1);
  color: var(--red-500);
}

.question-content {
  font-size: var(--font-size-base);
  color: var(--gray-800);
}

.question-options {
  margin-top: var(--spacing-lg);
}

.answer-result {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background: white;
  border-radius: var(--radius-md);
}

.answer-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.answer-row .label {
  font-weight: 500;
  color: var(--gray-600);
  font-size: var(--font-size-sm);
}

.answer-row .value {
  color: var(--gray-800);
  font-size: var(--font-size-sm);
}

.answer-row .value.correct {
  color: var(--green-500);
}

.answer-row .value.wrong {
  color: var(--red-500);
}

.hw-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}
</style>
