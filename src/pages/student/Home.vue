<template>
  <div class="student-home">
    <!-- 顶部统计卡片 -->
    <div class="stats-section animate-fade-in">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, var(--primary-500), var(--accent-cyan))">
            <el-icon :size="24"><Reading /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.enrolledCourses }}</div>
            <div class="stat-label">已选课程</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, var(--accent-cyan), var(--green-500))">
            <el-icon :size="24"><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.studyHours }}h</div>
            <div class="stat-label">学习时长</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, var(--accent-orange), var(--yellow-400))">
            <el-icon :size="24"><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.completedHomework }}</div>
            <div class="stat-label">完成作业</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, var(--green-500), var(--accent-cyan))">
            <el-icon :size="24"><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.avgScore }}</div>
            <div class="stat-label">平均分数</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 进行中的课程 -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">继续学习</h2>
        <router-link to="/student/my-courses" class="section-link">查看全部</router-link>
      </div>
      
      <div class="courses-grid" v-if="ongoingCourses.length">
        <div 
          class="course-card" 
          v-for="course in ongoingCourses" 
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
            <h3 class="course-name">{{ course.courseName }}</h3>
            <p class="course-teacher">{{ course.teacherName }}</p>
            <div class="course-progress">
              <div class="progress">
                <div class="progress-bar" :style="{ width: (course.progress || 0) + '%' }"></div>
              </div>
              <span class="progress-text">已学 {{ course.progress || 0 }}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="empty-state" v-else>
        <el-icon :size="48"><FolderOpened /></el-icon>
        <p>暂无进行中的课程</p>
        <el-button type="primary" @click="router.push('/student/courses')">
          去选课
        </el-button>
      </div>
    </section>
    
    <!-- 待完成的作业 -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">待完成作业</h2>
        <router-link to="/student/homework" class="section-link">查看全部</router-link>
      </div>
      
      <div class="homework-list" v-if="pendingHomework.length">
        <div class="homework-item" v-for="hw in pendingHomework" :key="hw.homeworkId || hw.id">
          <div class="homework-info">
            <div class="homework-badge">
              <span class="badge badge-warning">{{ hw.type || '作业' }}</span>
            </div>
            <h4 class="homework-title">{{ hw.title }}</h4>
            <p class="homework-course">{{ hw.courseName }}</p>
          </div>
          <div class="homework-meta">
            <div class="homework-deadline">
              <el-icon><Clock /></el-icon>
              <span>{{ formatDate(hw.deadline) || '暂无截止时间' }}</span>
            </div>
            <el-button type="primary" size="small" @click="goToHomework(hw.homeworkId || hw.id)">
              开始作答
            </el-button>
          </div>
        </div>
      </div>
      
      <div class="empty-state" v-else>
        <el-icon :size="48"><DocumentChecked /></el-icon>
        <p>暂无待完成的作业</p>
      </div>
    </section>
    
    <!-- 推荐课程 -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">推荐课程</h2>
        <router-link to="/student/courses" class="section-link">更多课程</router-link>
      </div>
      
      <div class="courses-grid">
        <div 
          class="course-card" 
          v-for="course in recommendedCourses" 
          :key="course.courseId"
          @click="goToDetail(course.courseId)"
        >
          <div class="course-cover">
            <img :src="courseCoverUrl(course.coverImage)" :alt="course.courseName" @error="useFallbackCover" />
            <span class="badge badge-live" v-if="course.status === 'live'">
              <span class="live-dot"></span>
              直播中
            </span>
          </div>
          <div class="course-info">
            <h3 class="course-name">{{ course.courseName }}</h3>
            <p class="course-teacher">{{ course.teacherName }}</p>
            <div class="course-meta">
              <span class="course-rating">
                <el-icon><Star /></el-icon>
                {{ course.rating || '暂无评分' }}
              </span>
              <span class="course-students">
                <el-icon><User /></el-icon>
                {{ course.studentCount }}人学习
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { courseCoverUrl, useFallbackCover } from '../../utils/assets.js'
import { formatDate } from '../../utils/date.js'
import { getEnrolledCourses, getCourseList } from '../../api/course.js'
import { getHomeworkList } from '../../api/homework.js'

const router = useRouter()

const stats = ref({
  enrolledCourses: 0,
  studyHours: 0,
  completedHomework: 0,
  avgScore: 0
})

const ongoingCourses = ref([])
const pendingHomework = ref([])
const recommendedCourses = ref([])

async function loadStats() {
  try {
    const coursesResponse = await getEnrolledCourses()
    const courses = coursesResponse.data || coursesResponse
    stats.value.enrolledCourses = courses.length
    
    const homeworkResponse = await getHomeworkList({ page: 1, size: 100, status: 'pending' })
    const homeworkData = homeworkResponse.data || homeworkResponse
    const homeworkList = homeworkData.records || homeworkData.list || homeworkData
    stats.value.completedHomework = homeworkList.filter(hw => hw.status === 'completed').length
    pendingHomework.value = homeworkList.filter(hw => hw.status !== 'completed').slice(0, 5)
  } catch (error) {
    console.error('加载统计数据失败', error)
  }
}

async function loadOngoingCourses() {
  try {
    const response = await getEnrolledCourses()
    const courses = response.data || response
    ongoingCourses.value = courses.slice(0, 3)
  } catch (error) {
    ElMessage.error('获取已选课程失败')
    console.error(error)
  }
}

async function loadRecommendedCourses() {
  try {
    const response = await getCourseList({ page: 1, size: 6, status: 'online' })
    const data = response.data || response
    const courses = data.courses || data.records || data.list || data
    if (Array.isArray(courses)) {
      recommendedCourses.value = courses.slice(0, 3)
    } else if (Array.isArray(data)) {
      recommendedCourses.value = data.slice(0, 3)
    }
  } catch (error) {
    console.error('获取推荐课程失败', error)
  }
}

function goToStudy(courseId) {
  router.push(`/student/study/${courseId}`)
}

function goToDetail(courseId) {
  router.push(`/student/course/${courseId}`)
}

function goToHomework(hwId) {
  router.push(`/student/homework/${hwId}`)
}

onMounted(() => {
  loadStats()
  loadOngoingCourses()
  loadRecommendedCourses()
})
</script>

<style scoped>
.student-home {
  max-width: 1200px;
}

.stats-section {
  margin-bottom: var(--spacing-xl);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
}

.stat-card {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--gray-800);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

.section {
  margin-bottom: var(--spacing-xl);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--gray-800);
}

.section-link {
  font-size: var(--font-size-sm);
  color: var(--primary-500);
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

.course-name {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: var(--spacing-sm);
}

.course-card:hover .course-name {
  color: var(--primary-500);
}

.course-teacher {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
  margin-bottom: var(--spacing-md);
}

.course-progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.course-progress .progress {
  flex: 1;
}

.progress-text {
  font-size: var(--font-size-xs);
  color: var(--gray-500);
}

.course-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

.course-rating,
.course-students {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.badge-live {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
}

.homework-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.homework-item {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
}

.homework-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.homework-badge {
  flex-shrink: 0;
}

.homework-title {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--gray-800);
  margin-bottom: var(--spacing-xs);
}

.homework-course {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

.homework-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.homework-deadline {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--accent-orange);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
  background: white;
  border-radius: var(--radius-xl);
  color: var(--gray-500);
}

.empty-state p {
  margin-top: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

@media (max-width: 1023px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .courses-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .courses-grid {
    grid-template-columns: 1fr;
  }
  
  .homework-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .homework-info {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
