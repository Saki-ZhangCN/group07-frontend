<template>
  <div class="course-list">
    <div class="action-bar">
      <div class="header">
        <h1>课程列表</h1>
        <div class="filter-buttons">
          <el-button 
            :type="statusFilter === '' ? 'primary' : ''" 
            @click="setFilter('')"
          >
            全部
          </el-button>
          <el-button 
            :type="statusFilter === 'online' ? 'primary' : ''" 
            @click="setFilter('online')"
          >
            已通过课程
          </el-button>
          <el-button 
            :type="statusFilter === 'rejected' ? 'primary' : ''" 
            @click="setFilter('rejected')"
          >
            未通过课程
          </el-button>
          <el-button 
            :type="statusFilter === 'pending' ? 'primary' : ''" 
            @click="setFilter('pending')"
          >
            正在审核课程
          </el-button>
        </div>
      </div>
      
      <div class="actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索课程名称..."
          prefix-icon="Search"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="exportData">
          <el-icon><Download /></el-icon>
          导出Excel
        </el-button>
      </div>
    </div>
    
    <div class="table-container" v-loading="loading">
      <el-table 
        :data="courses" 
        style="width: 100%"
        :default-sort="{ prop: 'createTime', order: 'descending' }"
        @sort-change="handleSortChange"
      >
        <el-table-column 
          label="课程名称" 
          min-width="180" 
          prop="courseName"
          sortable="custom"
        >
          <template #default="{ row }">
            <div class="course-name-cell">
              <img :src="row.coverImage" class="course-thumb" />
              <span class="course-name">{{ row.courseName }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column 
          label="课程ID" 
          width="180" 
          prop="courseId"
          sortable="custom"
        />
        
        <el-table-column 
          label="创建时间" 
          width="140" 
          prop="createTime"
          sortable="custom"
        >
          <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
        </el-table-column>
        
        <el-table-column 
          label="课程状态" 
          width="100" 
          prop="status"
          sortable="custom"
        >
          <template #default="{ row }">
            <span class="status-badge" :class="getStatusClass(row.status)">
              {{ getStatusLabel(row.status) }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column 
          label="创建人" 
          width="100" 
          prop="teacherName"
          sortable="custom"
        />
        
        <el-table-column 
          label="学生数量" 
          width="100" 
          prop="studentCount"
          sortable="custom"
        >
          <template #default="{ row }">{{ row.studentCount || 0 }}</template>
        </el-table-column>
        
        <el-table-column 
          label="分类" 
          width="100" 
          prop="category"
          sortable="custom"
        />
        
        <el-table-column 
          label="价格" 
          width="100" 
          prop="price"
          sortable="custom"
        >
          <template #default="{ row }">¥{{ row.price || 0 }}</template>
        </el-table-column>
      </el-table>
    </div>
    
    <div class="pagination-section">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[20, 50, 100]"
        :total="totalCount"
        layout="total, sizes, prev, pager, next"
        background
        @size-change="handlePageChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getCourseList } from '../../api/course.js'

const statusFilter = ref('')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const courses = ref([])
const loading = ref(false)
const sortProp = ref('createTime')
const sortOrder = ref('descending')

onMounted(() => {
  loadCourses()
})

async function loadCourses() {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      status: statusFilter.value || undefined,
      keyword: searchKeyword.value || undefined,
      sortBy: sortProp.value,
      sortOrder: sortOrder.value === 'descending' ? 'desc' : 'asc'
    }
    
    const data = await getCourseList(params)
    courses.value = data.courses || []
    totalCount.value = data.total || 0
  } catch (error) {
    ElMessage.error('获取课程列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

function setFilter(status) {
  statusFilter.value = status
  currentPage.value = 1
  loadCourses()
}

function handleSearch() {
  currentPage.value = 1
  loadCourses()
}

function handlePageChange() {
  loadCourses()
}

function handleSortChange({ prop, order }) {
  sortProp.value = prop
  sortOrder.value = order
  loadCourses()
}

function getStatusClass(status) {
  const classMap = {
    online: 'approved',
    pending: 'reviewing',
    rejected: 'rejected',
    draft: 'draft'
  }
  return classMap[status] || ''
}

function getStatusLabel(status) {
  const labelMap = {
    online: '已通过',
    pending: '审核中',
    rejected: '未通过',
    draft: '草稿'
  }
  return labelMap[status] || status
}

function formatTime(time) {
  if (!time) return '-'
  return time.split('T')[0]
}

function exportData() {
  ElMessage.success('数据导出成功')
}
</script>

<style scoped>
.course-list {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
}

.action-bar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.header h1 {
  font-size: var(--font-size-xl);
  color: var(--gray-800);
  margin: 0;
}

.filter-buttons {
  display: flex;
  gap: var(--spacing-sm);
}

.actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.search-input {
  width: 250px;
}

.table-container {
  overflow-x: auto;
  margin-bottom: var(--spacing-xl);
}

.course-name-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.course-thumb {
  width: 48px;
  height: 28px;
  border-radius: var(--radius-md);
  object-fit: cover;
}

.course-name {
  font-weight: 500;
  color: var(--gray-800);
}

.status-badge {
  padding: 4px 12px;
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

.status-badge.rejected {
  background: rgba(239, 68, 68, 0.1);
  color: var(--red-500);
}

.pass-rate {
  color: var(--primary-500);
  font-weight: 500;
}

.pagination-section {
  display: flex;
  justify-content: center;
}

@media (max-width: 767px) {
  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header {
    align-items: flex-start;
  }
  
  .filter-buttons {
    flex-wrap: wrap;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .search-input {
    width: 100%;
  }
}
</style>