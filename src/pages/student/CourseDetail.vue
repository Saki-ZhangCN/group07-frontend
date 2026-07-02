<template>
  <div class="course-detail">
    <div v-if="loading" class="loading-container">
      <el-spinner size="large" />
    </div>
    
    <template v-else>
      <!-- 课程头部 -->
      <div class="course-header">
        <div class="course-cover-large">
          <img :src="courseCoverUrl(course.coverImage)" :alt="course.courseName" @error="useFallbackCover" />
          <div class="play-overlay" v-if="isEnrolled">
            <el-button type="primary" size="large" circle @click="startStudy">
              <el-icon :size="32"><VideoPlay /></el-icon>
            </el-button>
          </div>
        </div>
        
        <div class="course-header-info">
          <div class="course-category-tag">
            <span class="badge badge-primary">{{ course.category }}</span>
          </div>
          
          <h1 class="course-title">{{ course.courseName }}</h1>
          
          <div class="course-id">课程编号：{{ course.courseId }}</div>
          
          <div class="course-stats">
            <div class="stat-item">
              <el-icon><Star /></el-icon>
              <span class="stat-value">{{ course.rating }}</span>
              <span class="stat-label">评分</span>
            </div>
            <div class="stat-item">
              <el-icon><User /></el-icon>
              <span class="stat-value">{{ course.studentCount }}</span>
              <span class="stat-label">学员</span>
            </div>
            <div class="stat-item">
              <el-icon><Clock /></el-icon>
              <span class="stat-value">{{ formatDuration(course.totalHours) }}</span>
              <span class="stat-label">时长</span>
            </div>
          </div>
          
          <div class="course-teacher-info">
            <el-avatar :size="48">
              <el-icon><UserFilled /></el-icon>
            </el-avatar>
            <div class="teacher-detail">
              <span class="teacher-name">{{ course.teacherName }}</span>
              <span class="teacher-title">{{ course.teacherTitle }}</span>
            </div>
          </div>
          
          <div class="course-actions">
            <div class="course-price-section">
              <span class="price-label">课程价格</span>
              <span class="price-value" v-if="course.price > 0">¥{{ course.price }}</span>
              <span class="price-free" v-else>免费</span>
            </div>
            
            <div class="action-buttons">
              <el-button 
                type="primary" 
                size="large" 
                v-if="!isEnrolled && course.status === 'online'"
                @click="handleEnroll"
              >
                选课
              </el-button>
              <el-button 
                type="primary" 
                size="large" 
                v-else-if="isEnrolled"
                @click="startStudy"
              >
                继续学习
              </el-button>
              <el-button 
                size="large" 
                disabled
                v-else
              >
                {{ course.status === 'pending' ? '审核中' : '暂未上线' }}
              </el-button>
              <el-button size="large" @click="handleFavorite">
                <el-icon><Star /></el-icon>
                收藏
              </el-button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 课程内容 -->
      <div class="course-content">
        <div class="content-main">
          <!-- 课程简介 -->
          <section class="content-section">
            <h2 class="section-title">课程简介</h2>
            <div class="course-description">
              <p>{{ course.description }}</p>
            </div>
          </section>
          
          <!-- 课程大纲 -->
          <section class="content-section">
            <h2 class="section-title">课程大纲</h2>
            <div class="chapters-list">
              <div 
                class="chapter-item" 
                v-for="(chapter, index) in chapters" 
                :key="chapter.chapterId"
              >
                <div class="chapter-header">
                  <span class="chapter-number">第{{ index + 1 }}章</span>
                  <span class="chapter-title">{{ chapter.chapterName }}</span>
                  <span class="chapter-duration">{{ chapter.duration ? Math.round(chapter.duration / 60) + '分钟' : '' }}</span>
                </div>
              </div>
            </div>
          </section>
          
          <!-- 课程评价 -->
          <section class="content-section">
            <h2 class="section-title">学员评价</h2>
            <div class="reviews-list" v-if="reviews.length > 0">
              <div class="review-item" v-for="review in reviews" :key="review.reviewId">
                <div class="review-header">
                  <el-avatar :size="40">
                    <el-icon><UserFilled /></el-icon>
                  </el-avatar>
                  <div class="review-user">
                    <span class="review-name">{{ review.userName }}</span>
                    <span class="review-date">{{ review.createTime }}</span>
                  </div>
                  <div class="review-rating">
                    <el-icon v-for="n in 5" :key="n" :class="{ active: n <= review.rating }">
                      <Star />
                    </el-icon>
                  </div>
                </div>
                <div class="review-content">
                  <p>{{ review.content }}</p>
                </div>
              </div>
            </div>
            <div class="empty-reviews" v-else>
              <el-empty description="暂无评价" />
            </div>
          </section>
        </div>
        
        <!-- 右侧推荐 -->
        <div class="content-sidebar">
          <div class="sidebar-card">
            <h3 class="sidebar-title">相关推荐</h3>
            <div class="recommend-list">
              <div 
                class="recommend-item" 
                v-for="item in recommendations" 
                :key="item.courseId"
                @click="goToCourse(item.courseId)"
              >
                <img :src="courseCoverUrl(item.coverImage)" :alt="item.courseName" class="recommend-cover" @error="useFallbackCover" />
                <div class="recommend-info">
                  <span class="recommend-name">{{ item.courseName }}</span>
                  <span class="recommend-rating">
                    <el-icon><Star /></el-icon>
                    {{ item.rating || 0 }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { courseCoverUrl, useFallbackCover } from '../../utils/assets.js'
import { getCourseDetail, enrollCourse, getCourseReviews, favoriteCourse, getCourseChapters } from '../../api/course.js'

const router = useRouter()
const route = useRoute()

const courseId = route.params.id
const isEnrolled = ref(false)
const loading = ref(true)

const course = ref({
  courseId: '',
  courseName: '',
  category: '',
  coverImage: '',
  rating: 0,
  studentCount: 0,
  totalHours: 0,
  price: 0,
  description: '',
  teacherId: '',
  teacherName: '',
  teacherTitle: '',
  status: ''
})

const reviews = ref([])
const chapters = ref([])
const recommendations = ref([])

function formatDuration(hours) {
  if (!hours) return '0小时'
  if (hours >= 1) {
    return hours + '小时'
  }
  return Math.round(hours * 60) + '分钟'
}

function checkEnrollStatus() {
  const token = localStorage.getItem('token')
  if (!token) {
    isEnrolled.value = false
    return
  }
  
  getCourseDetail(courseId).then(data => {
    if (data.enrolled) {
      isEnrolled.value = true
    }
  }).catch(() => {
    isEnrolled.value = false
  })
}

function handleEnroll() {
  enrollCourse(courseId).then(() => {
    ElMessage.success('选课成功！')
    isEnrolled.value = true
    course.value.studentCount++
  }).catch(error => {
    ElMessage.error(error.message || '选课失败')
  })
}

function startStudy() {
  router.push(`/student/study/${courseId}`)
}

function handleFavorite() {
  favoriteCourse(courseId).then(() => {
    ElMessage.success('已收藏课程')
  }).catch(error => {
    ElMessage.error(error.message || '收藏失败')
  })
}

function goToCourse(id) {
  router.push(`/student/course/${id}`)
}

function loadCourseDetail() {
  loading.value = true
  getCourseDetail(courseId).then(data => {
    course.value = {
      courseId: data.courseId,
      courseName: data.courseName,
      category: data.category,
      coverImage: data.coverImage || '/uploads/default-image.jpg',
      rating: data.rating || 0,
      studentCount: data.studentCount || 0,
      totalHours: data.totalHours || 0,
      price: data.price || 0,
      description: data.description || '',
      teacherId: data.teacherId,
      teacherName: data.teacherName || '',
      teacherTitle: data.teacherTitle || '',
      status: data.status
    }
    if (data.enrolled !== undefined) {
      isEnrolled.value = data.enrolled
    }
    loading.value = false
  }).catch(error => {
    ElMessage.error('获取课程详情失败: ' + (error.message || ''))
    loading.value = false
  })
}

function loadReviews() {
  getCourseReviews(courseId, { page: 1, size: 5 }).then(data => {
    reviews.value = data.reviews || []
  }).catch(() => {
    reviews.value = []
  })
}

function loadChapters() {
  getCourseChapters(courseId).then(data => {
    chapters.value = data.chapters || []
  }).catch(() => {
    chapters.value = []
  })
}

function loadRecommendations() {
  getCourseDetail(courseId).then(data => {
    recommendations.value = data.recommendations || []
  }).catch(() => {
    recommendations.value = []
  })
}

onMounted(() => {
  loadCourseDetail()
  loadReviews()
  loadChapters()
  loadRecommendations()
})
</script>

<style scoped>
.course-detail {
  max-width: 1200px;
}

.course-header {
  display: flex;
  gap: var(--spacing-xl);
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
  margin-bottom: var(--spacing-xl);
}

.course-cover-large {
  width: 400px;
  aspect-ratio: 16/9;
  border-radius: var(--radius-xl);
  overflow: hidden;
  position: relative;
}

.course-cover-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.course-header-info {
  flex: 1;
}

.course-category-tag {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.course-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: var(--spacing-lg);
}

.course-stats {
  display: flex;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.stat-value {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--gray-800);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

.course-teacher-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--gray-50);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-lg);
}

