<template>
  <div class="course-audit">
    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="filters">
        <el-select v-model="statusFilter" placeholder="审核状态">
          <el-option label="待审核" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>
        
        <el-input
          v-model="searchKeyword"
          placeholder="搜索课程名称..."
          prefix-icon="Search"
          clearable
        />
      </div>
    </div>
    
    <!-- 课程审核列表 -->
    <div class="audit-list">
      <div class="audit-item" v-for="course in courses" :key="course.id">
        <div class="course-preview">
          <img :src="course.coverImage" :alt="course.name" class="course-cover" />
          <div class="course-info">
            <div class="course-header">
              <span class="course-name">{{ course.name }}</span>
              <span class="status-badge" :class="getStatusClass(course.status)">
                {{ course.statusLabel }}
              </span>
            </div>
            <p class="course-meta">
              讲师：{{ course.teacher }} | 类别：{{ course.category }}
            </p>
            <p class="course-description">{{ course.description }}</p>
            <div class="course-stats">
              <span class="stat-item">
                <el-icon><Clock /></el-icon>
                {{ course.hours }}课时
              </span>
              <span class="stat-item">
                <el-icon><Document /></el-icon>
                {{ course.chapters }}章节
              </span>
              <span class="stat-item">
                <el-icon><Coin /></el-icon>
                ¥{{ course.price }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="audit-actions">
          <div class="submit-info">
            <span class="submit-label">提交时间：</span>
            <span class="submit-time">{{ course.submitTime }}</span>
          </div>
          
          <div class="action-buttons" v-if="course.status === 'pending'">
            <el-button type="primary" @click="viewDetail(course.id)">
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
              {{ course.status === 'approved' ? '已于 ' + course.approveTime + ' 通过审核' : '已于 ' + course.rejectTime + ' 拒绝' }}
            </span>
            <el-button size="small" @click="viewDetail(course.id)">查看</el-button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 分页 -->
    <div class="pagination-section">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="totalCount"
        layout="total, sizes, prev, pager, next"
        background
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const statusFilter = ref('pending')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(30)

const courses = ref([
  {
    id: '1',
    name: 'Vue3从入门到实战',
    coverImage: 'https://picsum.photos/seed/vue3/400/225',
    teacher: '张老师',
    category: '编程开发',
    description: '本课程将带你从零开始学习Vue3框架...',
    hours: 48,
    chapters: 12,
    price: 99,
    status: 'pending',
    statusLabel: '待审核',
    submitTime: '2024-01-15 10:30'
  },
  {
    id: '2',
    name: 'React开发实战',
    coverImage: 'https://picsum.photos/seed/react/400/225',
    teacher: '李老师',
    category: '编程开发',
    description: '深入学习React框架的实战应用...',
    hours: 36,
    chapters: 10,
    price: 129,
    status: 'approved',
    statusLabel: '已通过',
    submitTime: '2024-01-12',
    approveTime: '2024-01-13'
  },
  {
    id: '3',
    name: '设计基础入门',
    coverImage: 'https://picsum.photos/seed/design/400/225',
    teacher: '王老师',
    category: '设计艺术',
    description: '设计基础知识讲解...',
    hours: 24,
    chapters: 8,
    price: 0,
    status: 'rejected',
    statusLabel: '已拒绝',
    submitTime: '2024-01-10',
    rejectTime: '2024-01-11'
  }
])

function getStatusClass(status) {
  const classMap = {
    pending: 'pending',
    approved: 'approved',
    rejected: 'rejected'
  }
  return classMap[status] || ''
}

function viewDetail(id) {
  ElMessage.info('查看课程详情')
}

async function approveCourse(course) {
  try {
    await ElMessageBox.confirm('确定通过该课程的审核吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    })
    course.status = 'approved'
    course.statusLabel = '已通过'
    course.approveTime = new Date().toLocaleDateString()
    ElMessage.success('课程审核通过')
  } catch {
    // 取消审核
  }
}

async function rejectCourse(course) {
  try {
    const { value } = await ElMessageBox.prompt('请输入拒绝原因', '拒绝课程', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: '请输入拒绝原因'
    })
    course.status = 'rejected'
    course.statusLabel = '已拒绝'
    course.rejectTime = new Date().toLocaleDateString()
    ElMessage.success('课程已拒绝')
  } catch {
    // 取消拒绝
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
</style>