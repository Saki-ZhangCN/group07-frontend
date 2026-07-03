<template>
  <div class="course-audit">
    <div class="action-bar">
      <div class="filters">
        <el-select v-model="statusFilter" placeholder="审核状态" @change="loadCourses">
          <el-option label="待审核" value="pending" />
          <el-option label="已通过" value="online" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>
        
        <el-input
          v-model="searchKeyword"
          placeholder="搜索课程名称..."
          prefix-icon="Search"
          clearable
          @keyup.enter="loadCourses"
        />
      </div>
    </div>
    
    <div class="audit-list">
      <div class="audit-item" v-for="course in courses" :key="course.courseId">
        <div class="course-preview">
          <img :src="courseCoverUrl(course.coverImage)" :alt="course.courseName" class="course-cover" @error="useFallbackCover" />
          <div class="course-info">
            <div class="course-header">
              <span class="course-name">{{ course.courseName }}</span>
              <span class="status-badge" :class="getStatusClass(course.status)">
                {{ getStatusLabel(course.status) }}
              </span>
            </div>
            <p class="course-meta">
              讲师：{{ course.teacherName }} | 类别：{{ course.category }}
            </p>
            <p class="course-description">{{ course.description }}</p>
            <div class="course-stats">
              <span class="stat-item">
                <el-icon><Clock /></el-icon>
                {{ course.totalHours }}课时
              </span>
              <span class="stat-item">
                <el-icon><Coin /></el-icon>
              </span>
            </div>
          </div>
        </div>
        
        <div class="audit-actions">
          <div class="submit-info">
            <span class="submit-label">创建时间：</span>
            <span class="submit-time">{{ formatTime(course.createTime) }}</span>
          </div>
          
          <div class="action-buttons" v-if="course.status === 'pending'">
            <el-button type="primary" @click="viewDetail(course.courseId)">
              查看详情
            </el-button>
            <el-button type="success" @click="approveCourse(course)">
              通过审核
            </el-button>
            <el-button type="danger" @click="rejectCourse(course)">
              拒绝
            </el-button>
          </div>
          
          <div class="audit-result" v-else>
            <span class="result-text" :class="course.status">
              {{ course.status === 'online' ? '审核已通过' : '审核已拒绝' }}
            </span>
            <el-button size="small" @click="viewDetail(course.courseId)">查看</el-button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="pagination-section">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="totalCount"
        layout="total, sizes, prev, pager, next"
        background
        @size-change="loadCourses"
        @current-change="loadCourses"
      />
    </div>
    
    <el-dialog v-model="detailVisible" title="课程详情" width="700px" :before-close="closeDetail">
      <div v-if="detailLoading" class="detail-loading">
        <el-loading text="加载中..." />
      </div>
      <div v-else-if="detailCourse" class="detail-content">
        <div class="detail-header">
          <img :src="courseCoverUrl(detailCourse.coverImage)" :alt="detailCourse.courseName" class="detail-cover" @error="useFallbackCover" />
          <div class="detail-basic">
            <h2 class="detail-name">{{ detailCourse.courseName }}</h2>
            <div class="detail-meta">
              <span class="detail-status" :class="getStatusClass(detailCourse.status)">
                {{ getStatusLabel(detailCourse.status) }}
              </span>
              <span>讲师：{{ detailCourse.teacherName }}</span>
              <span>职称：{{ detailCourse.teacherTitle || '-' }}</span>
            </div>
            <div class="detail-stats">
              <span>分类：{{ detailCourse.category }}</span>
              <span>课时：{{ detailCourse.totalHours }}课时</span>
              <span>学员数：{{ detailCourse.studentCount || 0 }}人</span>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h3>课程简介</h3>
          <p>{{ detailCourse.description || '暂无简介' }}</p>
        </div>
        
        <div class="detail-section">
          <h3>课程章节</h3>
          <div v-if="detailCourse.sections && detailCourse.sections.length" class="sections-list">
            <div v-for="(section, sectionIndex) in detailCourse.sections" :key="section.sectionId" class="section-card">
              <div class="section-header">
                <span class="section-order">{{ section.sectionOrder }}</span>
                <span class="section-name">{{ section.sectionName }}</span>
                <span class="section-count">{{ section.lessons?.length || 0 }}个小节</span>
              </div>
              <div v-if="section.lessons && section.lessons.length" class="lessons-list">
                <div v-for="(lesson, lessonIndex) in section.lessons" :key="lesson.chapterId" class="lesson-item">
                  <div class="lesson-info">
                    <span class="lesson-order">{{ lesson.chapterOrder }}</span>
                    <span class="lesson-name">{{ lesson.chapterName }}</span>
                  </div>
                  <div class="lesson-resources">
                    <span v-if="lesson.videos && lesson.videos.length" class="resource-tag video-tag">
                      {{ lesson.videos.length }}个视频
                    </span>
                    <span v-if="lesson.materials && lesson.materials.length" class="resource-tag material-tag">
                      {{ lesson.materials.length }}个资料
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="no-lessons">该章节暂无小节</div>
            </div>
          </div>
          <p v-else class="empty-outline">暂无章节信息</p>
        </div>
        
        <div class="detail-section">
          <h3>其他信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">创建时间</span>
              <span class="info-value">{{ formatTime(detailCourse.createTime) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">更新时间</span>
              <span class="info-value">{{ formatTime(detailCourse.updateTime) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">课程评分</span>
              <span class="info-value">{{ detailCourse.rating || '-' }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { courseCoverUrl, useFallbackCover } from '../../utils/assets.js'
import { auditCourse, getPendingCourses, getCourseDetail } from '../../api/admin.js'

const statusFilter = ref('pending')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const courses = ref([])

const detailVisible = ref(false)
const detailLoading = ref(false)
const detailCourse = ref(null)

onMounted(() => {
  loadCourses()
})

async function loadCourses() {
  try {
    const data = await getPendingCourses({ page: currentPage.value, size: pageSize.value, status: statusFilter.value, keyword: searchKeyword.value || undefined })
    courses.value = data.records || []
    totalCount.value = data.total || 0
  } catch (error) {
    ElMessage.error('获取课程列表失败')
    console.error(error)
  }
}

function getStatusClass(status) {
  const classMap = {
    pending: 'pending',
    online: 'approved',
    rejected: 'rejected',
    draft: 'draft'
  }
  return classMap[status] || ''
}

function getStatusLabel(status) {
  const labelMap = {
    pending: '待审核',
    online: '已通过',
    rejected: '已拒绝',
    draft: '草稿'
  }
  return labelMap[status] || status
}

function formatTime(time) {
  if (!time) return '-'
  return time.split('T')[0]
}

async function viewDetail(id) {
  detailVisible.value = true
  detailLoading.value = true
  detailCourse.value = null
  try {
    const response = await getCourseDetail(id)
    detailCourse.value = response.data || response
  } catch (error) {
    ElMessage.error('获取课程详情失败')
    console.error(error)
  } finally {
    detailLoading.value = false
  }
}

function closeDetail() {
  detailVisible.value = false
  detailCourse.value = null
}

async function approveCourse(course) {
  try {
    await ElMessageBox.confirm('确定通过该课程的审核吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    })
    
    await auditCourse(course.courseId, { result: 'approved', remark: '审核通过' })
    ElMessage.success('课程审核通过')
    await loadCourses()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('审核失败')
    }
  }
}

async function rejectCourse(course) {
  try {
    const { value } = await ElMessageBox.prompt('请输入拒绝原因', '拒绝课程', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: '请输入拒绝原因'
    })
    
    if (!value.trim()) {
      ElMessage.warning('请输入拒绝原因')
      return
    }
    
    await auditCourse(course.courseId, { result: 'rejected', reason: value })
    ElMessage.success('课程已拒绝')
    await loadCourses()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('拒绝失败')
    }
  }
}
</script>

<style scoped>
.course-audit {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
}

.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
}

.filters {
  display: flex;
  gap: var(--spacing-md);
}

.filters .el-select {
  width: 150px;
}

.filters .el-input {
  width: 250px;
}

.audit-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.audit-item {
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.course-preview {
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
}

.course-cover {
  width: 200px;
  height: 120px;
  border-radius: var(--radius-lg);
  object-fit: cover;
}

.course-info {
  flex: 1;
}

.course-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.course-name {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--gray-800);
}

.status-badge {
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
}

.status-badge.pending {
  background: rgba(249, 115, 22, 0.1);
  color: var(--accent-orange);
}

.status-badge.approved {
  background: rgba(34, 197, 94, 0.1);
  color: var(--green-500);
}

.status-badge.rejected {
  background: rgba(239, 68, 68, 0.1);
  color: var(--red-500);
}

.course-meta {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
  margin-bottom: var(--spacing-md);
}

.course-description {
  font-size: var(--font-size-sm);
  color: var(--gray-600);
  margin-bottom: var(--spacing-md);
}

.course-stats {
  display: flex;
  gap: var(--spacing-lg);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

.audit-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--gray-50);
  border-top: 1px solid var(--gray-100);
}

.submit-info {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-md);
}

