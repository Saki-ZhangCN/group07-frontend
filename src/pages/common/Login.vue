<template>
  <div class="login-page">
    <div class="login-container">
      <!-- 左侧装饰区域 -->
      <div class="login-decoration">
        <div class="decoration-content">
          <div class="decoration-icon animate-float">
            <el-icon :size="80"><School /></el-icon>
          </div>
          <h2 class="decoration-title">在线教育智慧教学平台</h2>
          <p class="decoration-desc">实现线上线下融合教学，助力教育数字化转型</p>
          <div class="decoration-features">
            <div class="feature-item">
              <el-icon><VideoCamera /></el-icon>
              <span>千人级直播课堂</span>
            </div>
            <div class="feature-item">
              <el-icon><Edit /></el-icon>
              <span>智能作业批改</span>
            </div>
            <div class="feature-item">
              <el-icon><DataAnalysis /></el-icon>
              <span>学情数据分析</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧登录区域 -->
      <div class="login-form-section">
        <div class="login-form-container">
          <div class="login-header">
            <h1 class="login-title">欢迎登录</h1>
            <p class="login-subtitle">请选择您的角色并输入账号信息</p>
          </div>
          
          <!-- 角色选择 -->
          <div class="role-selector">
            <button 
              class="role-btn" 
              :class="{ active: selectedRole === 'student' }"
              @click="selectedRole = 'student'"
            >
              <el-icon :size="24"><User /></el-icon>
              <span>学员</span>
            </button>
            <button 
              class="role-btn" 
              :class="{ active: selectedRole === 'teacher' }"
              @click="selectedRole = 'teacher'"
            >
              <el-icon :size="24"><Reading /></el-icon>
              <span>讲师</span>
            </button>
            <button 
              class="role-btn" 
              :class="{ active: selectedRole === 'admin' }"
              @click="selectedRole = 'admin'"
            >
              <el-icon :size="24"><Setting /></el-icon>
              <span>管理员</span>
            </button>
          </div>
          
          <!-- 登录表单 -->
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
            @submit.prevent="handleLogin"
          >
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                :placeholder="usernamePlaceholder"
                prefix-icon="User"
                size="large"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="Lock"
                size="large"
                show-password
              />
            </el-form-item>
            
            <el-form-item prop="captcha">
              <div class="captcha-row">
                <el-input
                  v-model="loginForm.captcha"
                  placeholder="请输入验证码"
                  prefix-icon="Key"
                  size="large"
                  class="captcha-input"
                />
                <div class="captcha-image" @click="refreshCaptcha">
                  <img v-if="captchaImage" :src="captchaImage" alt="验证码" />
                  <span v-else class="captcha-text">{{ captchaText }}</span>
                </div>
              </div>
            </el-form-item>
            
            <div class="login-options">
              <el-checkbox v-model="rememberMe">记住我</el-checkbox>
              <a href="#" class="forgot-link">忘记密码？</a>
            </div>
            
            <el-button
              type="primary"
              size="large"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              登 录
            </el-button>
          </el-form>
          
          <div class="login-footer">
            <p>首次登录请使用管理员分配的初始密码</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.js'
import { ElMessage } from 'element-plus'
import { login } from '../../api/auth.js'

const router = useRouter()
const authStore = useAuthStore()

const loginFormRef = ref(null)
const selectedRole = ref('student')
const loading = ref(false)
const rememberMe = ref(false)
const captchaImage = ref('')
const captchaText = ref('ABCD')

const loginForm = ref({
  username: '',
  password: '',
  captcha: ''
})

const usernamePlaceholder = computed(() => {
  const placeholders = {
    student: '请输入学号',
    teacher: '请输入工号',
    admin: '请输入管理员账号'
  }
  return placeholders[selectedRole.value]
})

const loginRules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
}

function refreshCaptcha() {
  // 生成随机验证码
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  captchaText.value = Array.from({ length: 4 }, () => 
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

async function handleLogin() {
  try {
    await loginFormRef.value.validate()
    
    loading.value = true
    
    const response = await login({
      username: loginForm.value.username,
      password: loginForm.value.password,
      role: selectedRole.value
    })
    
    authStore.login({
      token: response.token,
      user: response.userInfo,
      role: response.userInfo.role
    })
    
    ElMessage.success('登录成功')
    
    const redirectMap = {
      student: '/student',
      teacher: '/teacher',
      admin: '/admin'
    }
    router.push(redirectMap[selectedRole.value])
    
  } catch (error) {
    if (error.response?.data?.code === 401) {
      ElMessage.error('账号或密码错误')
    } else if (error.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('登录失败，请重试')
    }
  } finally {
    loading.value = false
  }
}

// 初始化验证码
refreshCaptcha()
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-50) 0%, white 50%, rgba(20, 184, 166, 0.05) 100%);
  padding: var(--spacing-xl);
}

.login-container {
  display: flex;
  width: 100%;
  max-width: 1000px;
  background: white;
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.login-decoration {
  width: 40%;
  background: linear-gradient(135deg, var(--primary-500), var(--accent-cyan));
  padding: var(--spacing-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.decoration-content {
  text-align: center;
}

.decoration-icon {
  margin-bottom: var(--spacing-xl);
}

.decoration-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin-bottom: var(--spacing-md);
}

.decoration-desc {
  font-size: var(--font-size-sm);
  opacity: 0.9;
  margin-bottom: var(--spacing-xl);
}

.decoration-features {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
}

.login-form-section {
  width: 60%;
  padding: var(--spacing-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-form-container {
  width: 100%;
  max-width: 360px;
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.login-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: var(--spacing-sm);
}

.login-subtitle {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

.role-selector {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.role-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--gray-50);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
  color: var(--gray-600);
}

.role-btn:hover {
  border-color: var(--primary-400);
  background: var(--primary-50);
}

.role-btn.active {
  border-color: var(--primary-500);
  background: linear-gradient(135deg, var(--primary-50), var(--primary-100));
  color: var(--primary-600);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.captcha-row {
  display: flex;
  gap: var(--spacing-md);
}

.captcha-input {
  flex: 1;
}

.captcha-image {
  width: 120px;
  height: 40px;
  background: var(--gray-100);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
}

.captcha-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.captcha-text {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--gray-600);
  letter-spacing: 4px;
  font-family: monospace;
}

.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.forgot-link {
  font-size: var(--font-size-sm);
  color: var(--primary-500);
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.login-footer {
  text-align: center;
  margin-top: var(--spacing-xl);
  font-size: var(--font-size-xs);
  color: var(--gray-400);
}

@media (max-width: 767px) {
  .login-container {
    flex-direction: column;
  }
  
  .login-decoration {
    width: 100%;
    padding: var(--spacing-xl);
  }
  
  .login-form-section {
    width: 100%;
    padding: var(--spacing-xl);
  }
  
  .decoration-features {
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .role-selector {
    flex-direction: column;
  }
  
  .role-btn {
    flex-direction: row;
  }
}
</style>