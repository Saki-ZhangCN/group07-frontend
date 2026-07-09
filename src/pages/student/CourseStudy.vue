<template>
  <div class="study-container">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h3>{{ courseTitle }}</h3>
      </div>
      <div class="progress-section">
        <div class="progress-circle">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#f0f0f0" stroke-width="8"/>
            <circle cx="50" cy="50" r="45" fill="none" :stroke="progressColor" stroke-width="8"
              :stroke-dasharray="circumference" :stroke-dashoffset="progressOffset" stroke-linecap="round"/>
          </svg>
          <span class="progress-text">{{ overallProgress }}%</span>
        </div>
        <p class="progress-label">已学</p>
        <button @click="goToCourseDetail" class="course-detail-btn">课程详情</button>
      </div>
      <div class="chapter-list">
        <div v-for="section in sections" :key="section.sectionId" class="chapter-section">
          <div class="chapter-title" @click="toggleSection(section.sectionId)">
            <el-icon class="expand-icon"><ArrowDown v-if="expandedSections.includes(section.sectionId)" /><ArrowRight v-else /></el-icon>
            <span>{{ section.sectionOrder }} {{ section.sectionName }}</span>
          </div>
          <div v-show="expandedSections.includes(section.sectionId)" class="lesson-list">
            <div 
              v-for="lesson in section.lessons" 
              :key="lesson.chapterId" 
              class="lesson-item"
            >
              <div class="lesson-title">
                <span class="lesson-order">{{ lesson.chapterOrder }}</span>
                <span class="lesson-name">{{ lesson.chapterName }}</span>
              </div>
              <div class="resource-list">
                <button 
                  v-for="video in lesson.videos" 
                  :key="video.id" 
                  @click="select(section, lesson, video, 'video')"
                  :class="{ active: current?.id === video.id && kind === 'video' }"
                  class="resource-btn video-btn"
                >
                  <el-icon><VideoPlay /></el-icon>
                  <span>{{ video.title }}</span>
                  <span v-if="isResourceCompleted('video', video.id)" class="completed-check" title="已学完">✓</span>
                </button>
                <button 
                  v-for="material in lesson.materials" 
                  :key="material.id" 
                  @click="select(section, lesson, material, 'material')"
                  :class="{ active: current?.id === material.id && kind === 'material' }"
                  class="resource-btn material-btn"
                >
                  <el-icon><Document /></el-icon>
                  <span>{{ material.title }}</span>
                  <span v-if="isResourceCompleted('pdf', material.id)" class="completed-check" title="已学完">✓</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
    
    <main class="content-area">
      <template v-if="current">
        <div class="content-header">
          <h2>{{ current.sectionName }}</h2>
          <h3>{{ current.chapterName }} · {{ current.title }}</h3>
        </div>
        
        <div v-if="kind === 'video'" class="video-player-wrapper">
          <video ref="videoPlayerRef" :src="resourceUrl(current.url)" controls controlsList="nodownload" class="video-player"
            @contextmenu.prevent
            @loadedmetadata="onVideoLoaded" @timeupdate="onVideoTimeUpdate"
            @seeking="onVideoSeeking" @seeked="onVideoSeeked"
            @play="onVideoPlay" @pause="onVideoPause" @ended="onVideoEnded">
            您的浏览器不支持视频播放
          </video>
        </div>
        
        <div v-else class="pdf-viewer-wrapper"><PdfViewer :src="resourceUrl(current.url)" :title="current.title" /></div>
        
        <div class="content-footer">
          <button v-if="prevResource" @click="selectPrev" class="nav-btn prev-btn">
            <el-icon><ArrowLeft /></el-icon>
            上一资源
          </button>
          <button v-if="nextResource" @click="selectNext" class="nav-btn next-btn">
            下一资源
            <el-icon><ArrowRight /></el-icon>
          </button>
          <button @click="toggleComments" class="comment-toggle-btn" :class="{ active: showComments }">
            <el-icon><ChatDotRound /></el-icon>
            {{ commentCount }}条评论
          </button>
        </div>
      </template>
      
      <div v-else class="empty-state">
        <el-icon :size="48"><FolderOpened /></el-icon>
        <p>请选择一个小节的学习资源</p>
      </div>
    </main>
    
    <aside class="comments-panel" :class="{ show: showComments }">
      <div class="comments-header">
        <h3>评论（{{ commentCount }}）</h3>
        <button @click="toggleComments" class="close-btn">
          <el-icon><Close /></el-icon>
        </button>
      </div>
      
      <div class="comments-list">
        <div v-for="comment in comments" :key="comment.commentId" class="comment-item">
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
        
        <div v-if="!comments.length" class="no-comments">
          <el-icon :size="48"><Message /></el-icon>
          <p>暂无评论，来说两句吧</p>
        </div>
      </div>
      
      <div class="comments-footer">
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
    </aside>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getStudentContent } from '../../api/courseContent.js'
