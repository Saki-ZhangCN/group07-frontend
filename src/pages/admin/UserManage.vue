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
          <el-option label="正常" value="1" />
          <el-option label="禁用" value="0" />
        </el-select>
        
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用户名/学工号..."
          prefix-icon="Search"
          clearable
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" size="small" @click="handleSearch">搜索</el-button>
      </div>
      
      <div class="actions">
        <el-button size="small" @click="exportData">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
        <el-button size="small" type="primary" @click="showCreateDialog">
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
                <span class="user-email">{{ row.email || row.username }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="学工号" min-width="100">
          <template #default="{ row }">
            <span class="emp-no">{{ row.empNo || '-' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="角色" min-width="80">
          <template #default="{ row }">
            <span class="role-badge" :class="row.role">
              {{ getRoleLabel(row.role) }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column label="状态" min-width="70">
          <template #default="{ row }">
            <span class="status-badge" :class="row.status === 1 ? 'normal' : 'disabled'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column label="注册时间" min-width="100">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        
        <el-table-column label="最后登录" min-width="100">
          <template #default="{ row }">
            {{ formatTime(row.lastLoginTime) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" min-width="230" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="small" type="primary" @click="viewDetail(row)">详情</el-button>
              <el-button size="small" type="warning" @click="showEditDialog(row)">编辑</el-button>
              <el-button 
                size="small" 
                class="toggle-btn"
                :type="row.status === 1 ? 'warning' : 'success'"
                @click="toggleStatus(row)"
              >
                {{ row.status === 1 ? '禁用' : '启用' }}
              </el-button>
              <el-button size="small" type="danger" @click="deleteUser(row)">删除</el-button>
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

    <!-- 创建用户对话框 -->
    <el-dialog v-model="createDialogVisible" title="创建用户" width="420px">
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="createForm.username" placeholder="学号或工号" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="createForm.realName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="createForm.role" style="width:100%">
            <el-option label="学员" value="student" />
            <el-option label="讲师" value="teacher" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="createForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="createForm.phone" placeholder="请输入手机号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="createDialogVisible = false">取消</el-button>
        <el-button size="small" type="primary" @click="submitCreate">确认创建</el-button>
      </template>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑用户" width="420px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="editForm.realName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="editForm.phone" placeholder="请输入手机号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" type="danger" @click="handleResetPassword">重置密码</el-button>
        <el-button size="small" @click="editDialogVisible = false">取消</el-button>
        <el-button size="small" type="primary" @click="submitEdit">保存修改</el-button>
      </template>
    </el-dialog>

    <!-- 用户详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="用户详情" width="420px">
      <div class="detail-section">
        <div class="detail-row"><span class="label">用户ID</span><span>{{ detailUser.userId }}</span></div>
        <div class="detail-row"><span class="label">用户名</span><span>{{ detailUser.username }}</span></div>
        <div class="detail-row"><span class="label">姓名</span><span>{{ detailUser.realName || '-' }}</span></div>
        <div class="detail-row"><span class="label">学工号</span><span>{{ detailUser.empNo || '-' }}</span></div>
        <div class="detail-row"><span class="label">角色</span><span>{{ getRoleLabel(detailUser.role) }}</span></div>
        <div class="detail-row"><span class="label">状态</span><span>{{ detailUser.status === 1 ? '正常' : '禁用' }}</span></div>
        <div class="detail-row"><span class="label">邮箱</span><span>{{ detailUser.email || '-' }}</span></div>
        <div class="detail-row"><span class="label">手机号</span><span>{{ detailUser.phone || '-' }}</span></div>
        <div class="detail-row"><span class="label">注册时间</span><span>{{ formatTime(detailUser.createTime) }}</span></div>
        <div class="detail-row"><span class="label">最后登录</span><span>{{ formatTime(detailUser.lastLoginTime) }}</span></div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createUser as createUserApi, deleteUser as deleteUserApi, exportUsers, getUserList, resetUserPassword, updateUser } from '../../api/admin.js'

const roleFilter = ref('')
const statusFilter = ref('')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const users = ref([])

// 创建对话框
const createDialogVisible = ref(false)
const createForm = reactive({ username: '', realName: '', role: 'student', email: '', phone: '' })

// 编辑对话框
const editDialogVisible = ref(false)
const editForm = reactive({ userId: '', realName: '', email: '', phone: '', role: '', status: 1 })

// 详情对话框
const detailDialogVisible = ref(false)
const detailUser = ref({})

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
    if (statusFilter.value !== '') params.status = statusFilter.value
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

function formatTime(time) {
  if (!time) return '-'
  return time.split('T')[0]
}

// 创建用户
function showCreateDialog() {
  createForm.username = ''
  createForm.realName = ''
  createForm.role = 'student'
  createForm.email = ''
  createForm.phone = ''
  createDialogVisible.value = true
}

async function submitCreate() {
  if (!createForm.username || !createForm.realName) {
    ElMessage.warning('请填写用户名和姓名')
    return
  }
  await createUserApi(createForm)
  ElMessage.success('用户已创建，初始密码为账号+123456')
  createDialogVisible.value = false
  await loadUsers()
}

// 编辑用户
function showEditDialog(row) {
  editForm.userId = row.userId
  editForm.realName = row.realName || ''
  editForm.email = row.email || ''
  editForm.phone = row.phone || ''
  editForm.role = row.role || ''
  editForm.status = row.status
  editDialogVisible.value = true
}

async function submitEdit() {
  await updateUser(editForm.userId, editForm)
  ElMessage.success('用户信息已更新')
  editDialogVisible.value = false
  await loadUsers()
}

// 重置密码（双重确认）
async function handleResetPassword() {
  try {
    await ElMessageBox.confirm('确定要重置该用户的密码吗？', '确认重置', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await ElMessageBox.confirm('重置后密码将恢复为默认值，此操作不可撤销，是否继续？', '二次确认', {
      confirmButtonText: '确认重置',
      cancelButtonText: '取消',
      type: 'error'
    })
    await resetUserPassword(editForm.userId)
    ElMessage.success('密码已重置')
  } catch {
    // 取消操作
  }
}

// 查看详情
function viewDetail(row) {
  detailUser.value = row
  detailDialogVisible.value = true
}

// 启用/禁用
async function toggleStatus(user) {
  if (user.username === '0001') {
    ElMessage.warning('超级管理员0001不能被禁用')
    return
  }
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

// 删除用户
async function deleteUser(user) {
  if (user.username === '0001') {
    ElMessage.warning('超级管理员0001不能被删除')
    return
  }
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

// 导出
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
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.filters {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
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
  gap: 6px;
  flex-wrap: wrap;
}

.action-buttons .toggle-btn.el-button--warning {
  background-color: rgb(255, 228, 181);
  border-color: rgb(255, 228, 181);
  color: var(--warning-color, #e6a23c);
}

.action-buttons .toggle-btn.el-button--warning:hover {
  background-color: rgb(255, 215, 150);
  border-color: rgb(255, 215, 150);
}

.pagination-section {
  display: flex;
  justify-content: center;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.detail-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--gray-50);
}

.detail-row .label {
  width: 80px;
  font-size: var(--font-size-sm);
  color: var(--gray-500);
  flex-shrink: 0;
}

.detail-row span:last-child {
  font-size: var(--font-size-sm);
  color: var(--gray-800);
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