<template>
  <div class="user-manage">
    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="filters">
        <el-select v-model="roleFilter" placeholder="用户角色" clearable @change="handleFilterChange">
          <el-option label="学员" value="student" />
          <el-option label="讲师" value="teacher" />
          <el-option label="管理员" value="admin" />
        </el-select>
        
        <el-select v-model="statusFilter" placeholder="状态" clearable @change="handleFilterChange">
          <el-option label="正常" value="normal" />
          <el-option label="禁用" value="disabled" />
        </el-select>
        
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用户名/学工号..."
          prefix-icon="Search"
          clearable
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
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
              <el-avatar :size="40" :src="row.avatarUrl">
                <el-icon><UserFilled /></el-icon>
              </el-avatar>
              <div class="user-detail">
                <span class="user-name">{{ row.realName || row.username }}</span>
                <span class="user-email">{{ row.email }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="学工号" width="120">
          <template #default="{ row }">
            <span class="emp-no">{{ row.studentNo || row.teacherNo || row.adminNo || '-' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="角色" width="100">
          <template #default="{ row }">
            <span class="role-badge" :class="getRoleClass(row.role)">
              {{ getRoleLabel(row.role) }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <span class="status-badge" :class="getStatusClass(row.status)">
              {{ getStatusLabel(row.status) }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column label="注册时间" width="120">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        
        <el-table-column label="最后登录" width="120">
          <template #default="{ row }">
            {{ formatTime(row.lastLoginTime) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="small" link @click="editUser(row.userId)">编辑</el-button>
              <el-button size="small" link @click="viewDetail(row.userId)">详情</el-button>
              <el-button 
                size="small" 
                link 
                :type="row.status === 1 ? 'warning' : 'success'"
                @click="toggleStatus(row)"
              >
                {{ row.status === 1 ? '禁用' : '启用' }}
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
        @size-change="handlePageChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createUser as createUserApi, deleteUser as deleteUserApi, exportUsers, getUserList, updateUser } from '../../api/admin.js'

const roleFilter = ref('')
const statusFilter = ref('')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const users = ref([])

onMounted(() => {
  loadUsers()
})

async function loadUsers() {
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value
    }
    if (roleFilter.value) params.role = roleFilter.value
    if (statusFilter.value) params.status = statusFilter.value === 'normal' ? 1 : 0
    if (searchKeyword.value) params.keyword = searchKeyword.value
    
    const data = await getUserList(params)
    users.value = data.records || []
    totalCount.value = data.total || 0
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  }
}

function handleFilterChange() {
  currentPage.value = 1
  loadUsers()
}

function handleSearch() {
  currentPage.value = 1
  loadUsers()
}

function handlePageChange() {
  loadUsers()
}

function getRoleLabel(role) {
  const map = { student: '学员', teacher: '讲师', admin: '管理员' }
  return map[role] || role
}

function getRoleClass(role) {
  return role || ''
}

function getStatusLabel(status) {
  return status === 1 ? '正常' : '禁用'
}

function getStatusClass(status) {
  return status === 1 ? 'normal' : 'disabled'
}

function formatTime(time) {
  if (!time) return '-'
  return time.split('T')[0]
}

async function createUser() {
  const { value: username } = await ElMessageBox.prompt('请输入学号或工号', '创建用户')
  const { value: realName } = await ElMessageBox.prompt('请输入姓名', '创建用户')
  await createUserApi({ username, realName, role: roleFilter.value || 'student' })
  ElMessage.success('用户已创建，初始密码为账号+123456')
  await loadUsers()
}

async function editUser(id) {
  const { value: phone } = await ElMessageBox.prompt('请输入新手机号', '编辑用户')
  await updateUser(id, { phone })
  ElMessage.success('用户信息已更新')
  await loadUsers()
}

function viewDetail(id) {
  const user = users.value.find(item => item.userId === id)
  ElMessageBox.alert(JSON.stringify(user, null, 2), '用户详情')
}

async function toggleStatus(user) {
  const action = user.status === 1 ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定要${action}该用户吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const newStatus = user.status === 1 ? 0 : 1
    await updateUser(user.userId, { status: newStatus })
    user.status = newStatus
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
    await deleteUserApi(user.userId)
    ElMessage.success('用户已删除')
    loadUsers()
  } catch {
    // 取消删除
  }
}

async function exportData() {
  const blob = await exportUsers({ role: roleFilter.value, keyword: searchKeyword.value })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'users.csv'
  link.click()
  URL.revokeObjectURL(url)
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

.emp-no {
  font-family: monospace;
  color: var(--gray-600);
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