import { getCourseComments, addCourseComment, likeComment, getCommentCount } from '../../api/course.js'
import { reportStudyDuration, getCourseProgress, completeLearningResource } from '../../api/analysis.js'
import { ElMessage } from 'element-plus'
import PdfViewer from '../../components/PdfViewer.vue'
import { resourceUrl } from '../../utils/assets.js'

const route = useRoute()
const router = useRouter()
const sections = ref([])
const current = ref(null)
const kind = ref('')
const courseTitle = ref('')
const expandedSections = ref([])

const circumference = 2 * Math.PI * 45
const overallProgress = ref(0)

const progressColor = computed(() => {
  if (overallProgress.value >= 100) return '#22c55e'
  if (overallProgress.value >= 50) return '#f59e0b'
  return '#3b82f6'
})

const progressOffset = computed(() => {
  return circumference - (overallProgress.value / 100) * circumference
})

const showComments = ref(false)
const comments = ref([])
const commentCount = ref(0)
const newComment = ref('')
const replyingTo = ref('')
const replyContent = ref('')

// 学习时长追踪
const studyAccumulatedSeconds = ref(0)
const studyTimer = ref(null)
const studyReportTimer = ref(null)
const currentChapterId = ref('')
const currentResourceId = ref('')
const videoPlayerRef = ref(null)
const isVideoPlaying = ref(false)
const isPageVisible = ref(true)
const completedKeys = ref(new Set())
let watchedSeconds = new Set()
let lastVideoTime = 0
let lastVideoTickAt = 0
let videoSeeking = false

function getChapterId() {
  if (!current.value) return ''
  const sectionsVal = sections.value
  for (const section of sectionsVal) {
    for (const lesson of (section.lessons || [])) {
      const allResources = [
        ...(lesson.videos || []).map(v => ({ ...v, kind: 'video' })),
        ...(lesson.materials || []).map(m => ({ ...m, kind: 'material' }))
      ]
      for (const r of allResources) {
        if (r.id === current.value.id && r.kind === kind.value) {
          return lesson.chapterId || ''
        }
      }
    }
  }
  return ''
}

function startStudyTracking() {
  stopStudyTracking()
  studyAccumulatedSeconds.value = 0
  currentChapterId.value = getChapterId()
  currentResourceId.value = current.value?.id || ''
  
  studyTimer.value = setInterval(() => {
    if (kind.value === 'video') {
      if (isVideoPlaying.value && isPageVisible.value) {
        studyAccumulatedSeconds.value++
      }
    } else if (kind.value === 'material') {
      if (isPageVisible.value) {
        studyAccumulatedSeconds.value++
      }
    }
  }, 1000)
  
  studyReportTimer.value = setInterval(() => {
    if (studyAccumulatedSeconds.value >= 30) {
      reportTime()
    }
  }, 30000)
}

function stopStudyTracking() {
  if (studyTimer.value) {
    clearInterval(studyTimer.value)
    studyTimer.value = null
  }
  if (studyReportTimer.value) {
    clearInterval(studyReportTimer.value)
    studyReportTimer.value = null
  }
}

