<template>
  <div class="course-detail">
    <!-- 课程头部 -->
    <div class="course-header">
      <div class="course-cover-large">
        <img :src="course.coverImage" :alt="course.name" />
        <div class="play-overlay" v-if="isEnrolled">
          <el-button type="primary" size="large" circle @click="startStudy">
            <el-icon :size="32"><VideoPlay /></el-icon>
          </el-button>
        </div>
      </div>
      
      <div class="course-header-info">
        <div class="course-category-tag">
          <span class="badge badge-primary">{{ course.category }}</span>
          <span class="badge badge-live" v-if="course.isLive">
            <span class="live-dot"></span>
            直播中
          </span>
        </div>
        
        <h1 class="course-title">{{ course.name }}</h1>
        
        <div class="course-stats">
          <div class="stat-item">
            <el-icon><Star /></el-icon>
            <span class="stat-value">{{ course.rating }}</span>
            <span class="stat-label">评分</span>
          </div>
          <div class="stat-item">
            <el-icon><User /></el-icon>
            <span class="stat-value">{{ course.students }}</span>
            <span class="stat-label">学员</span>
          </div>
          <div class="stat-item">
            <el-icon><Clock /></el-icon>
            <span class="stat-value">{{ course.duration }}</span>
            <span class="stat-label">时长</span>
          </div>
        </div>
        
        <div class="course-teacher-info">
          <el-avatar :size="48" :src="course.teacherAvatar">
            <el-icon><UserFilled /></el-icon>
          </el-avatar>
          <div class="teacher-detail">
            <span class="teacher-name">{{ course.teacher }}</span>
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
              v-if="!isEnrolled"
              @click="handleEnroll"
            >
              立即选课
            </el-button>
            <el-button 
              type="primary" 
              size="large" 
              v-else
              @click="startStudy"
            >
              继续学习
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
              v-for="(chapter, index) in course.chapters" 
              :key="chapter.id"
            >
              <div class="chapter-header">
                <span class="chapter-number">第{{ index + 1 }}章</span>
                <span class="chapter-title">{{ chapter.title }}</span>
                <span class="chapter-duration">{{ chapter.duration }}</span>
              </div>
              <div class="chapter-lessons">
                <div 
                  class="lesson-item" 
                  v-for="lesson in chapter.lessons" 
                  :key="lesson.id"
                  :class="{ completed: lesson.completed }"
                >
                  <div class="lesson-icon">
                    <el-icon v-if="lesson.completed"><CircleCheck /></el-icon>
                    <el-icon v-else><VideoPlay /></el-icon>
                  </div>
                  <span class="lesson-title">{{ lesson.title }}</span>
                  <span class="lesson-duration">{{ lesson.duration }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <!-- 课程评价 -->
        <section class="content-section">
          <h2 class="section-title">学员评价</h2>
          <div class="reviews-list">
            <div class="review-item" v-for="review in reviews" :key="review.id">
              <div class="review-header">
                <el-avatar :size="40" :src="review.avatar">
                  <el-icon><UserFilled /></el-icon>
                </el-avatar>
                <div class="review-user">
                  <span class="review-name">{{ review.userName }}</span>
                  <span class="review-date">{{ review.date }}</span>
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
              :key="item.id"
              @click="goToCourse(item.id)"
            >
              <img :src="item.coverImage" :alt="item.name" class="recommend-cover" />
              <div class="recommend-info">
                <span class="recommend-name">{{ item.name }}</span>
                <span class="recommend-rating">
                  <el-icon><Star /></el-icon>
                  {{ item.rating }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const courseId = route.params.id
const isEnrolled = ref(false)

const course = ref({
  id: courseId,
  name: 'Java编程基础：从入门到精通',
  category: '编程开发',
  coverImage: 'https://picsum.photos/seed/java-detail/800/450',
  rating: 4.8,
  students: 2568,
  duration: '48小时',
  price: 99,
  isLive: true,
  teacher: '王老师',
  teacherTitle: '资深Java开发工程师',
  teacherAvatar: '',
  description: '本课程从Java基础语法开始，逐步深入到面向对象编程、集合框架、多线程编程、网络编程等核心内容。通过大量实战案例，帮助学员掌握Java开发的各项技能，为后续的企业级开发打下坚实基础。',
  chapters: [
    {
      id: '1',
      title: 'Java语言基础',
      duration: '8小时',
      lessons: [
        { id: '1-1', title: 'Java概述与环境搭建', duration: '30分钟', completed: true },
        { id: '1-2', title: '基本数据类型', duration: '45分钟', completed: true },
        { id: '1-3', title: '运算符与表达式', duration: '40分钟', completed: false }
      ]
    },
    {
      id: '2',
      title: '面向对象编程',
      duration: '12小时',
      lessons: [
        { id: '2-1', title: '类与对象', duration: '50分钟', completed: false },
        { id: '2-2', title: '继承与多态', duration: '60分钟', completed: false },
        { id: '2-3', title: '接口与抽象类', duration: '55分钟', completed: false }
      ]
    },
    {
      id: '3',
      title: '集合框架',
      duration: '10小时',
      lessons: [
        { id: '3-1', title: 'List接口与实现类', duration: '45分钟', completed: false },
        { id: '3-2', title: 'Set接口与实现类', duration: '40分钟', completed: false },
        { id: '3-3', title: 'Map接口与实现类', duration: '50分钟', completed: false }
      ]
    }
  ]
})

const reviews = ref([
  {
    id: '1',
    userName: '学员A',
    avatar: '',
    date: '2024-01-15',
    rating: 5,
    content: '课程内容非常详细，老师讲解清晰易懂，非常适合初学者入门。'
  },
  {
    id: '2',
    userName: '学员B',
    avatar: '',
    date: '2024-01-12',
    rating: 4,
    content: '整体不错，但是部分章节的练习题可以再多一些。'
  }
])

const recommendations = ref([
  {
    id: '4',
    name: '数据库原理与应用',
    coverImage: 'https://picsum.photos/seed/db-rec/200/120',
    rating: 4.5
  },
  {
    id: '5',
    name: 'Web前端开发',
    coverImage: 'https://picsum.photos/seed/web-rec/200/120',
    rating: 4.9
  },
  {
    id: '6',
    name: 'Spring Boot实战',
    coverImage: 'https://picsum.photos/seed/spring-rec/200/120',
    rating: 4.7
  }
])

function handleEnroll() {
  ElMessage.success('选课成功！')
  isEnrolled.value = true
}

function startStudy() {
  router.push(`/student/study/${courseId}`)
}

function handleFavorite() {
  ElMessage.success('已收藏课程')
}

function goToCourse(id) {
  router.push(`/student/course/${id}`)
}

onMounted(() => {
  // 加载课程详情数据
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