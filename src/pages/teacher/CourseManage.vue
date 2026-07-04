<template>
  <div class="course-manage">
    <div class="action-bar">
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索课程名称..."
          prefix-icon="Search"
          clearable
        />
      </div>
      <el-button type="primary" @click="createCourse">
        <el-icon><Plus /></el-icon>
        创建课程
      </el-button>
    </div>
    
    <!-- 三栏分类布局 -->
    <div class="course-tabs">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="已通过" name="approved">
          <div class="course-grid">
            <div v-if="approvedCourses.length === 0" class="empty-tip">
              <el-empty description="暂无已通过的课程" />
            </div>
            <div v-for="course in approvedCourses" :key="course.courseId" class="course-card">
              <img :src="courseCoverUrl(course.coverImage)" class="card-cover" @error="useFallbackCover" />
              <div class="card-content">
                <div class="card-header">
                  <span class="card-title">{{ course.courseName }}</span>
                  <span class="status-badge approved">已通过</span>
                </div>
                <p class="card-meta">{{ course.category }} | {{ course.totalHours }}课时</p>
                <p class="card-time">更新时间：{{ formatTime(course.updateTime) }}</p>
                <div class="card-actions">
                  <el-button size="small" @click="editCourse(course.courseId)">编辑</el-button>
                  <el-button size="small" type="primary" @click="viewDetail(course.courseId)">查看详情</el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="正在审核" name="reviewing">
          <div class="course-grid">
            <div v-if="reviewingCourses.length === 0" class="empty-tip">
              <el-empty description="暂无正在审核的课程" />
            </div>
            <div v-for="course in reviewingCourses" :key="course.courseId" class="course-card">
              <img :src="courseCoverUrl(course.coverImage)" class="card-cover" @error="useFallbackCover" />
              <div class="card-content">
                <div class="card-header">
                  <span class="card-title">{{ course.courseName }}</span>
                  <span class="status-badge reviewing">审核中</span>
                </div>
                <p class="card-meta">{{ course.category }} | {{ course.totalHours }}课时</p>
                <p class="card-time">提交时间：{{ formatTime(course.updateTime) }}</p>
                <div class="card-actions">
                  <el-button size="small" @click="editCourse(course.courseId)">编辑</el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="草稿" name="draft">
          <div class="course-grid">
            <div v-if="draftCourses.length === 0" class="empty-tip">
              <el-empty description="暂无草稿课程" />
            </div>
            <div v-for="course in draftCourses" :key="course.courseId" class="course-card">
              <img :src="courseCoverUrl(course.coverImage)" class="card-cover" @error="useFallbackCover" />
              <div class="card-content">
                <div class="card-header">
                  <span class="card-title">{{ course.courseName }}</span>
                  <span class="status-badge draft">草稿</span>
                </div>
                <p class="card-meta">{{ course.category }} | {{ course.totalHours }}课时</p>
                <p class="card-time">更新时间：{{ formatTime(course.updateTime) }}</p>
                <div class="card-actions">
                  <el-button size="small" @click="editCourse(course.courseId)">编辑</el-button>
                  <el-button size="small" type="primary" @click="submitReview(course.courseId)">提交审核</el-button>
                  <el-button size="small" type="danger" @click="deleteCourse(course)">删除</el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="未通过" name="rejected">
          <div class="course-grid">
            <div v-if="rejectedCourses.length === 0" class="empty-tip">
              <el-empty description="暂无未通过的课程" />
            </div>
            <div v-for="course in rejectedCourses" :key="course.courseId" class="course-card">
              <img :src="courseCoverUrl(course.coverImage)" class="card-cover" @error="useFallbackCover" />
              <div class="card-content">
                <div class="card-header">
                  <span class="card-title">{{ course.courseName }}</span>
                  <span class="status-badge rejected">未通过</span>
                </div>
                <p class="card-meta">{{ course.category }} | {{ course.totalHours }}课时</p>
                <p class="card-reason" v-if="course.reviewComment">驳回原因：{{ course.reviewComment }}</p>
                <p class="card-time">更新时间：{{ formatTime(course.updateTime) }}</p>
                <div class="card-actions">
                  <el-button size="small" @click="editCourse(course.courseId)">编辑修改</el-button>
                  <el-button size="small" type="primary" @click="submitReview(course.courseId)">重新提交</el-button>
                  <el-button size="small" type="danger" @click="deleteCourse(course)">删除</el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <!-- 统计信息 -->
    <div class="stats-bar">
      <span class="stat-item">已通过：<strong>{{ approvedCourses.length }}</strong> 门</span>
      <span class="stat-item">正在审核：<strong>{{ reviewingCourses.length }}</strong> 门</span>
      <span class="stat-item">未通过：<strong>{{ rejectedCourses.length }}</strong> 门</span>
      <span class="stat-item">草稿：<strong>{{ draftCourses.length }}</strong> 门</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTeacherCourses, deleteCourse as deleteCourseApi, submitCourseForReview } from '../../api/course.js'