async function reportTime() {
  if (studyAccumulatedSeconds.value < 5) return
  const seconds = studyAccumulatedSeconds.value
  studyAccumulatedSeconds.value = 0
  
  try {
    await reportStudyDuration({
      courseId: route.params.courseId,
      chapterId: currentChapterId.value || undefined,
      resourceType: kind.value === 'video' ? 'video' : 'pdf',
      resourceId: currentResourceId.value || undefined,
      duration: seconds
    })
    console.log(`学习时长已上报：${seconds}秒，类型：${kind.value}`)
  } catch (error) {
    console.error('学习时长上报失败:', error)
    studyAccumulatedSeconds.value += seconds
  }
}

function onVideoPlay() {
  isVideoPlaying.value = true
  lastVideoTime = videoPlayerRef.value?.currentTime || 0
  lastVideoTickAt = performance.now()
}

function onVideoLoaded() {
  watchedSeconds = new Set()
  lastVideoTime = videoPlayerRef.value?.currentTime || 0
  lastVideoTickAt = performance.now()
  videoSeeking = false
}

function onVideoSeeking() {
  videoSeeking = true
}

function onVideoSeeked() {
  lastVideoTime = videoPlayerRef.value?.currentTime || 0
  lastVideoTickAt = performance.now()
  videoSeeking = false
}

function onVideoTimeUpdate() {
  const player = videoPlayerRef.value
  if (!player || videoSeeking || player.paused || !isPageVisible.value) return
  const now = player.currentTime
  const tickAt = performance.now()
  const delta = now - lastVideoTime
  const elapsedSeconds = lastVideoTickAt ? Math.max(0.1, (tickAt - lastVideoTickAt) / 1000) : 0.25
  const playbackRate = Math.max(0.25, Number(player.playbackRate || 1))
  const maxNaturalDelta = Math.max(2, elapsedSeconds * playbackRate + 1.2)
  if (delta > 0 && delta <= maxNaturalDelta) {
    for (let second = Math.floor(lastVideoTime); second <= Math.floor(now); second++) watchedSeconds.add(second)
  }
  lastVideoTime = now
  lastVideoTickAt = tickAt
}

function onVideoPause() {
  isVideoPlaying.value = false
}

async function onVideoEnded() {
  isVideoPlaying.value = false
  reportTime()
  const duration = videoPlayerRef.value?.duration || 0
  const required = Math.max(1, Math.ceil(duration * 0.9))
  if (duration > 0 && watchedSeconds.size >= required) {
    await markCurrentResourceComplete('video')
  } else {
    const percent = duration > 0 ? Math.round((watchedSeconds.size / duration) * 100) : 0
    ElMessage.warning(`视频真实观看进度约 ${percent}%，需达到 90% 才计入已学`)
  }
}

async function loadProgress() {
  const data = await getCourseProgress(route.params.courseId)
  overallProgress.value = normalizeProgress(data?.progress)
  completedKeys.value = new Set(data?.completedKeys || [])
}

function normalizeProgress(value) {
  return Math.round(Number(value || 0))
}

function parseOrderParts(value) {
  const text = String(value ?? '').trim()
  if (!text) return [Number.MAX_SAFE_INTEGER]
  return text.split('.').map(part => {
    const number = Number.parseInt(part, 10)
    return Number.isFinite(number) ? number : Number.MAX_SAFE_INTEGER
  })
}

function compareNaturalOrder(a, b, field) {
  const left = parseOrderParts(a?.[field])
  const right = parseOrderParts(b?.[field])
  const length = Math.max(left.length, right.length)
  for (let i = 0; i < length; i++) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0)
    if (diff !== 0) return diff
  }
  return String(a?.[field] ?? '').localeCompare(String(b?.[field] ?? ''), 'zh-Hans-CN', { numeric: true })
}

function normalizeSectionsOrder(rawSections) {
  return [...(rawSections || [])]
    .sort((a, b) => compareNaturalOrder(a, b, 'sectionOrder'))
    .map(section => ({
      ...section,
      lessons: [...(section.lessons || [])].sort((a, b) => compareNaturalOrder(a, b, 'chapterOrder'))
    }))
}

