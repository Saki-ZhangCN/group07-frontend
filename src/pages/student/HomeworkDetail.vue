<template>
  <div class="homework-detail">
    <div v-if="!homework" class="empty-state">
      <el-icon :size="48"><Document /></el-icon>
      <p>作业不存在或已删除</p>
    </div>
    <template v-else>
    <h1 class="hw-title">{{ homework.title }}</h1>
    <div class="hw-info">
      <span class="hw-course">{{ homework.course }}</span>
      <span class="hw-deadline">截止时间：{{ formatDate(homework.deadline) }}</span>
      <span class="hw-score">总分：{{ homework.totalScore }}分</span>
    </div>

    <div v-if="result && result.status === 'graded'" class="result-section">
      <div class="result-header">
        <span class="result-status">已批改</span>
        <span class="result-score" >
          得分：{{ formatScore(result.score) }}/{{ result.totalScore || 100 }}
        </span>
      </div>
      <div class="result-meta">
        <span>提交时间：{{ result.submitTime }}</span>
        <span>批改时间：{{ result.gradeTime }}</span>
      </div>
    </div>
    <div v-else-if="result && ['submitted','pending_grade'].includes(result.status)" class="result-section pending-result">
      <div class="result-header"><span class="result-status pending">已提交，等待教师批改</span></div>
      <div class="result-meta"><span>提交时间：{{ result.submitTime }}</span></div>
    </div>

    <div class="hw-content">
      <h3>题目内容</h3>
      <div class="question-list">
        <div class="question-item" v-for="(q, index) in homework.questions" :key="q.id">
          <div class="question-header">
            <span class="question-number">{{ index + 1 }}.</span>
            <span class="question-type">{{ getQuestionTypeName(q.type) }}</span>
            <span v-if="getAnswerResult(q.id) && getAnswerResult(q.id).correct !== null" class="answer-status" :class="getAnswerResult(q.id).correct ? 'correct' : 'wrong'">
              {{ getAnswerResult(q.id).correct ? '正确' : '错误' }}
            </span>
          </div>
          <div class="question-content">{{ q.content }}</div>
          
          <template v-if="canAnswer">
              <div v-if="q.type === 'single' || q.type === 'judge'" class="question-options">
                <el-radio-group v-model="answers[q.id]">
                  <el-radio v-for="(option, optIndex) in getOptions(q)" :key="optIndex" :label="option.content">{{ q.type === 'judge' ? option.content : option.optionKey + '. ' + option.content }}</el-radio>
                </el-radio-group>
              </div>
              <div v-else-if="q.type === 'multiple'" class="question-options">
                <el-checkbox-group v-model="answers[q.id]">
                  <el-checkbox v-for="(option, optIndex) in q.options" :key="optIndex" :label="option.content">{{ option.optionKey }}. {{ option.content }}</el-checkbox>
                </el-checkbox-group>
              </div>
              <div v-else class="question-textarea">
                <el-input v-model="answers[q.id]" type="textarea" :rows="5" maxlength="2000" show-word-limit placeholder="请输入你的答案" :spellcheck="false"></el-input>
              </div>
            </template>

          <div v-else-if="!isGraded" class="answer-result">
            <div class="answer-row"><span class="label">你的答案：</span><span class="value answer-text">{{ getAnswerResult(q.id)?.answer || '未作答' }}</span></div>
          </div>

          <div v-if="isGraded" class="answer-result">
            <div class="answer-row">
              <span class="label">你的答案：</span>
              <span class="value" :class="getAnswerResult(q.id)?.correct === null ? '' : (getAnswerResult(q.id)?.correct ? 'correct' : 'wrong')">
                {{ getAnswerResult(q.id)?.answer || '未作答' }}
              </span>
            </div>
            <div v-if="getAnswerResult(q.id)?.correct !== null" class="answer-row">
              <span class="label">标准答案：</span>
              <span class="value correct">{{ getAnswerResult(q.id)?.standardAnswer }}</span>
            </div>
            <div v-if="getAnswerResult(q.id)?.analysis" class="answer-row">
              <span class="label">解析：</span>
              <span class="value">{{ getAnswerResult(q.id)?.analysis }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="hw-actions" v-if="canAnswer">
      <el-button type="primary" size="large" :loading="submitting" @click="submit">提交作业</el-button>
    </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getHomeworkDetail, getHomeworkResult, submitHomework } from '../../api/homework.js'
import { formatDate } from '../../utils/date.js'

const answers = ref({})
const route = useRoute()
const router = useRouter()
const submitting = ref(false)
const result = ref(null)

const homework = ref({ questions: [] })

const isGraded = computed(() => result.value && result.value.status === 'graded')
const canAnswer = computed(() => !result.value || result.value.status === 'rejected')


function formatScore(value) {
  const n = Number(value || 0)
  return Math.round(Number.isFinite(n) ? n : 0)
}

function getQuestionTypeName(type) {
  const types = {
    'single': '单选题',
    'multiple': '多选题',
    'judge': '判断题',
    'fill': '填空题',
    'blank': '填空题',
    'essay': '问答题',
    'short': '简答题'
  }
  return types[type] || type
}

function getAnswerResult(questionId) {
  if (!result.value || !result.value.answers) return null
  return result.value.answers.find(a => a.questionId === questionId)
}
function getOptions(q) {
  return (q.type === 'judge' && !(q.options?.length)) ? [{ optionKey: '', content: 'true' }, { optionKey: '', content: 'false' }] : (q.options || [])
}

onMounted(async () => { 
  try {
    homework.value = await getHomeworkDetail(route.params.id)
    homework.value.questions?.forEach(q => { answers.value[q.id] = q.type === 'multiple' ? [] : '' })
  } catch (e) {
    homework.value = null
  }
  try {
    result.value = await getHomeworkResult(route.params.id)
    result.value?.answers?.forEach(a => { answers.value[a.questionId] = a.answer || (homework.value?.questions?.find(q => q.id === a.questionId)?.type === 'multiple' ? [] : '') })
  } catch (e) {
    result.value = null
  }
})

async function submit() {
  const unanswered = homework.value.questions.filter(q => {
    const val = answers.value[q.id]
    if (q.type === 'multiple') return !Array.isArray(val) || val.length === 0
    return !String(val || '').trim()
  })
  if (unanswered.length) {
    ElMessage.warning(`还有 ${unanswered.length} 道题未作答`)
    return
  }
  submitting.value = true
  try {
    const payload = {}
    Object.keys(answers.value).forEach(key => {
      const val = answers.value[key]
      payload[key] = Array.isArray(val) ? val.join(',') : String(val || '')
    })
    await submitHomework(route.params.id, { answers: payload })
    ElMessage.success('提交成功')
    router.push('/student/homework')
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

.result-status.pending { background: rgba(245, 158, 11, .12); color: #d97706; }
.pending-result { border-left: 4px solid #f59e0b; }
.question-textarea { margin-top: var(--spacing-lg); }
.answer-text { white-space: pre-wrap; word-break: break-word; }

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

.teacher-comment-row {
  background: rgba(245, 158, 11, 0.08);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--accent-orange);
}

.teacher-comment-value {
  color: var(--accent-orange) !important;
  font-weight: 500;
}
</style>