.teacher-detail {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.teacher-name {
  font-weight: 500;
  color: var(--gray-800);
}

.teacher-title {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

.course-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--gray-100);
}

.course-price-section {
  display: flex;
  flex-direction: column;
}

.price-label {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

.price-value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--accent-orange);
}

.price-free {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--green-500);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-md);
}

.course-content {
  display: flex;
  gap: var(--spacing-xl);
}

.content-main {
  flex: 1;
}

.content-section {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
  margin-bottom: var(--spacing-xl);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: var(--spacing-lg);
}

.course-description {
  font-size: var(--font-size-base);
  color: var(--gray-600);
  line-height: 1.8;
}

.chapters-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.chapter-item {
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.chapter-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--gray-50);
}

.chapter-number {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--primary-500);
}

.chapter-title {
  flex: 1;
  font-weight: 500;
  color: var(--gray-800);
}

.chapter-duration {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

.chapter-lessons {
  padding: var(--spacing-md);
}

.lesson-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.lesson-item:hover {
  background: var(--gray-50);
}

.lesson-item.completed {
  color: var(--green-500);
}

.lesson-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lesson-title {
  flex: 1;
  font-size: var(--font-size-sm);
}

.lesson-duration {
  font-size: var(--font-size-xs);
  color: var(--gray-400);
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.review-item {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--gray-100);
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.review-user {
  display: flex;
  flex-direction: column;
}

.review-name {
  font-weight: 500;
  color: var(--gray-800);
}

.review-date {
  font-size: var(--font-size-xs);
  color: var(--gray-400);
}

.review-rating {
  display: flex;
  gap: var(--spacing-xs);
}

.review-rating .el-icon {
  color: var(--gray-300);
}

.review-rating .el-icon.active {
  color: var(--yellow-400);
}

.review-content {
  font-size: var(--font-size-sm);
  color: var(--gray-600);
  line-height: 1.6;
}

.content-sidebar {
  width: 300px;
}

.sidebar-card {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-xl);
}

.sidebar-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: var(--spacing-lg);
}

.recommend-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.recommend-item {
  display: flex;
  gap: var(--spacing-md);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.recommend-item:hover {
  background: var(--gray-50);
}

.recommend-cover {
  width: 80px;
  height: 50px;
  border-radius: var(--radius-md);
  object-fit: cover;
}

.recommend-info {
  display: flex;
  flex-direction: column;
}

.recommend-name {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--gray-800);
}

.recommend-rating {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--gray-500);
}

.recommend-rating .el-icon {
  color: var(--yellow-400);
}

@media (max-width: 1023px) {
  .course-header {
    flex-direction: column;
  }
  
  .course-cover-large {
    width: 100%;
  }
  
  .course-content {
    flex-direction: column;
  }
  
  .content-sidebar {
    width: 100%;
  }
}

@media (max-width: 767px) {
  .course-stats {
    flex-wrap: wrap;
    gap: var(--spacing-md);
  }
  
  .course-actions {
    flex-direction: column;
    gap: var(--spacing-lg);
  }
  
  .action-buttons {
    width: 100%;
    flex-direction: column;
  }
}
</style>
