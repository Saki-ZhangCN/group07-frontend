<template>
  <div class="admin-dashboard">
    <!-- 核心指标 -->
    <div class="core-stats animate-fade-in">
      <div class="stats-grid">
        <div class="stat-card large">
          <div class="stat-header">
            <span class="stat-title">总学员数</span>
            <el-tag size="small" type="success">
              <el-icon><Top /></el-icon>
              12.5%
            </el-tag>
          </div>
          <div class="stat-body">
            <div class="stat-value">{{ stats.totalStudents.toLocaleString() }}</div>
          </div>
        </div>
        
        <div class="stat-card large">
          <div class="stat-header">
            <span class="stat-title">活跃学员</span>
            <el-tag size="small" type="success">
              <el-icon><Top /></el-icon>
              8.3%
            </el-tag>
          </div>
          <div class="stat-body">
            <div class="stat-value">{{ stats.activeStudents.toLocaleString() }}</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-title">总讲师</span>
          </div>
          <div class="stat-body">
            <div class="stat-value">{{ stats.totalTeachers }}</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-title">发布课程</span>
          </div>
          <div class="stat-body">
            <div class="stat-value">{{ stats.publishedCourses }}</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-title">完课率</span>
            <el-tag size="small" type="success">良好</el-tag>
          </div>
          <div class="stat-body">
            <div class="stat-value">{{ stats.completionRate }}%</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-title">平均评分</span>
          </div>
          <div class="stat-body">
            <div class="stat-value">{{ stats.avgRating }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 活跃度趋势 -->
    <div class="trend-section">
      <div class="section-header">
        <h2 class="section-title">活跃度趋势</h2>
        <div class="time-filter">
          <el-radio-group v-model="timeRange" size="small">
            <el-radio-button label="week">近7天</el-radio-button>
            <el-radio-button label="month">近30天</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <div ref="lineChartRef" class="chart-box-lg"></div>
    </div>
    
    <!-- 数据概览 -->
    <div class="overview-section">
      <div class="overview-grid">
        <!-- 完课率分布 -->
        <div class="overview-card">
          <h3 class="card-title">完课率分布</h3>
          <div ref="pieChartRef" class="chart-box-md"></div>
        </div>
        
        <!-- 课程排行榜 -->
        <div class="overview-card">
          <h3 class="card-title">热门课程TOP10</h3>
          <div class="ranking-list">
            <div class="ranking-item" v-for="(item, index) in courseRanking" :key="item.id">
              <span class="ranking-number" :class="{ top: index < 3 }">{{ index + 1 }}</span>
              <span class="ranking-name">{{ item.name }}</span>
              <span class="ranking-value">{{ item.students }}人</span>
            </div>
          </div>
        </div>
        
        <!-- 预警学员 -->
        <div class="overview-card">
          <h3 class="card-title">学习预警学员</h3>
          <div class="warning-list">
            <div class="warning-item" v-for="item in warningStudents" :key="item.id">
              <div class="warning-info">
                <span class="warning-name">{{ item.realName }}</span>
                <span class="warning-course">{{ item.reason }}</span>
              </div>
              <div class="warning-status">
                <span class="warning-days">{{ item.status }}</span>
                <el-button size="small" type="danger" @click="handleWarning(item)">
                  处理
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { Top } from '@element-plus/icons-vue'
import { getActivityTrend, getCompletionRate, getCourseRanking, getDashboardStats, getWarningUsers } from '../../api/dashboard.js'

const timeRange = ref('week')

const stats = ref({
  totalStudents: 15234,
  activeStudents: 8562,
  totalTeachers: 45,
  publishedCourses: 128,
  completionRate: 68,
  avgRating: 4.6
})

const courseRanking = ref([
  { id: '1', name: 'Java编程基础', students: 2568 },
  { id: '2', name: 'Python数据分析', students: 2150 },
  { id: '3', name: 'Web前端开发', students: 1890 },
  { id: '4', name: '算法设计与分析', students: 1650 },
  { id: '5', name: '数据库原理', students: 1420 }
])

const warningStudents = ref([
  { id: '1', name: '学员A', course: 'Java编程基础', days: 7 },
  { id: '2', name: '学员B', course: 'Python数据分析', days: 5 },
  { id: '3', name: '学员C', course: 'Web前端开发', days: 10 }
])

const lineChartRef = ref(null)
const pieChartRef = ref(null)

let lineChart = null
let pieChart = null
let activityData = { dates: [], values: [] }
let completionData = { dates: [], values: [] }

function handleWarning(item) {
  // 处理预警学员
}

function initCharts() {
  // 折线图
  if (lineChartRef.value) {
    lineChart = echarts.init(lineChartRef.value)
    lineChart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['登录人数', '学习人数'] },
      xAxis: { type: 'category', data: activityData.dates },
      yAxis: { type: 'value' },
      series: [
        {
          name: '登录人数',
          type: 'line',
          smooth: true,
          data: activityData.values,
          lineStyle: { color: '#6366F1' }
        },
        {
          name: '学习人数',
          type: 'line',
          smooth: true,
          data: completionData.values,
          lineStyle: { color: '#14B8A6' }
        }
      ]
    })
  }
  
  // 饼图
  if (pieChartRef.value) {
    pieChart = echarts.init(pieChartRef.value)
    pieChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: '5%', left: 'center' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false },
        data: [{ value: Number(stats.value.completionRate||0), name: '已完成', itemStyle:{color:'#22C55E'} },{ value: Math.max(0,100-Number(stats.value.completionRate||0)), name:'未完成',itemStyle:{color:'#F97316'} }]
      }]
    })
  }
}

