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
          
          <div class="course-actions" v-if="!isTeacherPreview">
            
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
              <el-button v-if="isEnrolled" type="danger" plain size="large" @click="handleWithdraw">退课</el-button>
              <el-button 
                size="large" 
                disabled
                v-if="!isEnrolled && course.status !== 'online'"
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
          
          <!-- 课程目录 -->
          <section class="content-section">
            <div class="section-heading">
              <h2 class="section-title">课程目录</h2>
              <el-button v-if="directoryItems.length > catalogPreviewCount" type="primary" size="large" @click="catalogExpanded = !catalogExpanded">
                {{ catalogExpanded ? '收起目录' : '展开全部章节' }}
              </el-button>
            </div>
            <div class="catalog-list" v-if="directoryItems.length">
              <div class="catalog-item" v-for="item in visibleDirectoryItems" :key="item.key">
                <div class="catalog-section" v-if="item.type === 'section'">
                  <span class="catalog-section-order">{{ item.order }}</span>
                  <span>{{ item.title }}</span>
                </div>
                <div class="catalog-lesson" v-else>
                  <span class="catalog-lesson-order">{{ item.order }}</span>
                  <span class="catalog-lesson-title">{{ item.title }}</span>
                  <span class="catalog-duration">{{ item.duration ? Math.round(item.duration / 60) + '分钟' : '' }}</span>
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无课程目录" />
          </section>
          
          <!-- 课程评论 -->
          <section class="content-section">
            <h2 class="section-title">学员评价</h2>
            
            <div class="comments-list" v-if="comments.length > 0">
              <div class="comment-item" v-for="comment in comments" :key="comment.commentId">
                <div class="comment-avatar">
                  <el-icon :size="32"><User /></el-icon>
                </div>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author">{{ comment.studentName }}</span>
                    <span class="comment-time">{{ formatDate(comment.createTime) }}</span>
                  </div>
                  <p class="comment-text">{{ comment.content }}</p>
                  <div class="comment-actions">
                    <button @click="handleLike(comment)" class="action-btn">
                      <el-icon><ThumbUp /></el-icon>
                      {{ comment.likeCount || 0 }}
                    </button>
                    <button @click="handleReply(comment)" class="action-btn">
                      <el-icon><ChatLineRound /></el-icon>
                      回复
                    </button>
                  </div>
                  
                  <div v-if="comment.replies && comment.replies.length" class="replies-list">
                    <div v-for="reply in comment.replies" :key="reply.commentId" class="reply-item">
                      <div class="reply-avatar">
                        <el-icon :size="24"><User /></el-icon>
                      </div>
                      <div class="reply-content">
                        <div class="reply-header">
                          <span class="reply-author">{{ reply.studentName }}</span>
                          <span class="reply-time">{{ formatDate(reply.createTime) }}</span>
                        </div>
                        <p class="reply-text">{{ reply.content }}</p>
                        <div class="reply-actions">
                          <button @click="handleLike(reply)" class="action-btn">
                            <el-icon><ThumbUp /></el-icon>
                            {{ reply.likeCount || 0 }}
                          </button>
                          <button @click="handleReply(reply)" class="action-btn">
                            <el-icon><ChatLineRound /></el-icon>
                            回复
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div v-if="replyingTo === comment.commentId" class="reply-input-box">
                    <input 
                      v-model="replyContent" 
                      type="text" 
                      placeholder="输入回复内容..." 
                      class="reply-input"
                      @keyup.enter="submitReply(comment.commentId)"
                    />
                    <button @click="submitReply(comment.commentId)" class="submit-reply-btn">发送</button>
                    <button @click="cancelReply" class="cancel-reply-btn">取消</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="!comments.length" class="no-comments">
              <el-icon :size="48"><Message /></el-icon>
              <p>暂无评论，来说两句吧</p>
            </div>
            
            <div v-if="isEnrolled && !isTeacherPreview" class="comments-footer">
              <textarea 
                v-model="newComment" 
                placeholder="发表评论..." 
                class="comment-input"
                rows="3"
                maxlength="500"
              ></textarea>
              <div class="comment-submit-bar">
                <span class="char-count">{{ newComment.length }}/500</span>
                <button @click="submitComment" class="submit-btn" :disabled="!newComment.trim()">
                  发表
                </button>
              </div>
            </div>
            
            <div v-else-if="!isTeacherPreview" class="login-prompt">
              <el-button type="primary" @click="startStudy">登录后发表评论</el-button>
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
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { courseCoverUrl, useFallbackCover } from '../../utils/assets.js'
import { getCourseDetail, enrollCourse, withdrawCourse, favoriteCourse, getCourseChapters, getCourseComments, addCourseComment, likeComment } from '../../api/course.js'