function resourceKey(resourceType, resourceId) {
  const normalizedType = resourceType === 'material' ? 'pdf' : resourceType
  return `${normalizedType}:${resourceId}`
}

function isResourceCompleted(resourceType, resourceId) {
  return completedKeys.value.has(resourceKey(resourceType, resourceId))
}

async function markCurrentResourceComplete(resourceType) {
  if (!current.value || !currentChapterId.value) return
  const key = resourceKey(resourceType, current.value.id)
  if (completedKeys.value.has(key)) return
  try {
    const data = await completeLearningResource({
      courseId: route.params.courseId,
      chapterId: currentChapterId.value,
      resourceType,
      resourceId: current.value.id
    })
    overallProgress.value = normalizeProgress(data?.progress)
    completedKeys.value = new Set(data?.completedKeys || [])
    ElMessage.success(resourceType === 'video' ? '视频已完整学习' : '资料已计入学习进度')
  } catch (error) {
    console.error('更新学习进度失败:', error)
  }
}

function onVisibilityChange() {
  isPageVisible.value = !document.hidden
  if (isPageVisible.value && videoPlayerRef.value) {
    lastVideoTime = videoPlayerRef.value.currentTime || 0
    lastVideoTickAt = performance.now()
  }
}

function handleBeforeUnload() {
  reportTime()
}

function goToCourseDetail() {
  router.push(`/student/course/${route.params.courseId}`)
}

function toggleSection(sectionId) {
  const index = expandedSections.value.indexOf(sectionId)
  if (index > -1) {
    expandedSections.value.splice(index, 1)
  } else {
    expandedSections.value.push(sectionId)
  }
}

function select(s, l, r, k) {
  reportTime()
  current.value = { ...r, sectionName: s.sectionName, chapterName: l.chapterName }
  kind.value = k
  currentChapterId.value = l.chapterId || ''
  if (!expandedSections.value.includes(s.sectionId)) {
    expandedSections.value.push(s.sectionId)
  }
  setTimeout(() => startStudyTracking(), 100)
  if (k === 'material') setTimeout(() => markCurrentResourceComplete('pdf'), 0)
}

function findResourceIndex() {
  if (!current.value || !sections.value.length) return null
  
  for (let sIdx = 0; sIdx < sections.value.length; sIdx++) {
    const section = sections.value[sIdx]
    for (let lIdx = 0; lIdx < (section.lessons || []).length; lIdx++) {
      const lesson = section.lessons[lIdx]
      const allResources = [
        ...(lesson.videos || []).map(v => ({ ...v, kind: 'video' })),
        ...(lesson.materials || []).map(m => ({ ...m, kind: 'material' }))
      ]
      for (let rIdx = 0; rIdx < allResources.length; rIdx++) {
        if (allResources[rIdx].id === current.value.id && allResources[rIdx].kind === kind.value) {
          return { sIdx, lIdx, rIdx, allResources }
        }
      }
    }
  }
  return null
}

function selectPrev() {
  const idx = findResourceIndex()
  if (!idx) return
  
  if (idx.rIdx > 0) {
    const prev = idx.allResources[idx.rIdx - 1]
    select(sections.value[idx.sIdx], sections.value[idx.sIdx].lessons[idx.lIdx], prev, prev.kind)
  }
}

function selectNext() {
  const idx = findResourceIndex()
  if (!idx) return
  
  if (idx.rIdx < idx.allResources.length - 1) {
    const next = idx.allResources[idx.rIdx + 1]
    select(sections.value[idx.sIdx], sections.value[idx.sIdx].lessons[idx.lIdx], next, next.kind)
  }
}

const prevResource = computed(() => {
  const idx = findResourceIndex()
  return idx && idx.rIdx > 0
})

const nextResource = computed(() => {
  const idx = findResourceIndex()
  return idx && idx.rIdx < idx.allResources.length - 1
})

function toggleComments() {
  showComments.value = !showComments.value
  if (showComments.value) {
    loadComments()
  }
}

