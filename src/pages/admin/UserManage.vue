<template>
  <div class="user-manage">
    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="filters">
        <el-select v-model="roleFilter" placeholder="用户角色" clearable>
          <el-option label="学员" value="student" />
          <el-option label="讲师" value="teacher" />
          <el-option label="管理员" value="admin" />
        </el-select>
        
        <el-select v-model="statusFilter" placeholder="状态" clearable>
          <el-option label="正常" value="normal" />
          <el-option label="禁用" value="disabled" />
        </el-select>
        
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用户名/手机号..."
          prefix-icon="Search"
          clearable
        />
      </div>
      
      <div class="actions">
        <el-button @click="exportData">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
        <el-button type="primary" @click="createUser">
          <el-icon><Plus /></el-icon>
          创建用户
        </el-button>
      </div>
    </div>
    
    <!-- 用户列表 -->
    <div class="user-table">
      <el-table :data="users" style="width: 100%">
        <el-table-column label="用户信息" min-width="180">
          <template #default="{ row }">
            <div class="user-info-cell">
              <el-avatar :size="40" :src="row.avatar">
                <el-icon><UserFilled /></el-icon>
              </el-avatar>
              <div class="user-detail">
                <span class="user-name">{{ row.name }}</span>
                <span class="user-email">{{ row.email }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="角色" width="100">
          <template #default="{ row }">
            <span class="role-badge" :class="getRoleClass(row.role)">
              {{ row.roleLabel }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <span class="status-badge" :class="getStatusClass(row.status)">
              {{ row.statusLabel }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column label="注册时间" prop="createTime" width="120" />
        
        <el-table-column label="最后登录" prop="lastLogin" width="120" />
        
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="small" link @click="editUser(row.id)">编辑</el-button>
              <el-button size="small" link @click="viewDetail(row.id)">详情</el-button>
              <el-button 
                size="small" 
                link 
                :type="row.status === 'normal' ? 'warning' : 'success'"
                @click="toggleStatus(row)"
              >
                {{ row.status === 'normal' ? '禁用' : '启用' }}
              </el-button>
              <el-button size="small" link type="danger" @click="deleteUser(row)">删除</el-button>
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
        :page-sizes="[20, 50, 100]"
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

const roleFilter = ref('')
const statusFilter = ref('')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(500)

const users = ref([
  {
    id: '1',
    name: '学员A',
    email: 'student@example.com',
    avatar: '',
    role: 'student',
    roleLabel: '学员',
    status: 'normal',
    statusLabel: '正常',
    createTime: '2024-01-10',
    lastLogin: '2024-01-20'
  },
  {
    id: '2',
    name: '讲师B',
    email: 'teacher@example.com',
    avatar: '',
    role: 'teacher',
    roleLabel: '讲师',
    status: 'normal',
    statusLabel: '正常',
    createTime: '2024-01-05',
    lastLogin: '2024-01-19'
  },
  {
    id: '3',
    name: '学员C',
    email: 'student2@example.com',
    avatar: '',
    role: 'student',
    roleLabel: '学员',
    status: 'disabled',
    statusLabel: '禁用',
    createTime: '2024-01-08',
    lastLogin: '2024-01-12'
  }
])

function getRoleClass(role) {
  const classMap = {
    student: 'student',
    teacher: 'teacher',
    admin: 'admin'
  }
  return classMap[role] || ''
}

function getStatusClass(status) {
  return status === 'normal' ? 'normal' : 'disabled'
}

function createUser() {
  ElMessage.info('打开创建用户对话框')
}

function editUser(id) {
  ElMessage.info('打开编辑用户对话框')
}

function viewDetail(id) {
  ElMessage.info('查看用户详情')
}

async function toggleStatus(user) {
  const action = user.status === 'normal' ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定要${action}该用户吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    user.status = user.status === 'normal' ? 'disabled' : 'normal'
    user.statusLabel = user.status === 'normal' ? '正常' : '禁用'
    ElMessage.success(`已${action}该用户`)
  } catch {
    // 取消操作
  }
}

async function deleteUser(user) {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    ElMessage.success('用户已删除')
  } catch {
    // 取消删除
  }
}

function exportData() {
  ElMessage.success('数据导出成功')
}
</script>

<style scoped>
.user-manage {
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

.filters {
  display: flex;
  gap: var(--spacing-md);
}

.filters .el-select {
  width: 120px;
}

.filters .el-input {
  width: 200px;
}

.actions {
  display: flex;
  gap: var(--spacing-md);
}

.user-table {
  margin-bottom: var(--spacing-xl);
}

.user-info-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.user-detail {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: var(--gray-800);
}

.user-email {
  font-size: var(--font-size-xs);
  color: var(--gray-500);
}

.role-badge {
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
}

.role-badge.student {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-500);
}

.role-badge.teacher {
  background: rgba(20, 184, 166, 0.1);
  color: var(--accent-cyan);
}

.role-badge.admin {
  background: rgba(100, 116, 139, 0.1);
  color: var(--gray-600);
}

.status-badge {
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
}

.status-badge.normal {
  background: rgba(34, 197, 94, 0.1);
  color: var(--green-500);
}

.status-badge.disabled {
  background: rgba(239, 68, 68, 0.1);
  color: var(--red-500);
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
  
  .filters {
    flex-direction: column;
    width: 100%;
  }
  
  .filters .el-select,
  .filters .el-input {
    width: 100%;
  }
  
  .actions {
    width: 100%;
  }
}
</style>