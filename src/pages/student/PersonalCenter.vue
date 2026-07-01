<template>
  <div class="personal-center">
    <div class="profile-section">
      <div class="profile-header">
        <el-avatar :size="100" :src="profile.avatarUrl">
          <el-icon :size="50"><UserFilled /></el-icon>
        </el-avatar>
        <div class="profile-info">
          <h2>{{ profile.realName || '学员' }}</h2>
          <p class="profile-role">学员</p>
        </div>
      </div>
      
      <div class="profile-stats">
        <div class="stat-item">
          <span class="stat-value">{{ profile.studentNo || '-' }}</span>
          <span class="stat-label">学号</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ profile.grade || '-' }}</span>
          <span class="stat-label">年级</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ profile.studyDirection || '-' }}</span>
          <span class="stat-label">专业</span>
        </div>
      </div>
    </div>
    
    <div class="info-section">
      <div class="section-header">
        <h3>个人信息</h3>
        <el-button type="primary" size="small" @click="toggleEdit">
          {{ isEditing ? '取消' : '编辑' }}
        </el-button>
      </div>
      
      <el-form v-if="isEditing" :model="editForm" label-width="120px">
        <el-form-item label="电子邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="监护人电话" prop="parentPhone">
          <el-input v-model="editForm.parentPhone" placeholder="请输入监护人电话" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveProfile">保存修改</el-button>
          <el-button @click="toggleEdit">取消</el-button>
        </el-form-item>
      </el-form>
      
      <el-descriptions v-else :column="2" border>
        <el-descriptions-item label="姓名">{{ profile.realName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ profile.studentNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="电子邮箱">
          <span v-if="profile.email && isValidEmail(profile.email)">{{ profile.email }}</span>
          <span v-else class="empty-text">-</span>
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          <span v-if="profile.phone && isValidPhone(profile.phone)">{{ profile.phone }}</span>
          <span v-else class="empty-text">-</span>
        </el-descriptions-item>
        <el-descriptions-item label="监护人电话" :span="2">
          <span v-if="profile.parentPhone && isValidPhone(profile.parentPhone)">{{ profile.parentPhone }}</span>
          <span v-else class="empty-text">-</span>
        </el-descriptions-item>
        <el-descriptions-item label="年级">{{ profile.grade || '-' }}</el-descriptions-item>
        <el-descriptions-item label="专业方向">{{ profile.studyDirection || '-' }}</el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { UserFilled } from '@element-plus/icons-vue'
import { getUserInfo, updateProfile } from '../../api/auth.js'
import { useAuthStore } from '../../stores/auth.js'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()
const profile = ref({})
const isEditing = ref(false)
const editForm = reactive({
  email: '',
  phone: '',
  parentPhone: ''
})

onMounted(() => {
  loadProfile()
})

async function loadProfile() {
  try {
    const response = await getUserInfo()
    profile.value = response || {}
    initEditForm()
  } catch (error) {
    console.error('获取个人信息失败:', error)
    profile.value = {
      realName: authStore.userInfo?.realName || '学员',
      studentNo: authStore.userInfo?.username || '-',
      grade: '-',
      studyDirection: '-',
      email: '-',
      phone: '-',
      parentPhone: '-'
    }
  }
}

function initEditForm() {
  editForm.email = profile.value.email || ''
  editForm.phone = profile.value.phone || ''
  editForm.parentPhone = profile.value.parentPhone || ''
}

function toggleEdit() {
  isEditing.value = !isEditing.value
  if (isEditing.value) {
    initEditForm()
  }
}

async function saveProfile() {
  try {
    await updateProfile({
      email: editForm.email,
      phone: editForm.phone,
      parentPhone: editForm.parentPhone
    })
    ElMessage.success('修改成功')
    isEditing.value = false
    await loadProfile()
  } catch (error) {
    ElMessage.error('修改失败，请重试')
  }
}

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

function isValidPhone(phone) {
  const regex = /^1[3-9]\d{9}$/
  return regex.test(phone.replace(/\s/g, ''))
}
</script>

<style scoped>
.personal-center {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.profile-section,
.info-section {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
}

.profile-info h2 {
  font-size: var(--font-size-xl);
  color: var(--gray-800);
  margin: 0;
}

.profile-role {
  color: var(--primary-500);
  font-size: var(--font-size-sm);
  margin-top: 4px;
}

.profile-stats {
  display: flex;
  gap: var(--spacing-xl);
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--primary-500);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.section-header h3 {
  font-size: var(--font-size-lg);
  color: var(--gray-800);
  margin: 0;
}

.empty-text {
  color: var(--gray-400);
}
</style>