<template>
  <div class="personal-center">
    <div class="profile-section">
      <div class="profile-header">
        <el-avatar :size="100" :src="userProfile.avatar">
          <el-icon :size="50"><UserFilled /></el-icon>
        </el-avatar>
        <div class="profile-info">
          <h2>{{ userProfile.name }}</h2>
          <p class="profile-desc">{{ userProfile.description }}</p>
        </div>
      </div>
      
      <div class="profile-stats">
        <div class="stat-item">
          <span class="stat-value">{{ userProfile.courses }}</span>
          <span class="stat-label">已选课程</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ userProfile.hours }}h</span>
          <span class="stat-label">学习时长</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ userProfile.homeworks }}</span>
          <span class="stat-label">完成作业</span>
        </div>
      </div>
    </div>
    
    <div class="settings-section">
      <h3>账户设置</h3>
      <el-form label-width="100px">
        <el-form-item label="用户名">
          <el-input :value="userProfile.name" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input :value="userProfile.email" />
        </el-form-item>
        <el-form-item label="手机">
          <el-input :value="userProfile.phone" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary">保存修改</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const userProfile = ref({
  name: '学员',
  avatar: '',
  description: '努力学习，天天向上',
  email: 'student@example.com',
  phone: '13800138000',
  courses: 5,
  hours: 48,
  homeworks: 15
})
</script>

<style scoped>
.personal-center {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.profile-section,
.settings-section {
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
}

.profile-desc {
  color: var(--gray-500);
  font-size: var(--font-size-sm);
}

.profile-stats {
  display: flex;
  gap: var(--spacing-xl);
}

.stat-item {
  text-align: center;
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

.settings-section h3 {
  font-size: var(--font-size-lg);
  color: var(--gray-800);
  margin-bottom: var(--spacing-lg);
}
</style>