const router = useRouter()
const route = useRoute()
const isTeacherPreview = computed(() => route.meta.teacherPreview === true)

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
  description: '',
  teacherId: '',
  teacherName: '',
  teacherTitle: '',
  status: ''
})

const chapters = ref([])
const sections = ref([])
const catalogExpanded = ref(false)
const catalogPreviewCount = 8
const recommendations = ref([])

const comments = ref([])
const newComment = ref('')
const replyingTo = ref('')
const replyContent = ref('')

const directoryItems = computed(() => {
  if (sections.value.length) {
    return sections.value.flatMap((section, sectionIndex) => {
      const items = [{
        type: 'section',
        key: section.sectionId || `section-${sectionIndex}`,
        order: section.sectionOrder || sectionIndex + 1,
        title: section.sectionName
      }]
      for (const lesson of section.lessons || []) {
        items.push({
          type: 'lesson',
          key: lesson.chapterId,
          order: lesson.chapterOrder || '',
          title: lesson.chapterName,
          duration: lesson.duration
        })
      }
      return items
    })
  }
  return chapters.value.map((chapter, index) => ({
    type: 'lesson',
    key: chapter.chapterId,
    order: index + 1,
    title: chapter.chapterName,
    duration: chapter.duration
  }))
})

const visibleDirectoryItems = computed(() => {
  return catalogExpanded.value ? directoryItems.value : directoryItems.value.slice(0, catalogPreviewCount)
})

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

async function handleWithdraw() {
  try {
    await ElMessageBox.confirm('退课后学习进度、成绩与历史作业仍会保留，重新选课可继续学习。确认退课？', '确认退课', { type: 'warning' })
    await withdrawCourse(courseId)
    isEnrolled.value = false
    course.value.studentCount = Math.max(0, Number(course.value.studentCount || 0) - 1)
    ElMessage.success('退课成功，相关学习数据已保留')
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') ElMessage.error(error.message || '退课失败')
  }
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
      coverImage: data.coverImage || '/uploads/course-covers/default-image.jpg',
      rating: data.rating || 0,
      studentCount: data.studentCount || 0,
      totalHours: data.totalHours || 0,
      description: data.description || '',
      teacherId: data.teacherId,
      teacherName: data.teacherName || '',
      teacherTitle: data.teacherTitle || '',
      status: data.status
    }
    sections.value = Array.isArray(data.sections) ? data.sections : []
    if (data.enrolled !== undefined) {
      isEnrolled.value = data.enrolled
    }
    loading.value = false
  }).catch(error => {
    ElMessage.error('获取课程详情失败: ' + (error.message || ''))
    loading.value = false
  })
}