.result-text {
  font-size: var(--font-size-sm);
}

.result-text.approved {
  color: var(--green-500);
}

.result-text.rejected {
  color: var(--red-500);
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-xl);
}

@media (max-width: 767px) {
  .filters {
    flex-direction: column;
    width: 100%;
  }
  
  .filters .el-select,
  .filters .el-input {
    width: 100%;
  }
  
  .course-preview {
    flex-direction: column;
  }
  
  .course-cover {
    width: 100%;
    height: 180px;
  }
  
  .audit-actions {
    flex-direction: column;
    gap: var(--spacing-md);
  }
}

.detail-loading {
  padding: 40px;
  text-align: center;
}

.detail-content {
  padding: 10px 0;
}

.detail-header {
  display: flex;
  gap: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid #eee;
}

.detail-cover {
  width: 180px;
  height: 108px;
  border-radius: var(--radius-lg);
  object-fit: cover;
}

.detail-basic {
  flex: 1;
}

.detail-name {
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin: 0 0 var(--spacing-md) 0;
}

.detail-meta {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-sm);
}

.detail-status {
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
}

.detail-status.pending {
  background: rgba(249, 115, 22, 0.1);
  color: var(--accent-orange);
}

.detail-status.approved,
.detail-status.online {
  background: rgba(34, 197, 94, 0.1);
  color: var(--green-500);
}

