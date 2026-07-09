<template>
  <div class="wrong-book">
    <div class="manage-container">
      <aside class="course-sidebar">
        <div class="sidebar-header"><h3>课程列表</h3></div>
        <div class="course-list">
          <div class="course-item" :class="{ active: selectedCourseId === '' }" @click="selectCourse('')">
            <el-icon><FolderOpened /></el-icon>
            <span>全部课程</span>
            <el-tag size="small" type="info">{{ allCourseCount }}</el-tag>
          </div>
          <div v-for="course in courses" :key="course.courseId" class="course-item" :class="{ active: selectedCourseId === course.courseId }" @click="selectCourse(course.courseId)">
            <el-icon><FolderOpened /></el-icon>
            <span class="course-name">{{ course.courseName }}</span>
            <el-tag size="small" type="info">{{ course.wrongCount || 0 }}</el-tag>
          </div>
        </div>
      </aside>

      <section class="content-area">
        <div class="wb-header">
          <h2>{{ selectedCourseName || '全部课程' }} - 错题本</h2>
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
              <span class="wb-course">{{ q.courseName || q.course }}</span>
              <span class="wb-date">错误时间：{{ q.date || '-' }}</span>
              <el-tag size="small" type="info">{{ typeLabel(q.type) }}</el-tag>
            </div>
            <div class="wb-question">{{ q.content }}</div>
            <div class="wb-actions">
              <el-button size="small" type="primary" @click="retry(q)">重新练习</el-button>
            </div>
          </div>
          <div v-if="wrongQuestions.length === 0" class="empty-state"><p>暂无错题</p></div>
        </div>
      </section>
    </div>

    <el-dialog v-model="retryVisible" title="重新练习" width="680px">
      <div v-if="currentQuestion" class="retry-dialog">
        <div class="retry-meta">
          <el-tag size="small">{{ currentQuestion.courseName }}</el-tag>
          <el-tag size="small" type="info">{{ typeLabel(currentQuestion.type) }}</el-tag>
        </div>
        <div class="retry-question">{{ currentQuestion.content }}</div>
        <div v-if="currentQuestion.type === 'single' || currentQuestion.type === 'judge'" class="retry-options">
          <el-radio-group v-model="retryAnswer">
            <el-radio v-for="option in currentQuestion.options || []" :key="option.content" :label="option.content">
              {{ option.optionKey ? option.optionKey + '. ' : '' }}{{ option.content }}
            </el-radio>
          </el-radio-group>
        </div>
        <div v-else-if="currentQuestion.type === 'multiple'" class="retry-options">
          <el-checkbox-group v-model="retryAnswerList">
            <el-checkbox v-for="option in currentQuestion.options || []" :key="option.content" :label="option.content">
              {{ option.optionKey }}. {{ option.content }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
        <el-input v-else v-model="retryAnswer" type="textarea" :rows="4" placeholder="请输入答案" />
        <div v-if="retryResult" class="retry-result" :class="retryResult.correct ? 'correct' : 'wrong'">
          {{ retryResult.message }}
          <div v-if="!retryResult.correct" class="analysis"><b>解析：</b>{{ currentQuestion.analysis || '暂无解析' }}</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="retryVisible = false">关闭</el-button>
        <el-button type="primary" :loading="retrySubmitting" @click="submitRetry">提交答案</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getWrongBook, retryWrongQuestion } from '../../api/homework.js'
import { getEnrolledCourses } from '../../api/course.js'

const wrongQuestions = ref([])
const courses = ref([])
const selectedCourseId = ref('')
const allCourseCount = ref(0)
const retryVisible = ref(false)
const retrySubmitting = ref(false)
const currentQuestion = ref(null)
const retryAnswer = ref('')
const retryAnswerList = ref([])
const retryResult = ref(null)

const selectedCourseName = computed(() => {
  if (!selectedCourseId.value) return ''
  return courses.value.find(c => c.courseId === selectedCourseId.value)?.courseName || ''
})

function typeLabel(type) {
  return { single: '单选题', multiple: '多选题', judge: '判断题', blank: '填空题', fill: '填空题', short: '简答题', essay: '问答题' }[type] || type
}

async function loadCourses() {
  const data = await getEnrolledCourses()
  courses.value = (data || []).map(c => ({ ...c, wrongCount: 0 }))
  allCourseCount.value = 0
  const counts = await Promise.all(courses.value.map(course => getWrongBook(course.courseId).then(data => ({ courseId: course.courseId, count: (data || []).length })).catch(() => ({ courseId: course.courseId, count: 0 }))))
  for (const { courseId, count } of counts) {
    const course = courses.value.find(c => c.courseId === courseId)
    if (course) course.wrongCount = count
    allCourseCount.value += count
  }
}

