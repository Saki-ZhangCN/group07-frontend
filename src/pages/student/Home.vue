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
        <router-link to="/student/courses" class="section-link">查看全部</router-link>
      </div>
      
      <div class="courses-grid" v-if="ongoingCourses.length">
        <div 
          class="course-card" 
          v-for="course in ongoingCourses" 
          :key="course.id"
          @click="goToStudy(course.id)"
        >
          <div class="course-cover">
            <img :src="courseCoverUrl(course.coverImage)" :alt="course.name" @error="useFallbackCover" />
            <div class="course-overlay">
              <el-button type="primary" size="large" circle>
                <el-icon :size="24"><VideoPlay /></el-icon>
              </el-button>
            </div>
          </div>
          <div class="course-info">
            <h3 class="course-name">{{ course.name }}</h3>
            <p class="course-teacher">{{ course.teacher }}</p>
            <div class="course-progress">
              <div class="progress">
                <div class="progress-bar" :style="{ width: course.progress + '%' }"></div>
              </div>
              <span class="progress-text">已学 {{ course.progress }}%</span>
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
        <div class="homework-item" v-for="hw in pendingHomework" :key="hw.id">
          <div class="homework-info">
            <div class="homework-badge">
              <span class="badge badge-warning">{{ hw.type }}</span>
            </div>
            <h4 class="homework-title">{{ hw.title }}</h4>
            <p class="homework-course">{{ hw.courseName }}</p>
          </div>
          <div class="homework-meta">
            <div class="homework-deadline">
              <el-icon><Clock /></el-icon>
              <span>{{ hw.deadline }}</span>
            </div>
            <el-button type="primary" size="small" @click="goToHomework(hw.id)">
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
          :key="course.id"
          @click="goToDetail(course.id)"
        >
          <div class="course-cover">
            <img :src="courseCoverUrl(course.coverImage)" :alt="course.name" @error="useFallbackCover" />
            <span class="badge badge-live" v-if="course.isLive">
              <span class="live-dot"></span>
              直播中
            </span>
          </div>
          <div class="course-info">
            <h3 class="course-name">{{ course.name }}</h3>
            <p class="course-teacher">{{ course.teacher }}</p>
            <div class="course-meta">
              <span class="course-rating">
                <el-icon><Star /></el-icon>
                {{ course.rating }}
              </span>
              <span class="course-students">
                <el-icon><User /></el-icon>
                {{ course.students }}人学习
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
import { courseCoverUrl, useFallbackCover } from '../../utils/assets.js'

const router = useRouter()

const stats = ref({
  enrolledCourses: 5,
  studyHours: 24,
  completedHomework: 12,
  avgScore: 85
})

const ongoingCourses = ref([
  {
    id: '1',
    name: 'Java编程基础',
    teacher: '王老师',
    coverImage: 'https://picsum.photos/seed/java/400/225',
    progress: 60
  },
  {
    id: '2',
    name: 'Python数据分析',
    teacher: '李老师',
    coverImage: 'https://picsum.photos/seed/python/400/225',
    progress: 35
  },
  {
    id: '3',
    name: 'Web前端开发',
    teacher: '张老师',
    coverImage: 'https://picsum.photos/seed/web/400/225',
    progress: 80
  }
])

const pendingHomework = ref([
  {
    id: '1',
    title: '第三章课后习题',
    courseName: 'Java编程基础',
    type: '选择题',
    deadline: '剩余2天'
  },
  {
    id: '2',
    title: '数据分析实践报告',
    courseName: 'Python数据分析',
    type: '简答题',
    deadline: '剩余5天'
  }
])

const recommendedCourses = ref([
  {
    id: '4',
    name: '数据库原理与应用',
    teacher: '陈老师',
    coverImage: 'https://picsum.photos/seed/db/400/225',
    rating: 4.8,
    students: 1256,
    isLive: false
  },
  {
    id: '5',
    name: '软件工程导论',
    teacher: '刘老师',
    coverImage: 'https://picsum.photos/seed/se/400/225',
    rating: 4.6,
    students: 832,
    isLive: true
  },
  {
    id: '6',
    name: '算法设计与分析',
    teacher: '赵老师',
    coverImage: 'https://picsum.photos/seed/algo/400/225',
    rating: 4.9,
    students: 2150,
    isLive: false
  }
])

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
  // 加载首页数据
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