onMounted(async () => {
  const [summary, ranking, warnings, activity, completion] = await Promise.all([
    getDashboardStats(), getCourseRanking({}), getWarningUsers({ page: 1, size: 5 }), getActivityTrend({}), getCompletionRate({})
  ])
  stats.value = { ...stats.value, ...summary, activeStudents: summary.activeUsers, avgRating: Number(summary.averageScore||0).toFixed(1) }
  activityData = activity || activityData
  completionData = completion || completionData
  courseRanking.value = ranking || []
  warningStudents.value = warnings.records || []
  initCharts()
  window.addEventListener('resize', () => {
    lineChart?.resize()
    pieChart?.resize()
  })
})

onUnmounted(() => {
  lineChart?.dispose()
  pieChart?.dispose()
})
</script>

<style scoped>
.admin-dashboard {
  max-width: 1200px;
}

.core-stats {
  margin-bottom: var(--spacing-xl);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--spacing-lg);
}

.stat-card {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-xl);
}

.stat-card.large {
  grid-column: span 2;
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.stat-title {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

.stat-body {
  display: flex;
  align-items: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--gray-800);
}

.stat-card.large .stat-value {
  font-size: 36px;
}

.trend-section {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
  margin-bottom: var(--spacing-xl);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--gray-800);
}

.chart-box-lg {
  width: 100%;
  height: 400px;
}

.chart-box-md {
  width: 100%;
  height: 300px;
}

.overview-section {
  margin-bottom: var(--spacing-xl);
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
}

.overview-card {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: var(--spacing-lg);
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm);
  background: var(--gray-50);
  border-radius: var(--radius-md);
}

.ranking-number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  background: var(--gray-200);
  color: var(--gray-600);
}

.ranking-number.top {
  background: var(--primary-500);
  color: white;
}

.ranking-name {
  flex: 1;
  margin-left: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--gray-800);
}

.ranking-value {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--gray-500);
}

.warning-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.warning-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-md);
}

.warning-info {
  display: flex;
  flex-direction: column;
}

.warning-name {
  font-weight: 500;
  color: var(--gray-800);
}

.warning-course {
  font-size: var(--font-size-xs);
  color: var(--gray-500);
}

.warning-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.warning-days {
  font-size: var(--font-size-xs);
  color: var(--red-500);
}

@media (max-width: 1023px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-card.large {
    grid-column: span 1;
  }
  
  .overview-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