async function loadCommentCount() {
  try {
    const count = await getCommentCount(route.params.courseId)
    commentCount.value = Number(count || 0)
  } catch (error) {
    console.error('加载评论数量失败:', error)
  }
}

async function loadComments() {
  try {
    const data = await getCourseComments(route.params.courseId)
    comments.value = data || []
    commentCount.value = comments.value.length
  } catch (error) {
    console.error('加载评论失败:', error)
  }
}

async function submitComment() {
  if (!newComment.value.trim()) return
  
  try {
    await addCourseComment({
      courseId: route.params.courseId,
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
      courseId: route.params.courseId,
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

onMounted(async () => {
  const courseId = route.params.courseId
  if (!courseId) {
    ElMessage.error('课程ID无效')
    return
  }
  try {
    sections.value = normalizeSectionsOrder(await getStudentContent(courseId))
  } catch (error) {
    console.error('加载课程内容失败:', error)
    return
  }
  try {
    await loadProgress()
  } catch (error) {
    console.error('加载学习进度失败:', error)
  }
  loadCommentCount()
  let firstResource = null
  for (const section of sections.value) {
    expandedSections.value.push(section.sectionId)
    for (const lesson of section.lessons || []) {
      if (!firstResource && lesson.videos?.length) firstResource = [section, lesson, lesson.videos[0], 'video']
      if (!firstResource && lesson.materials?.length) firstResource = [section, lesson, lesson.materials[0], 'material']
    }
  }
  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('beforeunload', handleBeforeUnload)
  if (firstResource) select(...firstResource)
})

onBeforeUnmount(() => {
  stopStudyTracking()
  reportTime()
  document.removeEventListener('visibilitychange', onVisibilityChange)
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style scoped>
.study-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--spacing-lg);
  min-height: calc(100vh - 80px);
  transition: grid-template-columns 0.3s ease;
}

.study-container.with-comments {
  grid-template-columns: 280px 1fr 380px;
}

.sidebar {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  position: sticky;
  top: var(--spacing-lg);
  height: fit-content;
}

.sidebar-header h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--gray-800);
  margin: 0 0 var(--spacing-lg) 0;
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid #f0f0f0;
}

.progress-section {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-xl);
  border-bottom: 1px solid #f0f0f0;
}

.progress-circle {
  position: relative;
  width: 90px;
  height: 90px;
  margin: 0 auto var(--spacing-sm) auto;
}

.progress-circle svg {
  transform: rotate(-90deg);
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--gray-800);
}

.progress-label {
  font-size: var(--font-size-xs);
  color: var(--gray-500);
  margin: 0;
}

.course-detail-btn {
  margin-top: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-xs);
  color: var(--primary-500);
  background: rgba(59, 130, 246, 0.08);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.course-detail-btn:hover {
  background: rgba(59, 130, 246, 0.15);
  color: var(--primary-600);
}

.chapter-list {
  max-height: calc(100vh - 300px);
  overflow-y: auto;
}

.chapter-section {
  margin-bottom: var(--spacing-md);
}

.chapter-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--gray-700);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.chapter-title:hover {
  background: var(--gray-50);
}

.expand-icon {
  font-size: var(--font-size-xs);
  color: var(--gray-400);
}

.lesson-list {
  margin-left: var(--spacing-md);
  padding-left: var(--spacing-md);
  border-left: 2px solid #f0f0f0;
}

.lesson-item {
  margin-bottom: var(--spacing-md);
}

.lesson-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xs);
  color: var(--gray-600);
  margin-bottom: var(--spacing-xs);
}

.lesson-order {
  font-size: var(--font-size-xs);
  color: var(--gray-400);
}

.lesson-name {
  font-size: var(--font-size-xs);
}