.detail-status.rejected {
  background: rgba(239, 68, 68, 0.1);
  color: var(--red-500);
}

.detail-stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
  font-size: var(--font-size-sm);
  color: var(--gray-600);
}

.detail-section {
  margin-top: var(--spacing-lg);
}

.detail-section h3 {
  font-size: var(--font-size-base);
  font-weight: 600;
  margin: 0 0 var(--spacing-md) 0;
  padding-bottom: 6px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-section p {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--gray-600);
  line-height: 1.6;
}

.sections-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-card {
  border: 1px solid #f0f0f0;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--gray-50);
}

.section-order {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--primary-500);
  min-width: 30px;
}

.section-name {
  flex: 1;
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--gray-800);
}

.section-count {
  font-size: var(--font-size-xs);
  color: var(--gray-400);
  background: white;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.lessons-list {
  padding: 8px 0;
}

.lesson-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px 8px 48px;
  border-bottom: 1px solid #f5f5f5;
}

.lesson-item:last-child {
  border-bottom: none;
}

.lesson-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.lesson-order {
  font-size: var(--font-size-xs);
  color: var(--gray-400);
  min-width: 40px;
}

.lesson-name {
  font-size: var(--font-size-sm);
  color: var(--gray-700);
}

.lesson-resources {
  display: flex;
  gap: 8px;
}

.resource-tag {
  font-size: var(--font-size-xs);
  padding: 2px 6px;
  border-radius: 4px;
}

.video-tag {
  background: rgba(249, 115, 22, 0.1);
  color: var(--accent-orange);
}

.material-tag {
  background: rgba(59, 130, 246, 0.1);
  color: var(--blue-500);
}

.no-lessons {
  padding: 16px;
  text-align: center;
  color: var(--gray-400);
  font-size: var(--font-size-sm);
}

.empty-outline {
  color: var(--gray-400);
  font-style: italic;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: var(--font-size-xs);
  color: var(--gray-400);
}

.info-value {
  font-size: var(--font-size-sm);
  color: var(--gray-700);
}
</style>
