<template>
  <div class="course-manage">
    <!-- 操作栏 -->
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
    
    <!-- 课程列表 -->
    <div class="course-table">
      <el-table :data="courses" style="width: 100%">
        <el-table-column label="课程信息" min-width="200">
          <template #default="{ row }">
            <div class="course-info-cell">
              <img :src="row.coverImage" class="course-thumb" />
              <div class="course-detail">
                <span class="course-name">{{ row.name }}</span>
                <span class="course-category">{{ row.category }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="学员数" prop="students" width="100" />
        
        <el-table-column label="课时" prop="hours" width="80" />
        
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span class="status-badge" :class="getStatusClass(row.status)">
              {{ row.status }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column label="评分" width="100">
          <template #default="{ row }">
            <span class="rating">
              <el-icon><Star /></el-icon>
              {{ row.rating }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column label="更新时间" prop="updateTime" width="120" />
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="small" link @click="editCourse(row.id)">
                编辑
              </el-button>
              <el-button size="small" link type="primary" @click="goToLive(row.id)">
                直播
              </el-button>
              <el-button size="small" link @click="viewAnalysis(row.id)">
                数据
              </el-button>
              <el-button size="small" link type="danger" @click="deleteCourse(row)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(50)

const courses = ref([
  {
    id: '1',
    name: 'Java编程基础：从入门到精通',
    category: '编程开发',
    coverImage: 'https://picsum.photos/seed/t1/100/60',
    students: 356,
    hours: 48,
    status: '已发布',
    rating: 4.8,
    updateTime: '2024-01-15'
  },
  {
    id: '2',
    name: 'Python数据分析实战',
    category: '编程开发',
    coverImage: 'https://picsum.photos/seed/t2/100/60',
    students: 285,
    hours: 36,
    status: '审核中',
    rating: 4.6,
    updateTime: '2024-01-10'
  },
  {
    id: '3',
    name: 'Web前端开发完整教程',
    category: '编程开发',
    coverImage: 'https://picsum.photos/seed/t3/100/60',
    students: 617,
    hours: 60,
    status: '已发布',
    rating: 4.9,
    updateTime: '2024-01-08'
  },
  {
    id: '4',
    name: '数据库原理与应用',
    category: '编程开发',
    coverImage: 'https://picsum.photos/seed/t4/100/60',
    students: 142,
    hours: 32,
    status: '草稿',
    rating: 0,
    updateTime: '2024-01-05'
  }
])

function getStatusClass(status) {
  const classMap = {
    '已发布': 'published',
    '审核中': 'reviewing',
    '草稿': 'draft'
  }
  return classMap[status] || ''
}

function createCourse() {
  router.push('/teacher/course/create')
}

function editCourse(id) {
  router.push(`/teacher/course/edit/${id}`)
}

function goToLive(id) {
  router.push('/teacher/live/teaching')
}

function viewAnalysis(id) {
  router.push(`/teacher/analysis?course=${id}`)
}

async function deleteCourse(course) {
  try {
    await ElMessageBox.confirm('确定要删除该课程吗？删除后将无法恢复。', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    ElMessage.success('课程已删除')
  } catch {
    // 取消删除
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

.course-table {
  margin-bottom: var(--spacing-xl);
}

.course-info-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.course-thumb {
  width: 60px;
  height: 36px;
  border-radius: var(--radius-md);
  object-fit: cover;
}

.course-detail {
  display: flex;
  flex-direction: column;
}

.course-name {
  font-weight: 500;
  color: var(--gray-800);
}

.course-category {
  font-size: var(--font-size-xs);
  color: var(--gray-500);
}

.status-badge {
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
}

.status-badge.published {
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

.rating {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.rating .el-icon {
  color: var(--yellow-400);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-md);
}

.pagination-section {
  display: flex;
  justify-content: center;
}

@media (max-width: 767px) {
  .action-bar {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .search-box {
    width: 100%;
  }
}
</style>