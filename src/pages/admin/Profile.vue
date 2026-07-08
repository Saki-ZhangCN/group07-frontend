<template>
  <div class="admin-profile">
    <div class="profile-card">
      <!-- 头像区 -->
      <div class="avatar-section">
        <div class="avatar-wrapper" @click="triggerUpload">
          <el-avatar :size="100" :src="userAvatar">
            <el-icon :size="48"><UserFilled /></el-icon>
          </el-avatar>
          <div class="avatar-overlay">
            <span>更换头像</span>
          </div>
        </div>
        <div class="user-title">{{ userRole }}</div>
        <div class="user-name">{{ userName }}</div>
      </div>

      <!-- 统计信息 -->
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-label">账号</span>
          <span class="stat-value">{{ accountNo }}</span>
        </div>
      </div>

      <!-- 个人信息 & 账号安全 -->
      <div class="info-card">
        <div class="card-header">
          <h3>个人信息</h3>
          <el-button size="small" type="primary" @click="editMode = !editMode">
            {{ editMode ? '取消' : '编辑个人信息' }}
          </el-button>
        </div>
        <el-form :model="form" label-width="80px" :disabled="!editMode">
          <el-form-item label="姓名">
            <el-input v-model="form.realName" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="form.phone" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="form.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item v-if="editMode">
            <el-button size="small" type="primary" @click="saveProfile">保存修改</el-button>
            <el-button size="small" @click="editMode = false">取消</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 修改密码 -->
      <div class="info-card">
        <div class="card-header">
          <h3>修改密码</h3>
          <el-button size="small" type="primary" @click="showPasswordDialog = true">修改密码</el-button>
        </div>
      </div>
    </div>

    <!-- 密码修改对话框 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="400px">
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="80px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="showPasswordDialog = false">取消</el-button>
        <el-button size="small" type="primary" @click="changePassword">确认修改</el-button>
      </template>
    </el-dialog>

    <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="handleAvatarChange" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../../stores/auth.js'
import { updateProfile, changePassword as changePasswordApi } from '../../api/auth.js'
import { uploadAvatar } from '../../api/auth.js'

const authStore = useAuthStore()
const fileInput = ref(null)
const editMode = ref(false)
const showPasswordDialog = ref(false)
const passwordFormRef = ref(null)

const userAvatar = computed(() => authStore.userInfo?.avatar || '')
const userName = computed(() => authStore.userInfo?.realName || authStore.userName || '管理员')
const userRole = computed(() => '管理员')
const accountNo = computed(() => authStore.userInfo?.adminNo || authStore.userName || '-')

const form = reactive({
  realName: '',
  phone: '',
  email: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_, value, callback) => {
        if (value !== passwordForm.newPassword) callback(new Error('两次密码不一致'))
        else callback()
      },
      trigger: 'blur'
    }
  ]
}

onMounted(() => {
  const info = authStore.userInfo || {}
  form.realName = info.realName || ''
  form.phone = info.phone || ''
  form.email = info.email || ''
})

function triggerUpload() {
  fileInput.value?.click()
}

async function handleAvatarChange(e) {
  const file = e.target.files[0]
  if (!file) return
  try {
    const res = await uploadAvatar(file)
    const url = res.data?.url || res.url
    authStore.updateUserInfo({ avatar: url })
    ElMessage.success('头像更新成功')
  } catch (error) {
    ElMessage.error('头像上传失败')
  }
  fileInput.value.value = ''
}

async function saveProfile() {
  try {
    await updateProfile(form)
    if (authStore.userInfo) {
      authStore.userInfo.realName = form.realName
      authStore.userInfo.phone = form.phone
      authStore.userInfo.email = form.email
    }
    ElMessage.success('保存成功')
    editMode.value = false
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

async function changePassword() {
  try {
    await passwordFormRef.value.validate()
    await changePasswordApi({ oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword })
    ElMessage.success('密码修改成功')
    showPasswordDialog.value = false
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error) {
    if (error?.message) ElMessage.error('修改失败')
  }
}
</script>

<style scoped>
.admin-profile {
  max-width: 720px;
  margin: 0 auto;
}

.profile-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.avatar-wrapper {
  position: relative;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
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

.user-title {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
  padding: 2px 12px;
  background: var(--gray-50);
  border-radius: var(--radius-full);
}

.user-name {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--gray-800);
}

.stats-row {
  display: flex;
  justify-content: center;
  gap: var(--spacing-xl);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

.stat-value {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--gray-800);
}

.info-card {
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.card-header h3 {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--gray-800);
  margin: 0;
}
</style>