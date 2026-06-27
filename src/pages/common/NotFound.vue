<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <div class="error-code animate-float">404</div>
      <h1 class="error-title">页面不存在</h1>
      <p class="error-desc">您访问的页面可能已被移除、名称已更改或暂时不可用</p>
      <el-button type="primary" size="large" @click="goHome">
        <el-icon><HomeFilled /></el-icon>
        返回首页
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

function goHome() {
  const role = authStore.userRole
  const homeMap = {
    student: '/student',
    teacher: '/teacher',
    admin: '/admin'
  }
  router.push(homeMap[role] || '/login')
}
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-50) 0%, white 50%, rgba(20, 184, 166, 0.05) 100%);
}

.not-found-content {
  text-align: center;
  padding: var(--spacing-2xl);
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  color: var(--primary-500);
  line-height: 1;
  margin-bottom: var(--spacing-lg);
}

.error-title {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: var(--spacing-md);
}

.error-desc {
  font-size: var(--font-size-base);
  color: var(--gray-500);
  margin-bottom: var(--spacing-xl);
}
</style>