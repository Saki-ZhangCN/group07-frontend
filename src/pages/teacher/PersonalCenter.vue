<template>
  <div class="personal-center">
    <div class="profile-section">
      <div class="profile-header">
        <el-avatar :size="100" :src="profile.avatarUrl">
          <el-icon :size="50"><UserFilled /></el-icon>
        </el-avatar>
        <div class="profile-info">
          <h2>{{ profile.realName || '讲师' }}</h2>
          <p class="profile-role">{{ profile.title || '讲师' }}</p>
        </div>
      </div>
      
      <div class="profile-stats">
        <div class="stat-item">
          <span class="stat-value">{{ profile.teacherNo || '-' }}</span>
          <span class="stat-label">工号</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ profile.subject || '-' }}</span>
          <span class="stat-label">所教科目</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ profile.title || '-' }}</span>
          <span class="stat-label">职称</span>
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
        <el-form-item label="个人介绍" prop="introduction">
          <el-input type="textarea" v-model="editForm.introduction" placeholder="请输入个人介绍" :rows="3" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveProfile">保存修改</el-button>
          <el-button @click="toggleEdit">取消</el-button>
        </el-form-item>
      </el-form>
      
      <el-descriptions v-else :column="2" border>
        <el-descriptions-item label="姓名">{{ profile.realName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="工号">{{ profile.teacherNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="电子邮箱">
          <span v-if="profile.email && isValidEmail(profile.email)">{{ profile.email }}</span>
          <span v-else class="empty-text">-</span>
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          <span v-if="profile.phone && isValidPhone(profile.phone)">{{ profile.phone }}</span>
          <span v-else class="empty-text">-</span>
        </el-descriptions-item>
        <el-descriptions-item label="所教科目">{{ profile.subject || '-' }}</el-descriptions-item>
        <el-descriptions-item label="职称">{{ profile.title || '-' }}</el-descriptions-item>
        <el-descriptions-item label="个人介绍" :span="2">
          <p class="introduction-text">{{ profile.introduction || '-' }}</p>
        </el-descriptions-item>
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
  introduction: ''
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
      realName: authStore.userInfo?.realName || '讲师',
      teacherNo: authStore.userInfo?.username || '-',
      subject: '-',
      title: '讲师',
      email: '-',
      phone: '-',
      introduction: '-'
    }
  }
}

function initEditForm() {
  editForm.email = profile.value.email || ''
  editForm.phone = profile.value.phone || ''
  editForm.introduction = profile.value.introduction || ''
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
      introduction: editForm.introduction
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

.introduction-text {
  margin: 0;
  line-height: 1.6;
}

.empty-text {
  color: var(--gray-400);
}
</style>