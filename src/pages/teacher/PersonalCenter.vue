<template>
  <div class="personal-center">
    <div class="profile-section">
      <div class="profile-header">
        <div class="avatar-wrapper" @click="triggerAvatarUpload" title="更换头像">
          <el-avatar :size="100" :src="profile.avatarUrl">
            <el-icon :size="50"><UserFilled /></el-icon>
          </el-avatar>
          <div class="avatar-overlay">更换头像</div>
        </div>
        <input ref="avatarInputRef" type="file" accept="image/*" style="display:none" @change="handleAvatarChange" />
        <div class="profile-info">
          <p class="profile-role">{{ profile.title || '讲师' }}</p>
          <h2>{{ profile.realName || '讲师' }}</h2>
        </div>
      </div>
      
      <div class="profile-stats">
        <div class="stat-item">
          <span class="stat-label">工号：</span>
          <span class="stat-value">{{ profile.teacherNo || '-' }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">所教科目：</span>
          <span class="stat-value">{{ profile.subject || '-' }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">职称：</span>
          <span class="stat-value">{{ profile.title || '-' }}</span>
        </div>
      </div>
    </div>
    
    <div class="info-section">
      <div class="section-header">
        <h3>个人信息</h3>
        <div class="section-actions">
          <el-button type="warning" size="small" @click="showPasswordDialog = true">修改密码</el-button>
          <el-button type="primary" size="small" @click="toggleEdit">
            {{ isEditing ? '取消' : '编辑个人信息' }}
          </el-button>
        </div>
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
          <el-button type="primary" size="small" @click="saveProfile">保存修改</el-button>
          <el-button size="small" @click="toggleEdit">取消</el-button>
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

    <el-dialog v-model="showPasswordDialog" title="修改密码" width="450px" :close-on-click-modal="false">
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px">
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password placeholder="请输入当前密码" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" size="small" @click="submitChangePassword" :loading="passwordLoading">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { UserFilled } from '@element-plus/icons-vue'
import { getUserInfo, updateProfile, changePassword, uploadAvatar } from '../../api/auth.js'
import { useAuthStore } from '../../stores/auth.js'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()
const profile = ref({})
const isEditing = ref(false)
const avatarInputRef = ref(null)
const editForm = reactive({
  email: '',
  phone: '',
  introduction: ''
})

const showPasswordDialog = ref(false)
const passwordLoading = ref(false)
const passwordFormRef = ref(null)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的新密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于8位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

onMounted(() => {
  loadProfile()
})

async function loadProfile() {
  try {
    const response = await getUserInfo()
    profile.value = response || {}
    if (response?.avatarUrl) {
      authStore.updateUserInfo({ avatar: response.avatarUrl })
    }
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

function triggerAvatarUpload() {
  avatarInputRef.value?.click()
}

async function handleAvatarChange(event) {
  const file = event.target.files?.[0]
  if (!file) return
  try {
    const response = await uploadAvatar(file)
    profile.value.avatarUrl = response.url
    authStore.updateUserInfo({ avatar: response.url })
    ElMessage.success('头像更换成功')
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '头像上传失败')
  } finally {
    event.target.value = ''
  }
}

function resetPasswordForm() {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordFormRef.value?.resetFields()
}

async function submitChangePassword() {
  try {
    const valid = await passwordFormRef.value.validate()
    if (!valid) return
  } catch {
    return
  }
  passwordLoading.value = true
  try {
    await changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    ElMessage.success('密码修改成功')
    showPasswordDialog.value = false
    resetPasswordForm()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '修改失败，请重试')
  } finally {
    passwordLoading.value = false
  }
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
  margin: 0 0 4px 0;
}

.avatar-wrapper {
  position: relative;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--font-size-sm);
  opacity: 0;
  transition: opacity var(--transition-fast);
  border-radius: 50%;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.profile-stats {
  display: flex;
  gap: var(--spacing-xl);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

.stat-value {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--gray-800);
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

.section-actions {
  display: flex;
  gap: 8px;
}

.introduction-text {
  margin: 0;
  line-height: 1.6;
}

.empty-text {
  color: var(--gray-400);
}
</style>