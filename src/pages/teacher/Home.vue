<template>
  <div class="teacher-home">
    <!-- 概览统计 -->
    <div class="stats-section animate-fade-in">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, var(--accent-cyan), var(--primary-500))">
            <el-icon :size="24"><FolderOpened /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalCourses }}</div>
            <div class="stat-label">发布课程</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, var(--accent-orange), var(--yellow-400))">
            <el-icon :size="24"><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalStudents }}</div>
            <div class="stat-label">累计学员</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, var(--green-500), var(--accent-cyan))">
            <el-icon :size="24"><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.pendingHomework }}</div>
            <div class="stat-label">待批作业</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, var(--primary-500), var(--primary-600))">
            <el-icon :size="24"><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.liveHours }}h</div>
            <div class="stat-label">直播时长</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 待办事项 -->
    <section class="section">
      <h2 class="section-title">待办事项</h2>
      
      <div class="todo-list">
        <div class="todo-item" v-for="todo in todos" :key="todo.id">
          <div class="todo-content">
            <div class="todo-badge">
              <span class="badge" :class="getTodoBadgeClass(todo.type)">
                {{ todo.type }}
              </span>
            </div>
            <div class="todo-info">
              <h4 class="todo-title">{{ todo.title }}</h4>
              <p class="todo-desc">{{ todo.courseName }}</p>
            </div>
          </div>
          <div class="todo-action">
            <div class="todo-time">{{ todo.time }}</div>
            <el-button type="primary" size="small" @click="handleTodo(todo)">
              {{ todo.action }}
            </el-button>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 我的课程 -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">我的课程</h2>
        <el-button type="primary" @click="router.push('/teacher/course/create')">
          <el-icon><Plus /></el-icon>
          创建课程
        </el-button>
      </div>
      
      <div class="courses-grid">
        <div class="course-card" v-for="course in courses" :key="course.id">
          <div class="course-cover">
            <img :src="course.coverImage" :alt="course.name" />
            <span class="course-status" :class="course.statusClass">
              {{ course.status }}
            </span>
          </div>
          <div class="course-info">
            <h3 class="course-name">{{ course.name }}</h3>
            <div class="course-meta">
              <span class="meta-item">
                <el-icon><User /></el-icon>
                {{ course.students }}学员
              </span>
              <span class="meta-item">
                <el-icon><Clock /></el-icon>
                {{ course.hours }}课时
              </span>
            </div>
            <div class="course-actions">
              <el-button size="small" @click="editCourse(course.id)">编辑</el-button>
              <el-button size="small" type="primary" @click="goToLive(course.id)">直播</el-button>
              <el-button size="small" @click="viewAnalysis(course.id)">分析</el-button>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 学情概览 -->
    <section class="section">
      <h2 class="section-title">学情概览</h2>
      <div ref="chartRef" class="chart-box"></div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'

const router = useRouter()

const stats = ref({
  totalCourses: 6,
  totalStudents: 1258,
  pendingHomework: 15,
  liveHours: 32
})

const todos = ref([
  {
    id: '1',
    type: '作业批改',
    title: '第三章课后习题',
    courseName: 'Java编程基础',
    time: '32份待批',
    action: '开始批改'
  },
  {
    id: '2',
    type: '直播提醒',
    title: '今晚8点直播课程',
    courseName: 'Python数据分析',
    time: '剩余3小时',
    action: '进入直播'
  },
  {
    id: '3',
    type: '答疑回复',
    title: '5个待回复问题',
    courseName: 'Web前端开发',
    time: '今日新增',
    action: '查看详情'
  }
])

const courses = ref([
  {
    id: '1',
    name: 'Java编程基础',
    coverImage: 'https://picsum.photos/seed/t-java/400/225',
    students: 356,
    hours: 48,
    status: '已发布',
    statusClass: 'published'
  },
  {
    id: '2',
    name: 'Python数据分析',
    coverImage: 'https://picsum.photos/seed/t-python/400/225',
    students: 285,
    hours: 36,
    status: '审核中',
    statusClass: 'reviewing'
  },
  {
    id: '3',
    name: 'Web前端开发',
    coverImage: 'https://picsum.photos/seed/t-web/400/225',
    students: 617,
    hours: 60,
    status: '已发布',
    statusClass: 'published'
  }
])

const chartRef = ref(null)
let chart = null

function getTodoBadgeClass(type) {
  const classMap = {
    '作业批改': 'badge-warning',
    '直播提醒': 'badge-success',
    '答疑回复': 'badge-primary'
  }
  return classMap[type] || ''
}

function handleTodo(todo) {
  const actionMap = {
    '作业批改': '/teacher/homework/grade',
    '直播提醒': '/teacher/live/teaching',
    '答疑回复': '/teacher/analysis'
  }
  router.push(actionMap[todo.type] || '/teacher')
}

function editCourse(id) {
  router.push(`/teacher/course/edit/${id}`)
}

function goToLive(id) {
  router.push('/teacher/live/teaching')
}

function viewAnalysis(id) {
  router.push(`/teacher/analysis?course=${id}`)
}

function initChart() {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value)
    chart.setOption({
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['作业完成率', '平均分', '活跃度']
      },
      xAxis: {
        type: 'category',
        data: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周']
      },
      yAxis: [
        {
          type: 'value',
          name: '完成率%',
          max: 100
        },
        {
          type: 'value',
          name: '分数',
          max: 100
        }
      ],
      series: [
        {
          name: '作业完成率',
          type: 'line',
          data: [65, 72, 78, 85, 82, 88],
          lineStyle: { color: '#14B8A6' }
        },
        {
          name: '平均分',
          type: 'bar',
          yAxisIndex: 1,
          data: [75, 78, 80, 85, 82, 87],
          itemStyle: { color: '#6366F1' }
        },
        {
          name: '活跃度',
          type: 'line',
          data: [80, 75, 85, 90, 85, 92],
          lineStyle: { color: '#F97316' }
        }
      ]
    })
  }
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => chart?.resize())
})

onUnmounted(() => {
  chart?.dispose()
})
</script>

<style scoped>
.teacher-home {
  max-width: 1200px;
}

.stats-section {
  margin-bottom: var(--spacing-xl);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
}

.stat-card {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--gray-800);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

.section {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
  margin-bottom: var(--spacing-xl);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: var(--spacing-lg);
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  background: var(--gray-50);
  border-radius: var(--radius-lg);
}

.todo-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.todo-title {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--gray-800);
  margin-bottom: var(--spacing-xs);
}

.todo-desc {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

.todo-action {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.todo-time {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
}

.course-card {
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid var(--gray-100);
}

.course-cover {
  position: relative;
  aspect-ratio: 16/9;
}

.course-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-status {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
}

.course-status.published {
  background: var(--green-500);
  color: white;
}

.course-status.reviewing {
  background: var(--accent-orange);
  color: white;
}

.course-info {
  padding: var(--spacing-lg);
}

.course-name {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: var(--spacing-md);
}

.course-meta {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

.course-actions {
  display: flex;
  gap: var(--spacing-md);
}

.chart-box {
  width: 100%;
  height: 400px;
}

@media (max-width: 1023px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .courses-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .courses-grid {
    grid-template-columns: 1fr;
  }
  
  .todo-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
}
</style>