<template>
  <div class="homework-page">
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
            <el-tag size="small" type="info">{{ course.homeworkCount || 0 }}</el-tag>
          </div>
        </div>
      </aside>

      <!-- 右侧内容区 -->
      <section class="content-area">
        <div class="content-header">
          <h1>{{ selectedCourseName || '全部课程' }} - 我的作业</h1>
        </div>
        <div class="filter-bar">
          <el-select v-model="statusFilter" placeholder="作业状态" @change="filterHomework">
            <el-option label="全部" value="" />
            <el-option label="待完成" value="pending" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </div>
        <div class="homework-items">
          <div class="homework-card" v-for="hw in filteredHomeworks" :key="hw.id">
            <div class="hw-header">
              <span class="hw-course">{{ hw.courseName }}</span>
              <span class="hw-status" :class="hw.statusClass">{{ hw.statusLabel }}</span>
            </div>
            <h3 class="hw-title">{{ hw.title }}</h3>
            <div class="hw-meta">
              <span class="hw-deadline">
                <el-icon><Clock /></el-icon>
                {{ hw.deadline }}
              </span>
              <span class="hw-type">{{ hw.type }}</span>
            </div>
            <div class="hw-actions">
              <el-button type="primary" size="small" v-if="hw.status === 'pending'" @click="openHomework(hw.id)">
                开始作答
              </el-button>
              <el-button size="small" v-else @click="openHomework(hw.id)">查看结果</el-button>
            </div>
          </div>
          <div v-if="filteredHomeworks.length === 0" class="empty-state">
            <p>暂无作业</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getHomeworkList } from '../../api/homework.js'
import { getEnrolledCourses } from '../../api/course.js'
import { formatDate } from '../../utils/date.js'

const statusFilter = ref('')
const router = useRouter()
const homeworks = ref([])
const courses = ref([])
const selectedCourseId = ref('')
const allCourseCount = ref(0)

const selectedCourseName = computed(() => {
  if (!selectedCourseId.value) return ''
  return courses.value.find(c => c.courseId === selectedCourseId.value)?.courseName || ''
})

const filteredHomeworks = computed(() => {
  let list = homeworks.value
  if (statusFilter.value) {
    list = list.filter(item => item.status === statusFilter.value)
  }
  return list
})

async function loadCourses() {
  const data = await getEnrolledCourses()
  courses.value = (data || []).map(c => ({ ...c, homeworkCount: 0 }))
  allCourseCount.value = 0
  const counts = await Promise.all(
    courses.value.map(course =>
      getHomeworkList({ page: 1, size: 1, courseId: course.courseId })
        .then(hwData => ({ courseId: course.courseId, count: hwData.total || 0 }))
        .catch(() => ({ courseId: course.courseId, count: 0 }))
    )
  )
  for (const { courseId, count } of counts) {
    const course = courses.value.find(c => c.courseId === courseId)
    if (course) course.homeworkCount = count
    allCourseCount.value += count
  }
}

function selectCourse(courseId) {
  selectedCourseId.value = courseId
  load()
}

async function load() {
  const params = { page: 1, size: 100 }
  if (selectedCourseId.value) params.courseId = selectedCourseId.value
  const data = await getHomeworkList(params)
  homeworks.value = (data.records || []).map(item => ({
    ...item,
    courseName: item.courseName || item.course,
    type: item.type || `${item.questionCount || 0}道题`,
    deadline: formatDate(item.deadline),
    statusLabel: item.status === 'pending' ? '待完成' : item.status === 'graded' ? '已批改' : '已提交',
    statusClass: item.status === 'pending' ? 'pending' : 'completed'
  }))
}

function filterHomework() {
  // filteredHomeworks is computed, auto-updates
}

function openHomework(id) { router.push(`/student/homework/${id}`) }

onMounted(() => {
  load()
  loadCourses()
})
</script>

<style scoped>
.homework-page {
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

.content-header {
  margin-bottom: var(--spacing-lg);
}

.content-header h1 {
  font-size: var(--font-size-xl);
  color: var(--gray-800);
}

.filter-bar {
  margin-bottom: var(--spacing-lg);
}

.homework-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: var(--spacing-lg);
}

.homework-card {
  padding: var(--spacing-lg);
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-lg);
}

.hw-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.hw-course {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

.hw-status {
  font-size: var(--font-size-xs);
  padding: 4px 12px;
  border-radius: var(--radius-full);
}

.hw-status.pending {
  background: rgba(249, 115, 22, 0.1);
  color: var(--accent-orange);
}

.hw-status.completed {
  background: rgba(34, 197, 94, 0.1);
  color: var(--green-500);
}

.hw-title {
  font-size: var(--font-size-lg);
  color: var(--gray-800);
}

.hw-meta {
  display: flex;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-md);
  color: var(--gray-500);
  font-size: var(--font-size-sm);
}

.hw-deadline {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.hw-actions {
  margin-top: var(--spacing-lg);
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--gray-400);
}
</style>