function loadChapters() {
  getCourseChapters(courseId).then(data => {
    chapters.value = Array.isArray(data) ? data : (data.chapters || [])
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

async function loadComments() {
  try {
    const data = await getCourseComments(courseId)
    comments.value = data || []
  } catch (error) {
    console.error('加载评论失败:', error)
    comments.value = []
  }
}

async function submitComment() {
  if (!newComment.value.trim()) return
  
  try {
    await addCourseComment({
      courseId: courseId,
      content: newComment.value.trim()
    })
    ElMessage.success('评论发表成功')
    newComment.value = ''
    await loadComments()
  } catch (error) {
    ElMessage.error('评论发表失败')
    console.error('发表评论失败:', error)
  }
}

async function handleLike(comment) {
  try {
    await likeComment(comment.commentId)
    comment.likeCount = (comment.likeCount || 0) + 1
    ElMessage.success('点赞成功')
  } catch (error) {
    ElMessage.error('点赞失败')
    console.error('点赞失败:', error)
  }
}

function handleReply(comment) {
  replyingTo.value = comment.commentId
  replyContent.value = ''
}

function cancelReply() {
  replyingTo.value = ''
  replyContent.value = ''
}

async function submitReply(parentId) {
  if (!replyContent.value.trim()) return
  
  try {
    await addCourseComment({
      courseId: courseId,
      content: replyContent.value.trim(),
      parentId: parentId
    })
    ElMessage.success('回复成功')
    cancelReply()
    await loadComments()
  } catch (error) {
    ElMessage.error('回复失败')
    console.error('回复失败:', error)
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

onMounted(() => {
  loadCourseDetail()
  loadChapters()
  loadRecommendations()
  loadComments()
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

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.section-heading .section-title {
  margin-bottom: 0;
}

.catalog-toggle-btn {
  flex-shrink: 0;
  border-radius: var(--radius-md);
  font-weight: 500;
}

.course-description {
  font-size: var(--font-size-base);
  color: var(--gray-600);
  line-height: 1.8;
}

.catalog-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.catalog-item {
  border-radius: var(--radius-md);
}

.catalog-section,
.catalog-lesson {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-height: 38px;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
}

.catalog-section {
  background: var(--gray-50);
  color: var(--gray-800);
  font-weight: 600;
}

.catalog-lesson {
  margin-left: var(--spacing-lg);
  border: 1px solid var(--gray-100);
}

.catalog-section-order,
.catalog-lesson-order {
  flex: 0 0 auto;
  min-width: 34px;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--primary-500);
}

.catalog-lesson-title {
  flex: 1;
  font-weight: 500;
  color: var(--gray-800);
}

.catalog-duration {
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

.comments-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.comment-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--gray-100);
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-400);
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
}

.comment-author {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--gray-800);
}

.comment-time {
  font-size: var(--font-size-xs);
  color: var(--gray-400);
}

.comment-text {
  font-size: var(--font-size-sm);
  color: var(--gray-700);
  line-height: 1.6;
  margin: 0 0 var(--spacing-sm) 0;
  word-break: break-word;
}

.comment-actions {
  display: flex;
  gap: var(--spacing-lg);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: none;
  border: none;
  font-size: var(--font-size-xs);
  color: var(--gray-400);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background: var(--gray-100);
  color: var(--gray-600);
}

.replies-list {
  margin-top: var(--spacing-md);
  padding-left: var(--spacing-lg);
  border-left: 2px solid #f0f0f0;
}

.reply-item {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.reply-item:last-child {
  margin-bottom: 0;
}

.reply-avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-400);
}

.reply-content {
  flex: 1;
  min-width: 0;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: 2px;
}

.reply-author {
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--gray-700);
}

.reply-time {
  font-size: 10px;
  color: var(--gray-400);
}

.reply-text {
  font-size: var(--font-size-xs);
  color: var(--gray-600);
  line-height: 1.5;
  margin: 0 0 var(--spacing-xs) 0;
  word-break: break-word;
}

.reply-actions {
  display: flex;
  gap: var(--spacing-md);
}

.reply-input-box {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
  align-items: center;
}

.reply-input {
  flex: 1;
  padding: var(--spacing-sm);
  border: 1px solid #e5e7eb;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  outline: none;
  transition: border-color var(--transition-fast);
}

.reply-input:focus {
  border-color: var(--primary-400);
}

.submit-reply-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--primary-500);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.submit-reply-btn:hover {
  background: var(--primary-600);
}

.cancel-reply-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background: none;
  color: var(--gray-500);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.cancel-reply-btn:hover {
  background: var(--gray-100);
  color: var(--gray-700);
}

.no-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl);
  color: var(--gray-400);
}

.no-comments p {
  margin-top: var(--spacing-md);
  font-size: var(--font-size-sm);
}

.comments-footer {
  padding-top: var(--spacing-md);
  border-top: 1px solid #f0f0f0;
  margin-top: var(--spacing-md);
}

.comment-input {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid #e5e7eb;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  resize: none;
  outline: none;
  transition: border-color var(--transition-fast);
  box-sizing: border-box;
}

.comment-input:focus {
  border-color: var(--primary-400);
}

.comment-submit-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--spacing-sm);
}

.char-count {
  font-size: var(--font-size-xs);
  color: var(--gray-400);
}

.submit-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--primary-500);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.submit-btn:hover:not(:disabled) {
  background: var(--primary-600);
}

.submit-btn:disabled {
  background: var(--gray-300);
  cursor: not-allowed;
}

.login-prompt {
  display: flex;
  justify-content: center;
  padding: var(--spacing-lg);
  margin-top: var(--spacing-md);
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
