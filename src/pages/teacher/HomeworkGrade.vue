<template>
  <div class="homework-grade">
    <h1>作业批改</h1>
    <div class="grade-list">
      <el-table :data="submissions">
        <el-table-column label="学员" prop="studentName" />
        <el-table-column label="作业" prop="homeworkTitle" />
        <el-table-column label="提交时间" prop="submitTime" />
        <el-table-column label="状态" prop="status" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewDetail(scope.row)">查看详情</el-button>
            <el-button type="warning" size="small" @click="grade(scope.row)">批改</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="detailVisible" title="作业详情" width="800px">
      <div v-if="detail" class="detail-content">
        <div class="detail-header">
          <span class="student-name">学员：{{ detail.studentName }}</span>
          <span class="homework-title">作业：{{ detail.homeworkTitle }}</span>
          <span class="submit-time">提交时间：{{ detail.submitTime }}</span>
          <span class="total-score">总分：{{ detail.totalScore }}分</span>
        </div>
        
        <div class="answers-list">
          <div v-for="(answer, index) in detail.answers" :key="answer.answerId" class="answer-item">
            <div class="answer-header">
              <span class="answer-number">{{ index + 1 }}.</span>
              <span class="answer-type">{{ getQuestionTypeName(answer.type) }}</span>
              <span class="answer-score">（{{ answer.fullScore || 10 }}分）</span>
            </div>
            <div class="question-content">{{ answer.content }}</div>
            <div class="answer-content">
              <span class="label">学生答案：</span>
              <span class="value">{{ answer.answer || '未作答' }}</span>
            </div>
            <div v-if="answer.standardAnswer" class="standard-answer">
              <span class="label">标准答案：</span>
              <span class="value">{{ answer.standardAnswer }}</span>
            </div>
            <div v-if="answer.teacherComment" class="teacher-comment">
              <span class="label">教师点评：</span>
              <span class="value">{{ answer.teacherComment }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="gradeVisible" title="批改作业" width="800px">
      <div v-if="gradeData" class="grade-content">
        <div class="grade-header">
          <span class="student-name">学员：{{ gradeData.studentName }}</span>
          <span class="homework-title">作业：{{ gradeData.homeworkTitle }}</span>
          <span class="total-score">总分：{{ gradeData.totalScore }}分</span>
        </div>
        
        <div class="answers-list">
          <div v-for="(answer, index) in gradeData.answers" :key="answer.answerId" class="answer-item">
            <div class="answer-header">
              <span class="answer-number">{{ index + 1 }}.</span>
              <span class="answer-type">{{ getQuestionTypeName(answer.type) }}</span>
              <span class="answer-score">（{{ answer.fullScore || 10 }}分）</span>
            </div>
            <div class="question-content">{{ answer.content }}</div>
            <div class="answer-content">
              <span class="label">学生答案：</span>
              <span class="value">{{ answer.answer || '未作答' }}</span>
            </div>
            <div v-if="answer.standardAnswer" class="standard-answer">
              <span class="label">标准答案：</span>
              <span class="value">{{ answer.standardAnswer }}</span>
            </div>
            <div v-if="isSubjective(answer.type)" class="grade-input">
              <div class="grade-input-row">
                <span class="label">得分：</span>
                <el-input-number v-model="answer.score" :min="0" :max="answer.fullScore || 100" :step="10" size="small" />
                <el-button size="small" type="default" @click="answer.score = 0">0分</el-button>
                <el-button size="small" type="primary" @click="answer.score = answer.fullScore || 100">满分</el-button>
              </div>
              <div class="grade-input-row">
                <span class="label">点评：</span>
                <el-input v-model="answer.teacherComment" type="textarea" :rows="2" placeholder="请输入点评" style="flex: 1;" />
              </div>
            </div>
            <div v-else class="grade-input">
              <div class="grade-input-row">
                <span class="label">本题得分：{{ answer.score || 0 }} 分</span>
              </div>
              <div class="grade-input-row">
                <span class="label">点评：</span>
                <el-input v-model="answer.teacherComment" type="textarea" :rows="2" placeholder="请输入点评（可选）" style="flex: 1;" />
              </div>
            </div>
          </div>
        </div>
        
        <div class="grade-summary">
          <span class="summary-label">总得分：</span>
          <span class="summary-value">{{ totalScore }}</span>
        </div>
        <div class="grade-comment">
          <span class="label">整体评语：</span>
          <el-input v-model="overallComment" type="textarea" :rows="3" placeholder="请输入整体评语（可选）" />
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
const detailVisible = ref(false)
const gradeVisible = ref(false)
const detail = ref(null)
const gradeData = ref(null)
const overallComment = ref('')

async function load() {
  const data = await getPendingSubmissions({ page: 1, size: 100 })
  submissions.value = data.records || []
}

async function viewDetail(row) {
  detail.value = await getSubmissionDetail(row.submissionId)
  detailVisible.value = true
}

async function grade(row) {
  gradeData.value = JSON.parse(JSON.stringify(await getSubmissionDetail(row.submissionId)))
  overallComment.value = ''
  gradeVisible.value = true
}

const totalScore = computed(() => {
  if (!gradeData.value?.answers) return 0
  return gradeData.value.answers.reduce((sum, answer) => sum + (answer.score || 0), 0)
})

function isSubjective(type) {
  return !['single', 'multiple', 'judge'].includes(type)
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
  const subjectiveAnswers = gradeData.value.answers.filter(a => isSubjective(a.type))
  const scores = {}
  const comments = {}
  subjectiveAnswers.forEach(a => {
    if (a.score !== undefined) scores[a.questionId] = a.score
  })
  gradeData.value.answers.forEach(a => {
    if (a.teacherComment) comments[a.questionId] = a.teacherComment
  })
  
  await gradeSubmission(gradeData.value.submissionId, { 
    score: totalScore.value, 
    comment: overallComment.value || '教师已完成批改',
    scores,
    comments
  })
  ElMessage.success('批改完成')
  gradeVisible.value = false
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