.resource-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.resource-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.resource-btn span:nth-of-type(1) {
  flex: 1;
  min-width: 0;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.completed-check {
  flex: 0 0 18px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: #22c55e;
  box-shadow: 0 3px 8px rgba(34, 197, 94, 0.25);
}

.video-btn {
  background: rgba(249, 115, 22, 0.08);
  color: var(--accent-orange);
}

.video-btn:hover {
  background: rgba(249, 115, 22, 0.15);
}

.video-btn.active {
  background: rgba(249, 115, 22, 0.2);
  font-weight: 500;
}

.material-btn {
  background: rgba(59, 130, 246, 0.08);
  color: var(--blue-500);
}

.material-btn:hover {
  background: rgba(59, 130, 246, 0.15);
}

.material-btn.active {
  background: rgba(59, 130, 246, 0.2);
  font-weight: 500;
}

.content-area {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  min-height: calc(100vh - 80px);
}

.content-header {
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid #f0f0f0;
}

.content-header h2 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--gray-800);
  margin: 0 0 var(--spacing-xs) 0;
}

.content-header h3 {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--gray-600);
  margin: 0;
}

.video-player-wrapper {
  background: #1a1a1a;
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: var(--spacing-lg);
}

.video-player {
  width: 100%;
  max-height: 600px;
  display: block;
}

.pdf-viewer-wrapper {
  margin-bottom: var(--spacing-lg);
}

.pdf-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--gray-50);
  border-radius: var(--radius-lg);
}

.pdf-title {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--gray-700);
}

.pdf-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.download-btn,
.open-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.download-btn {
  background: rgba(34, 197, 94, 0.1);
  color: var(--green-500);
}

.download-btn:hover {
  background: rgba(34, 197, 94, 0.2);
}

.open-btn {
  background: rgba(59, 130, 246, 0.1);
  color: var(--blue-500);
}

.open-btn:hover {
  background: rgba(59, 130, 246, 0.2);
}

.pdf-container {
  background: #f8f9fa;
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
}

.pdf-iframe {
  width: 100%;
  height: 700px;
  border: none;
  border-radius: var(--radius-md);
  background: white;
}

.content-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--spacing-lg);
  border-top: 1px solid #f0f0f0;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.prev-btn {
  background: var(--gray-50);
  color: var(--gray-600);
}

.prev-btn:hover {
  background: var(--gray-100);
}

.next-btn {
  background: var(--primary-500);
  color: white;
}

.next-btn:hover {
  background: var(--primary-600);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl);
  color: var(--gray-400);
}

.empty-state p {
  margin-top: var(--spacing-md);
}

.comment-toggle-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  background: white;
  color: var(--gray-600);
}

.comment-toggle-btn:hover {
  border-color: var(--primary-400);
  color: var(--primary-500);
}

.comment-toggle-btn.active {
  background: var(--primary-50);
  border-color: var(--primary-500);
  color: var(--primary-500);
}

.comments-panel {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  position: fixed;
  right: -380px;
  top: calc(var(--spacing-lg) + 80px);
  width: 380px;
  height: calc(100vh - 80px - var(--spacing-lg) * 2);
  overflow-y: auto;
  transition: right 0.3s ease;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.05);
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.comments-panel.show {
  right: var(--spacing-lg);
}

.comments-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: var(--spacing-md);
  flex-shrink: 0;
}

.comments-header h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--gray-800);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: var(--font-size-lg);
  color: var(--gray-400);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background: var(--gray-100);
  color: var(--gray-600);
}

.comments-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.comment-item {
  display: flex;
  gap: var(--spacing-md);
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
  flex-shrink: 0;
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

@media (max-width: 1023px) {
  .study-container {
    grid-template-columns: 250px 1fr;
  }
  
  .comments-panel {
    width: 320px;
    right: -320px;
  }
}

@media (max-width: 767px) {
  .study-container {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    position: static;
  }
  
  .chapter-list {
    max-height: 300px;
  }
  
  .video-player {
    max-height: 400px;
  }
  
  .pdf-iframe {
    height: 500px;
  }
  
  .comments-panel {
    width: calc(100% - var(--spacing-lg) * 2);
    right: calc(-100% + var(--spacing-lg));
    top: calc(var(--spacing-lg) + 80px);
    height: calc(100vh - 80px - var(--spacing-lg) * 2);
  }
  
  .comments-panel.show {
    right: var(--spacing-lg);
  }
}
</style>
