<template>
  <div class="layout-wrapper">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon teacher-icon">
            <el-icon :size="32"><Reading /></el-icon>
          </div>
          <span v-if="!isCollapsed" class="logo-text">讲师工作台</span>
        </div>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :collapse="isCollapsed"
        router
      >
        <el-menu-item index="/teacher">
          <el-icon><HomeFilled /></el-icon>
          <span>工作台</span>
        </el-menu-item>
        <el-menu-item index="/teacher/courses">
          <el-icon><FolderOpened /></el-icon>
          <span>课程管理</span>
        </el-menu-item>
        <el-menu-item index="/teacher/live">
          <el-icon><VideoCamera /></el-icon>
          <span>直播管理</span>
        </el-menu-item>
        <el-menu-item index="/teacher/homework">
          <el-icon><Document /></el-icon>
          <span>作业管理</span>
        </el-menu-item>
        <el-menu-item index="/teacher/exercises/create">
          <el-icon><EditPen /></el-icon><span>添加习题</span>
        </el-menu-item>
        <el-menu-item index="/teacher/homework/grade">
          <el-icon><Finished /></el-icon>
          <span>作业批改</span>
        </el-menu-item>
        <el-menu-item index="/teacher/analysis">
          <el-icon><DataAnalysis /></el-icon>
          <span>学情分析</span>
        </el-menu-item>
        <el-menu-item index="/teacher/profile">
          <el-icon><User /></el-icon>
          <span>个人中心</span>
        </el-menu-item>
      </el-menu>
      
      <div class="sidebar-footer">
        <button class="collapse-btn" @click="toggleCollapse">
          <el-icon :size="20">
            <Fold v-if="!isCollapsed" />
            <Expand v-else />
          </el-icon>
        </button>
      </div>
    </aside>
    
    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 顶部栏 -->
      <header class="header">
        <div class="header-left">
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
        <div class="header-right">
          <el-badge :value="pendingCount" :max="99" class="notification-badge" v-if="pendingCount > 0">
            <el-button circle>
              <el-icon><Bell /></el-icon>
            </el-button>
          </el-badge>
          <el-button circle v-else>
            <el-icon><Bell /></el-icon>
          </el-button>
          <el-dropdown trigger="click">
            <div class="user-info">
              <el-avatar :size="40" :src="userAvatar">
                <el-icon><UserFilled /></el-icon>
              </el-avatar>
              <span class="user-name">{{ userName }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goToProfile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
      
      <!-- 内容区域 -->
      <div class="content-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isCollapsed = ref(false)
const pendingCount = ref(5)

const activeMenu = computed(() => route.path)
const pageTitle = computed(() => {
  const titles = {
    '/teacher': '讲师工作台',
    '/teacher/courses': '课程管理',
    '/teacher/course/create': '创建课程',
    '/teacher/course/edit': '编辑课程',
    '/teacher/live': '直播管理',
    '/teacher/live/teaching': '直播授课',
    '/teacher/homework': '作业管理',
    '/teacher/exercises/create': '添加习题',
    '/teacher/homework/grade': '作业批改',
    '/teacher/analysis': '学情分析',
    '/teacher/profile': '个人中心'
  }
  return titles[route.path] || '讲师工作台'
})

const userName = computed(() => authStore.userName || '讲师')
const userAvatar = computed(() => authStore.userInfo?.avatar || '')

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

function goToProfile() {
  router.push('/teacher/profile')
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    authStore.logout()
    router.push('/login')
    ElMessage.success('已退出登录')
  } catch {
    // 取消退出
  }
}
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  min-height: 100vh;
  background: var(--gray-50);
}

.sidebar {
  width: 260px;
  background: white;
  border-right: 1px solid var(--gray-100);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-base);
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--gray-100);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--accent-orange), var(--yellow-400));
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.teacher-icon {
  background: linear-gradient(135deg, var(--accent-cyan), var(--primary-500));
}

.logo-text {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--gray-800);
}

.sidebar-menu {
  flex: 1;
  padding: var(--spacing-md);
  border: none;
}

.sidebar-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--gray-100);
}

.collapse-btn {
  width: 100%;
  padding: var(--spacing-sm);
  background: var(--gray-50);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-600);
  transition: all var(--transition-fast);
}

.collapse-btn:hover {
  background: var(--gray-100);
  color: var(--accent-cyan);
}

.main-content {
  flex: 1;
  margin-left: 260px;
  transition: margin-left var(--transition-base);
  display: flex;
  flex-direction: column;
}

.sidebar.collapsed + .main-content {
  margin-left: 80px;
}

.header {
  height: 64px;
  background: white;
  border-bottom: 1px solid var(--gray-100);
  padding: 0 var(--spacing-xl);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-left {
  display: flex;
  align-items: center;
}

.page-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--gray-800);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.notification-badge {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-lg);
  transition: background var(--transition-fast);
}

.user-info:hover {
  background: var(--gray-50);
}

.user-name {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--gray-700);
}

.content-wrapper {
  flex: 1;
  padding: var(--spacing-xl);
  overflow-y: auto;
}

@media (max-width: 1023px) {
  .sidebar {
    width: 80px;
  }
  
  .main-content {
    margin-left: 80px;
  }
  
  .logo-text {
    display: none;
  }
}

@media (max-width: 767px) {
  .sidebar {
    width: 260px;
    left: -260px;
  }
  
  .sidebar.open {
    left: 0;
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .user-name {
    display: none;
  }
}
</style>