import { courseCoverUrl, useFallbackCover } from '../../utils/assets.js'

const router = useRouter()

const searchKeyword = ref('')
const activeTab = ref('approved')
const courses = ref([])

// 按状态分类的课程列表
const approvedCourses = computed(() => {
  return courses.value.filter(c => c.status === 'online' && (!searchKeyword.value || c.courseName.includes(searchKeyword.value)))
})

const reviewingCourses = computed(() => {
  return courses.value.filter(c => c.status === 'pending' && (!searchKeyword.value || c.courseName.includes(searchKeyword.value)))
})

// 草稿课程：从未提交审核的课程
const draftCourses = computed(() => {
  return courses.value.filter(c => c.status === 'draft' && (!searchKeyword.value || c.courseName.includes(searchKeyword.value)))
})

// 未通过的课程：审核被驳回的课程
const rejectedCourses = computed(() => {
  return courses.value.filter(c => c.status === 'rejected' && (!searchKeyword.value || c.courseName.includes(searchKeyword.value)))
})

onMounted(() => {
  loadCourses()
})

async function loadCourses() {
  try {
    const response = await getTeacherCourses()
    courses.value = response.courses || []
  } catch (error) {
    ElMessage.error('获取课程列表失败')
    console.error(error)
  }
}

function handleTabChange() {
  // 切换tab时可以做一些额外操作
}

function formatTime(time) {
  if (!time) return '-'
  return time.split('T')[0]
}

function createCourse() {
  router.push('/teacher/course/create')
}

function editCourse(id) {
  router.push(`/teacher/course/edit/${id}`)
}

function viewDetail(id) {
  router.push(`/teacher/course/${id}/detail`)
}

async function submitReview(courseId) {
  try {
    await submitCourseForReview(courseId)
    ElMessage.success('提交审核成功')
    loadCourses()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '提交审核失败')
  }
}

async function deleteCourse(course) {
  try {
    await ElMessageBox.confirm('确定要删除该课程吗？删除后将无法恢复。', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteCourseApi(course.courseId)
    ElMessage.success('课程已删除')
    loadCourses()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }
}
</script>

<style scoped>
.course-manage {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
}

.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.search-box {
  width: 300px;
}

.course-tabs {
  margin-bottom: var(--spacing-lg);
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  padding: var(--spacing-md) 0;
}

.empty-tip {
  padding: var(--spacing-xl) 0;
}

.course-card {
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.3s ease;
}

.course-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-cover {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.card-content {
  padding: var(--spacing-md);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.card-title {
  font-weight: 500;
  color: var(--gray-800);
  font-size: var(--font-size-base);
}

.card-meta {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
  margin-bottom: var(--spacing-sm);
}

.card-time {
  font-size: var(--font-size-xs);
  color: var(--gray-400);
  margin-bottom: var(--spacing-md);
}

.card-reason {
  font-size: var(--font-size-sm);
  color: var(--red-500);
  margin-bottom: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: rgba(239, 68, 68, 0.1);
  border-radius: var(--radius-md);
}

.card-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.status-badge {
  padding: 4px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
}

.status-badge.approved {
  background: rgba(34, 197, 94, 0.1);
  color: var(--green-500);
}

.status-badge.reviewing {
  background: rgba(249, 115, 22, 0.1);
  color: var(--accent-orange);
}

.status-badge.draft {
  background: rgba(100, 116, 139, 0.1);
  color: var(--gray-500);
}

.status-badge.rejected {
  background: rgba(239, 68, 68, 0.1);
  color: var(--red-500);
}

.stats-bar {
  display: flex;
  gap: var(--spacing-xl);
  padding: var(--spacing-md);
  background: var(--gray-50);
  border-radius: var(--radius-md);
  margin-top: var(--spacing-lg);
}

.stat-item {
  font-size: var(--font-size-sm);
  color: var(--gray-600);
}

.stat-item strong {
  color: var(--primary-500);
}

@media (max-width: 767px) {
  .action-bar {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .search-box {
    width: 100%;
  }
  
  .course-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-bar {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}
</style>
