<template>
  <div class="homework-grade">
    <h1>作业批改</h1>
    <div class="grade-list">
      <el-table :data="submissions">
        <el-table-column label="学员" prop="studentName" />
        <el-table-column label="作业" prop="homeworkTitle" />
        <el-table-column label="提交时间" prop="submitTime" />
        <el-table-column label="状态"><template #default="scope"><el-tag type="warning" size="small">未批改</el-tag></template></el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button type="warning" size="small" @click="grade(scope.row)">批改</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="gradeVisible" title="批改作业" width="800px">
      <div v-if="gradeData" class="grade-content">
        <div class="grade-header">
          <span class="student-name">学员：{{ gradeData.studentName }}</span>
          <span class="homework-title">作业：{{ gradeData.homeworkTitle }}</span>
          <span class="total-score">总分：{{ formatScore(gradeData.totalScore) }}分</span>
        </div>
        
        <div class="answers-list">
          <div v-for="(answer, index) in gradeData.answers" :key="answer.answerId" class="answer-item">
            <div class="answer-header">
              <span class="answer-number">{{ index + 1 }}.</span>
              <span class="answer-type">{{ getQuestionTypeName(answer.type) }}</span>
            </div>
            <div class="question-content">{{ answer.content }}</div>
            <div class="answer-content">
              <span class="label">学生答案：</span>
              <span class="value">{{ answer.answer || '未作答' }}</span>
            </div>
            <div v-if="answer.standardAnswer" class="standard-answer">
              <span class="label">标准答案：</span>
              <span class="value">{{ answer.standardAnswer }}</span>
            </div>            <div class="grade-input">
              <div class="grade-input-row">
                <span class="label">判定：</span>
                <template v-if="answer.correct !== null && answer.correct !== undefined">
                  <el-tag :type="answer.correct ? 'success' : 'danger'" size="small">{{ answer.correct ? '正确' : '错误' }}</el-tag>
                </template>
                <el-radio-group v-else v-model="answer.manualCorrect" size="small">
                  <el-radio-button :label="true">正确</el-radio-button>
                  <el-radio-button :label="false">错误</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </div>
        </div>
        
        <div class="grade-summary">
          <span class="summary-label">整份作业得分：</span>
          <el-input-number v-model="manualScore" :min="0" :max="100" :step="1" :precision="0" />
          <span class="summary-value">{{ totalScore }} / 100</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="gradeVisible = false">取消</el-button>
        <el-button type="primary" @click="submitGrade">提交批改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { getPendingSubmissions, getSubmissionDetail, gradeSubmission } from '../../api/homework.js'
import { ElMessage } from 'element-plus'

const submissions = ref([])
const gradeVisible = ref(false)
const gradeData = ref(null)
const overallComment = ref('')

function formatScore(value) {
  const n = Number(value ?? 0)
  return Math.round(Number.isFinite(n) ? n : 0)
}

async function load() {
  const data = await getPendingSubmissions({ page: 1, size: 100 })
  submissions.value = data.records || []
}


async function grade(row) {
  gradeData.value = JSON.parse(JSON.stringify(await getSubmissionDetail(row.submissionId)))
  overallComment.value = ''
  manualScore.value = Math.round(Number(gradeData.value?.score || 0))
  gradeVisible.value = true
}

const manualScore = ref(0)
const totalScore = computed(() => Math.round(Number(manualScore.value || 0)))

function isSubjective(type) {
  return !['single', 'multiple', 'judge', 'blank', 'fill'].includes(type)
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

async function submitGrade() {
  const score = Math.max(0, Math.min(100, Math.round(Number(manualScore.value || 0))))
  const correctness = {}
  gradeData.value.answers.forEach(a => { if (a.manualCorrect !== undefined) correctness[a.questionId] = a.manualCorrect })
  const missing = gradeData.value.answers.some(a => (a.correct === null || a.correct === undefined) && a.manualCorrect === undefined)
  if (missing) { ElMessage.warning('请为主观题选择正确或错误'); return }
  await gradeSubmission(gradeData.value.submissionId, { score, comment: '', correctness })
  ElMessage.success('批改完成')
  gradeVisible.value = false
  if (typeof loadSubmissions === 'function') await loadSubmissions()
  await load()
}

onMounted(load)
</script>

<style scoped>
.homework-grade {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
}

.homework-grade h1 {
  font-size: var(--font-size-xl);
  color: var(--gray-800);
  margin-bottom: var(--spacing-xl);
}

.detail-content, .grade-content {
  padding: var(--spacing-lg);
}

.detail-header, .grade-header {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--gray-100);
}

.detail-header span, .grade-header span {
  font-size: var(--font-size-sm);
  color: var(--gray-600);
}

.student-name, .homework-title, .submit-time, .total-score {
  background: var(--gray-50);
  padding: 4px 12px;
  border-radius: var(--radius-md);
}

.answers-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.answer-item {
  padding: var(--spacing-lg);
  background: var(--gray-50);
  border-radius: var(--radius-lg);
}

.answer-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.answer-number {
  font-weight: 600;
  color: var(--primary-500);
}

.answer-type {
  font-size: var(--font-size-xs);
  padding: 4px 12px;
  background: var(--primary-50);
  color: var(--primary-500);
  border-radius: var(--radius-full);
}

.answer-score {
  color: var(--gray-500);
  font-size: var(--font-size-sm);
}

.question-content {
  font-size: var(--font-size-base);
  color: var(--gray-800);
  margin-bottom: var(--spacing-md);
}

.answer-content, .standard-answer, .teacher-comment {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.answer-content .label, .standard-answer .label, .teacher-comment .label {
  font-weight: 500;
  color: var(--gray-600);
  font-size: var(--font-size-sm);
}

.answer-content .value, .standard-answer .value, .teacher-comment .value {
  color: var(--gray-800);
  font-size: var(--font-size-sm);
  word-break: break-word;
}

.standard-answer .value {
  color: var(--green-500);
}

.grade-input {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: white;
  border-radius: var(--radius-md);
}

.grade-input-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.grade-input .label {
  font-weight: 500;
  color: var(--gray-600);
  font-size: var(--font-size-sm);
  margin-right: var(--spacing-sm);
}

.grade-summary {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--gray-100);
}

.summary-label {
  font-weight: 500;
  color: var(--gray-600);
}

.summary-value {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--primary-500);
}

.grade-comment {
  margin-top: var(--spacing-md);
}

.grade-comment .label {
  font-weight: 500;
  color: var(--gray-600);
  font-size: var(--font-size-sm);
  display: block;
  margin-bottom: var(--spacing-sm);
}
</style>