function selectCourse(courseId) {
  selectedCourseId.value = courseId
  load()
}

async function load() {
  const data = await getWrongBook(selectedCourseId.value || undefined)
  wrongQuestions.value = (data || []).map(item => ({ ...item, courseName: item.courseName || item.course, course: item.courseName || '课程作业', date: item.lastWrongTime }))
}

function retry(question) {
  currentQuestion.value = question
  retryAnswer.value = ''
  retryAnswerList.value = []
  retryResult.value = null
  retryVisible.value = true
}

async function submitRetry() {
  if (!currentQuestion.value) return
  const answer = currentQuestion.value.type === 'multiple' ? retryAnswerList.value.join(',') : retryAnswer.value
  if (!String(answer || '').trim()) {
    ElMessage.warning('请输入答案')
    return
  }
  retrySubmitting.value = true
  try {
    const result = await retryWrongQuestion(currentQuestion.value.questionId, { answer })
    retryResult.value = result
    ElMessage[result.correct ? 'success' : 'warning'](result.message)
    if (result.correct) {
      retryVisible.value = false
      await load()
      await loadCourses()
    }
  } finally {
    retrySubmitting.value = false
  }
}


onMounted(() => {
  load()
  loadCourses()
})
</script>

<style scoped>
.wrong-book { background: white; border-radius: var(--radius-xl); overflow: hidden; }
.manage-container { display: flex; min-height: calc(100vh - 112px); }
.course-sidebar { width: 240px; border-right: 1px solid var(--gray-100); background: var(--gray-50); display: flex; flex-direction: column; flex-shrink: 0; }
.sidebar-header { padding: var(--spacing-lg); border-bottom: 1px solid var(--gray-100); }
.sidebar-header h3 { font-size: var(--font-size-md); color: var(--gray-800); margin: 0; }
.course-list { flex: 1; overflow-y: auto; padding: var(--spacing-sm); }
.course-item { display: flex; align-items: center; gap: var(--spacing-sm); padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--radius-md); cursor: pointer; transition: all var(--transition-fast); color: var(--gray-600); font-size: var(--font-size-sm); }
.course-item:hover { background: var(--gray-100); }
.course-item.active { background: rgba(59, 130, 246, 0.08); color: var(--primary-500); }
.course-item .course-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.content-area { flex: 1; padding: var(--spacing-xl); overflow-y: auto; }
.wb-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--spacing-xl); }
.wb-header h2 { font-size: var(--font-size-xl); color: var(--gray-800); }
.wb-stats { margin-bottom: var(--spacing-xl); }
.stat-value { font-size: var(--font-size-2xl); font-weight: 700; color: var(--red-500); }
.stat-label { font-size: var(--font-size-sm); color: var(--gray-500); margin-left: var(--spacing-sm); }
.wb-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: var(--spacing-lg); }
.wb-card { padding: var(--spacing-lg); border: 1px solid var(--gray-100); border-radius: var(--radius-lg); }
.wb-meta { display: flex; align-items: center; gap: var(--spacing-lg); margin-bottom: var(--spacing-md); color: var(--gray-500); font-size: var(--font-size-sm); }
.wb-question { color: var(--gray-800); line-height: 1.7; }
.wb-actions { display: flex; gap: var(--spacing-md); margin-top: var(--spacing-lg); }
.empty-state { grid-column: 1 / -1; text-align: center; padding: var(--spacing-3xl); color: var(--gray-400); }
.retry-meta { display: flex; gap: var(--spacing-sm); margin-bottom: var(--spacing-md); }
.retry-question { padding: var(--spacing-md); background: var(--gray-50); border-radius: var(--radius-md); margin-bottom: var(--spacing-md); line-height: 1.7; }
.retry-options { margin-bottom: var(--spacing-md); }
.retry-options :deep(.el-radio-group), .retry-options :deep(.el-checkbox-group) { display: flex; flex-direction: column; align-items: flex-start; gap: var(--spacing-sm); }
.retry-result { margin-top: var(--spacing-md); padding: var(--spacing-md); border-radius: var(--radius-md); }
.retry-result.correct { background: rgba(34, 197, 94, .12); color: var(--green-500); }
.retry-result.wrong { background: rgba(239, 68, 68, .1); color: var(--red-500); }
.analysis { color: var(--gray-700); margin-top: var(--spacing-sm); line-height: 1.6; }
</style>