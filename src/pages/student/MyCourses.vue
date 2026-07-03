<template>
  <div class="my-courses">
    <div class="page-header">
      <h1 class="page-title">我的课程</h1>
      <p class="page-subtitle">管理您已选择的课程</p>
    </div>
    
    <div class="courses-section" v-if="courses.length">
      <div class="courses-header">
        <span class="courses-count">共 {{ courses.length }} 门课程</span>
      </div>
      
      <div class="courses-grid">
        <div 
          class="course-card" 
          v-for="course in courses" 
          :key="course.courseId"
          @click="goToStudy(course.courseId)"
        >
          <div class="course-cover">
            <img :src="courseCoverUrl(course.coverImage)" :alt="course.courseName" @error="useFallbackCover" />
            <div class="course-overlay">
              <el-button type="primary" size="large" circle>
                <el-icon :size="24"><VideoPlay /></el-icon>
              </el-button>
            </div>
          </div>
          <div class="course-info">
            <div class="course-category">
              <span class="tag">{{ course.category }}</span>
            </div>
            <h3 class="course-name">{{ course.courseName }}</h3>
            <p class="course-teacher">{{ course.teacherName }}</p>
            <div class="course-meta">
              <span class="course-rating">
                <el-icon><Star /></el-icon>
                {{ course.rating || '暂无评分' }}
              </span>
              <span class="course-students">
                {{ course.studentCount }}人学习
              </span>
            </div>
            <div class="course-progress">
              <div class="progress">
                <div class="progress-bar" :style="{ width: getProgress(course) + '%' }"></div>
              </div>
              <span class="progress-text">已学 {{ getProgress(course) }}%</span>
            </div>
            <div class="course-actions">
              <el-button type="primary" size="small" @click.stop="goToStudy(course.courseId)">
                继续学习
              </el-button>
              <el-button size="small" @click.stop="goToDetail(course.courseId)">
                课程详情
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="empty-state" v-else>
      <el-icon :size="48"><FolderOpened /></el-icon>
      <p>暂无已选课程</p>
      <el-button type="primary" @click="goToCourseCenter">
        去选课
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { courseCoverUrl, useFallbackCover } from '../../utils/assets.js'
import { getEnrolledCourses } from '../../api/course.js'

const router = useRouter()
const courses = ref([])
const loading = ref(false)

async function loadCourses() {
  loading.value = true
  try {
    const response = await getEnrolledCourses()
    courses.value = response.data || response
  } catch (error) {
    ElMessage.error('获取已选课程失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

function getProgress(course) {
  return course.progress || 0
}

function goToStudy(courseId) {
  router.push(`/student/study/${courseId}`)
}

function goToDetail(courseId) {
  router.push(`/student/course/${courseId}`)
}

function goToCourseCenter() {
  router.push('/student/courses')
}

onMounted(() => {
  loadCourses()
})
</script>

<style scoped>
.my-courses {
  max-width: 1200px;
}

.page-header {
  margin-bottom: var(--spacing-xl);
}

.page-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--gray-800);
  margin: 0 0 var(--spacing-sm) 0;
}

.page-subtitle {
  font-size: var(--font-size-base);
  color: var(--gray-500);
  margin: 0;
}

.courses-section {
  margin-bottom: var(--spacing-xl);
}

.courses-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.courses-count {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
}

.course-card {
  background: white;
  border-radius: var(--radius-xl);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.course-cover {
  position: relative;
  aspect-ratio: 16/9;
  overflow: hidden;
}

.course-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.course-card:hover .course-cover img {
  transform: scale(1.05);
}

.course-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-base);
}

.course-card:hover .course-overlay {
  opacity: 1;
}

.course-info {
  padding: var(--spacing-lg);
}

.course-category {
  margin-bottom: var(--spacing-sm);
}

.tag {
  font-size: var(--font-size-xs);
  padding: 2px 8px;
  background: rgba(59, 130, 246, 0.1);
  color: var(--blue-500);
  border-radius: var(--radius-full);
}

.course-name {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--gray-800);
  margin: 0 0 var(--spacing-sm) 0;
}

.course-card:hover .course-name {
  color: var(--primary-500);
}

.course-teacher {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
  margin: 0 0 var(--spacing-md) 0;
}

.course-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  font-size: var(--font-size-sm);
  color: var(--gray-500);
  margin-bottom: var(--spacing-md);
}

.course-rating,
.course-students {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.course-progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.course-progress .progress {
  flex: 1;
}

.progress-text {
  font-size: var(--font-size-xs);
  color: var(--gray-500);
}

.course-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-3xl);
  background: white;
  border-radius: var(--radius-xl);
  color: var(--gray-500);
}

.empty-state p {
  margin-top: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

@media (max-width: 1023px) {
  .courses-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .courses-grid {
    grid-template-columns: 1fr;
  }
}
</style>