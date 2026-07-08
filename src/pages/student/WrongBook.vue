<template>
  <div class="wrong-book">
    <div class="manage-container">
      <!-- 左侧课程导航 -->
      <aside class="course-sidebar">
        <div class="sidebar-header">
          <h3>课程列表</h3>
        </div>
        <div class="course-list">
          <div class="course-item" :class="{ active: selectedCourseId === '' }" @click="selectCourse('')">
            <el-icon><FolderOpened /></el-icon>
            <span>全部课程</span>
            <el-tag size="small" type="info">{{ allCourseCount }}</el-tag>
          </div>
          <div v-for="course in courses" :key="course.courseId" class="course-item"
            :class="{ active: selectedCourseId === course.courseId }" @click="selectCourse(course.courseId)">
            <el-icon><FolderOpened /></el-icon>
            <span class="course-name">{{ course.courseName }}</span>
            <el-tag size="small" type="info">{{ course.wrongCount || 0 }}</el-tag>
          </div>
        </div>
      </aside>

      <!-- 右侧内容区 -->
      <section class="content-area">
        <div class="wb-header">
          <h2>{{ selectedCourseName || '全部课程' }} - 错题本</h2>
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
              <span class="wb-course">{{ q.courseName || q.course }}</span>
              <span class="wb-date">错误时间：{{ q.date }}</span>
            </div>
            <div class="wb-question">{{ q.content }}</div>
            <div class="wb-actions">
              <el-button size="small" @click="showAnalysis(q)">查看解析</el-button>
              <el-button size="small" type="primary" @click="retry(q)">重新练习</el-button>
            </div>
          </div>
          <div v-if="wrongQuestions.length === 0" class="empty-state">
            <p>暂无错题</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getWrongBook, retryWrongQuestion } from '../../api/homework.js'
import { getEnrolledCourses } from '../../api/course.js'

const wrongQuestions = ref([])
const courses = ref([])
const selectedCourseId = ref('')
const allCourseCount = ref(0)

const selectedCourseName = computed(() => {
  if (!selectedCourseId.value) return ''
  return courses.value.find(c => c.courseId === selectedCourseId.value)?.courseName || ''
})

async function loadCourses() {
  const data = await getEnrolledCourses()
  courses.value = (data || []).map(c => ({ ...c, wrongCount: 0 }))
  allCourseCount.value = 0
  const counts = await Promise.all(
    courses.value.map(course =>
      getWrongBook(course.courseId)
        .then(data => ({ courseId: course.courseId, count: (data || []).length }))
        .catch(() => ({ courseId: course.courseId, count: 0 }))
    )
  )
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
  wrongQuestions.value = (data || []).map(item => ({
    ...item,
    courseName: item.courseName || item.course,
    course: item.courseName || '课程练习',
    date: item.lastWrongTime
  }))
}

function showAnalysis(question) { ElMessageBox.alert(question.analysis || '暂无解析', '题目解析') }
async function retry(question) {
  const { value } = await ElMessageBox.prompt('请输入答案', '重新练习')
  const result = await retryWrongQuestion(question.questionId, { answer: value })
  ElMessage[result.correct ? 'success' : 'warning'](result.message)
  await load()
}
onMounted(() => {
  load()
  loadCourses()
})
</script>

<style scoped>
.wrong-book {
  background: white;
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.manage-container {
  display: flex;
  min-height: calc(100vh - 112px);
}

/* 左侧课程导航 */
.course-sidebar {
  width: 240px;
  border-right: 1px solid var(--gray-100);
  background: var(--gray-50);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--gray-100);
}

.sidebar-header h3 {
  font-size: var(--font-size-md);
  color: var(--gray-800);
  margin: 0;
}

.course-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm);
}

.course-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--gray-600);
  font-size: var(--font-size-sm);
}

.course-item:hover {
  background: var(--gray-100);
}

.course-item.active {
  background: rgba(59, 130, 246, 0.08);
  color: var(--primary-500);
}

.course-item .course-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 右侧内容区 */
.content-area {
  flex: 1;
  padding: var(--spacing-xl);
  overflow-y: auto;
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

.empty-state {
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--gray-400);
}
</style>