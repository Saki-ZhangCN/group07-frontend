import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const routes = [
  // 公共路由
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/common/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    redirect: '/login'
  },
  
  // 学员端路由
  {
    path: '/student',
    name: 'StudentLayout',
    component: () => import('../layouts/StudentLayout.vue'),
    meta: { requiresAuth: true, role: 'student' },
    children: [
      { path: '', name: 'StudentHome', component: () => import('../pages/student/Home.vue') },
      { path: 'courses', name: 'CourseCenter', component: () => import('../pages/student/CourseCenter.vue') },
      { path: 'my-courses', name: 'MyCourses', component: () => import('../pages/student/MyCourses.vue') },
      { path: 'course/:id', name: 'CourseDetail', component: () => import('../pages/student/CourseDetail.vue') },
      { path: 'study/:courseId', name: 'CourseStudy', component: () => import('../pages/student/CourseStudy.vue') },
      { path: 'live', name: 'StudentLiveList', component: () => import('../pages/student/LiveList.vue') },
      { path: 'live/:roomId', name: 'LiveRoom', component: () => import('../pages/student/LiveRoom.vue') },
      { path: 'homework', name: 'HomeworkList', component: () => import('../pages/student/HomeworkList.vue') },
      { path: 'homework/:id', name: 'HomeworkDetail', component: () => import('../pages/student/HomeworkDetail.vue') },
      { path: 'exercises', name: 'ExerciseCenter', component: () => import('../pages/student/ExerciseCenter.vue') },
      { path: 'wrongbook', name: 'WrongBook', component: () => import('../pages/student/WrongBook.vue') },
      { path: 'report', name: 'LearningReport', component: () => import('../pages/student/LearningReport.vue') },
      { path: 'profile', name: 'PersonalCenter', component: () => import('../pages/student/PersonalCenter.vue') }
    ]
  },
  
  // 讲师端路由
  {
    path: '/teacher',
    name: 'TeacherLayout',
    component: () => import('../layouts/TeacherLayout.vue'),
    meta: { requiresAuth: true, role: 'teacher' },
    children: [
      { path: '', name: 'TeacherDashboard', component: () => import('../pages/teacher/Dashboard.vue') },
      { path: 'courses', name: 'CourseManage', component: () => import('../pages/teacher/CourseManage.vue') },
      { path: 'course/create', name: 'CourseCreate', component: () => import('../pages/teacher/CourseCreate.vue') },
      { path: 'course/edit/:id', name: 'CourseEdit', component: () => import('../pages/teacher/CourseEdit.vue') },
      { path: 'course/:id/detail', name: 'TeacherCourseDetail', component: () => import('../pages/student/CourseDetail.vue'), meta: { teacherPreview: true } },
      { path: 'live', name: 'LiveManage', component: () => import('../pages/teacher/LiveManage.vue') },
      { path: 'live/teaching/:roomId', name: 'LiveTeaching', component: () => import('../pages/teacher/LiveTeaching.vue') },
      { path: 'homework', name: 'HomeworkManage', component: () => import('../pages/teacher/HomeworkManage.vue') },
      { path: 'exercises/create', name: 'ExerciseCreate', component: () => import('../pages/teacher/ExerciseCreate.vue') },
      { path: 'homework/grade', name: 'HomeworkGrade', component: () => import('../pages/teacher/HomeworkGrade.vue') },
      { path: 'analysis', name: 'LearningAnalysis', component: () => import('../pages/teacher/LearningAnalysis.vue') },
      { path: 'profile', name: 'TeacherPersonalCenter', component: () => import('../pages/teacher/PersonalCenter.vue') }
    ]
  },
  
  // 运营端路由
  {
    path: '/admin',
    name: 'AdminLayout',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', name: 'AdminDashboard', component: () => import('../pages/admin/Dashboard.vue') },
      { path: 'users', name: 'UserManage', component: () => import('../pages/admin/UserManage.vue') },
      { path: 'courses', name: 'CourseAudit', component: () => import('../pages/admin/CourseAudit.vue') },
      { path: 'courses/list', name: 'CourseList', component: () => import('../pages/admin/CourseList.vue') },
      { path: 'exams', name: 'ExamManage', component: () => import('../pages/admin/ExamManage.vue') },
      { path: 'content-audit', name: 'ContentAudit', component: () => import('../pages/admin/ContentAudit.vue') },
      { path: 'announcements', name: 'Announcement', component: () => import('../pages/admin/Announcement.vue') },
      { path: 'statistics', name: 'Statistics', component: () => import('../pages/admin/Statistics.vue') },
      { path: 'system', name: 'SystemConfig', component: () => import('../pages/admin/SystemConfig.vue') }
    ]
  },
  
  // 404路由
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/common/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth) {
    if (!authStore.isLoggedIn) {
      next({ name: 'Login' })
      return
    }
    
    if (to.meta.role && authStore.userRole !== to.meta.role) {
      next({ name: 'NotFound' })
      return
    }
  }
  
  if (to.name === 'Login' && authStore.isLoggedIn) {
    const redirectMap = {
      student: 'StudentHome',
      teacher: 'TeacherDashboard',
      admin: 'AdminDashboard'
    }
    next({ name: redirectMap[authStore.userRole] || 'StudentHome' })
    return
  }
  
  next()
})

export default router
