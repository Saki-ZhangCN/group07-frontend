<template>
  <div class="layout-wrapper">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon admin-icon">
            <el-icon :size="32"><Setting /></el-icon>
          </div>
          <span v-if="!isCollapsed" class="logo-text">运营管理后台</span>
        </div>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :collapse="isCollapsed"
        router
      >
        <el-menu-item index="/admin">
          <el-icon><Odometer /></el-icon>
          <span>数据看板</span>
        </el-menu-item>
        <el-sub-menu index="user-management">
          <template #title>
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/admin/users">用户列表</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="course-management">
          <template #title>
            <el-icon><Reading /></el-icon>
            <span>课程管理</span>
          </template>
          <el-menu-item index="/admin/courses">课程审核</el-menu-item>
          <el-menu-item index="/admin/resources">资源管理</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/admin/exams">
          <el-icon><Edit /></el-icon>
          <span>题库管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/announcements">
          <el-icon><ChatDotRound /></el-icon>
          <span>公告管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/statistics">
          <el-icon><TrendCharts /></el-icon>
          <span>统计分析</span>
        </el-menu-item>
        <el-menu-item index="/admin/system">
          <el-icon><Setting /></el-icon>
          <span>系统配置</span>
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
          <el-button circle>
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
                <el-dropdown-item @click="handleLogout">
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

const activeMenu = computed(() => route.path)
const pageTitle = computed(() => {
  const titles = {
    '/admin': '数据看板',
    '/admin/users': '用户管理',
    '/admin/courses': '课程审核',
    '/admin/resources': '资源管理',
    '/admin/exams': '题库管理',
    '/admin/announcements': '公告管理',
    '/admin/statistics': '统计分析',
    '/admin/system': '系统配置'
  }
  return titles[route.path] || '运营管理后台'
})

const userName = computed(() => authStore.userName || '管理员')
const userAvatar = computed(() => authStore.userInfo?.avatar || '')

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
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
  background: linear-gradient(135deg, var(--gray-700), var(--gray-800));
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.admin-icon {
  background: linear-gradient(135deg, var(--primary-600), var(--primary-800, #312E81));
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
  color: var(--primary-600);
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