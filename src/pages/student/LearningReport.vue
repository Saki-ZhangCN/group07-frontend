<template>
  <div class="learning-report">
    <div class="report-header">
      <h1 class="report-title">学习报告</h1>
      <p class="report-date">更新时间：{{ updateDate }}</p>
    </div>
    
    <!-- 学习概览 -->
    <div class="overview-section animate-fade-in">
      <div class="overview-grid">
        <div class="overview-card">
          <div class="overview-icon">
            <el-icon :size="32"><Clock /></el-icon>
          </div>
          <div class="overview-content">
            <div class="overview-value">{{ overview.studyHours }}</div>
            <div class="overview-label">累计学习时长</div>
          </div>
        </div>
        
        <div class="overview-card">
          <div class="overview-icon">
            <el-icon :size="32"><Reading /></el-icon>
          </div>
          <div class="overview-content">
            <div class="overview-value">{{ overview.completedCourses }}</div>
            <div class="overview-label">已完成课程</div>
          </div>
        </div>
        
        <div class="overview-card">
          <div class="overview-icon">
            <el-icon :size="32"><Document /></el-icon>
          </div>
          <div class="overview-content">
            <div class="overview-value">{{ overview.completedHomework }}</div>
            <div class="overview-label">完成作业</div>
          </div>
        </div>
        
        <div class="overview-card">
          <div class="overview-icon">
            <el-icon :size="32"><TrendCharts /></el-icon>
          </div>
          <div class="overview-content">
            <div class="overview-value">{{ overview.avgScore }}</div>
            <div class="overview-label">平均分数</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 知识点掌握度 -->
    <div class="mastery-section">
      <h2 class="section-title">知识点掌握度</h2>
      <div class="mastery-content">
        <div class="radar-chart-container">
          <div ref="radarChartRef" class="chart-box"></div>
        </div>
        <div class="mastery-details">
          <div class="mastery-item" v-for="item in masteryData" :key="item.name">
            <div class="mastery-header">
              <span class="mastery-name">{{ item.name }}</span>
              <span class="mastery-value" :class="getMasteryClass(item.value)">
                {{ item.value }}%
              </span>
            </div>
            <div class="progress">
              <div 
                class="progress-bar" 
                :style="{ width: item.value + '%' }"
                :class="getMasteryClass(item.value)"
              ></div>
            </div>
            <p class="mastery-tip" v-if="item.value < 60">
              <el-icon><Warning /></el-icon>
              掌握度较低，建议加强复习
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 学习趋势 -->
    <div class="trend-section">
      <h2 class="section-title">学习时长趋势</h2>
      <div ref="lineChartRef" class="chart-box-lg"></div>
    </div>
    
    <!-- 作业正确率 -->
    <div class="accuracy-section">
      <h2 class="section-title">作业正确率趋势</h2>
      <div ref="barChartRef" class="chart-box-lg"></div>
    </div>
    
    <!-- 薄弱知识点推荐 -->
    <div class="recommend-section">
      <h2 class="section-title">薄弱知识点推荐</h2>
      <div class="recommend-list">
        <div class="recommend-item" v-for="item in recommendations" :key="item.id">
          <div class="recommend-info">
            <span class="recommend-name">{{ item.name }}</span>
            <span class="recommend-course">{{ item.course }}</span>
          </div>
          <div class="recommend-action">
            <el-button type="primary" size="small" @click="goToReview(item)">
              去复习
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'

const router = useRouter()

const updateDate = ref('2024-01-20 10:30')

const overview = ref({
  studyHours: 48,
  completedCourses: 3,
  completedHomework: 15,
  avgScore: 85
})

const masteryData = ref([
  { name: 'Java基础', value: 92 },
  { name: '面向对象', value: 75 },
  { name: '集合框架', value: 60 },
  { name: '多线程', value: 45 },
  { name: '网络编程', value: 30 }
])

const recommendations = ref([
  {
    id: '1',
    name: '网络编程基础',
    course: 'Java编程基础',
    chapterId: '4'
  },
  {
    id: '2',
    name: '多线程编程',
    course: 'Java编程基础',
    chapterId: '5'
  },
  {
    id: '3',
    name: '递归算法',
    course: '算法设计与分析',
    chapterId: '3'
  }
])

const radarChartRef = ref(null)
const lineChartRef = ref(null)
const barChartRef = ref(null)

let radarChart = null
let lineChart = null
let barChart = null

function getMasteryClass(value) {
  if (value >= 80) return 'high'
  if (value >= 60) return 'medium'
  return 'low'
}

function goToReview(item) {
  router.push(`/student/study/${item.courseId}?chapter=${item.chapterId}`)
}

function initCharts() {
  // 雷达图
  if (radarChartRef.value) {
    radarChart = echarts.init(radarChartRef.value)
    radarChart.setOption({
      radar: {
        indicator: masteryData.value.map(item => ({
          name: item.name,
          max: 100
        }))
      },
      series: [{
        type: 'radar',
        data: [{
          value: masteryData.value.map(item => item.value),
          name: '掌握度',
          areaStyle: {
            color: 'rgba(99, 102, 241, 0.3)'
          },
          lineStyle: {
            color: '#6366F1'
          },
          itemStyle: {
            color: '#6366F1'
          }
        }]
      }]
    })
  }
  
  // 折线图
  if (lineChartRef.value) {
    lineChart = echarts.init(lineChartRef.value)
    lineChart.setOption({
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      },
      yAxis: {
        type: 'value',
        name: '小时'
      },
      series: [{
        data: [2, 3, 1, 4, 3, 6, 5],
        type: 'line',
        smooth: true,
        lineStyle: {
          color: '#6366F1'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(99, 102, 241, 0.3)' },
              { offset: 1, color: 'rgba(99, 102, 241, 0.05)' }
            ]
          }
        }
      }]
    })
  }
  
  // 柱状图
  if (barChartRef.value) {
    barChart = echarts.init(barChartRef.value)
    barChart.setOption({
      xAxis: {
        type: 'category',
        data: ['作业1', '作业2', '作业3', '作业4', '作业5']
      },
      yAxis: {
        type: 'value',
        name: '正确率%',
        max: 100
      },
      series: [{
        data: [85, 72, 90, 65, 88],
        type: 'bar',
        barWidth: '50%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#6366F1' },
              { offset: 1, color: '#14B8A6' }
            ]
          },
          borderRadius: [8, 8, 0, 0]
        }
      }]
    })
  }
}

function resizeCharts() {
  radarChart?.resize()
  lineChart?.resize()
  barChart?.resize()
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', resizeCharts)
})

onUnmounted(() => {
  radarChart?.dispose()
  lineChart?.dispose()
  barChart?.dispose()
  window.removeEventListener('resize', resizeCharts)
})
</script>

<style scoped>
.learning-report {
  max-width: 1200px;
}

.report-header {
  margin-bottom: var(--spacing-xl);
}

.report-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--gray-800);
}

.report-date {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

.overview-section {
  margin-bottom: var(--spacing-xl);
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
}

.overview-card {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.overview-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--primary-500), var(--accent-cyan));
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.overview-value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--gray-800);
}

.overview-label {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

.mastery-section,
.trend-section,
.accuracy-section,
.recommend-section {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
  margin-bottom: var(--spacing-xl);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: var(--spacing-lg);
}

.mastery-content {
  display: flex;
  gap: var(--spacing-xl);
}

.radar-chart-container {
  width: 300px;
}

.chart-box {
  width: 100%;
  height: 300px;
}

.chart-box-lg {
  width: 100%;
  height: 400px;
}

.mastery-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.mastery-item {
  padding: var(--spacing-md);
  background: var(--gray-50);
  border-radius: var(--radius-lg);
}

.mastery-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.mastery-name {
  font-weight: 500;
  color: var(--gray-800);
}

.mastery-value {
  font-weight: 600;
}

.mastery-value.high {
  color: var(--green-500);
}

.mastery-value.medium {
  color: var(--accent-orange);
}

.mastery-value.low {
  color: var(--red-500);
}

.progress-bar.high {
  background: var(--green-500);
}

.progress-bar.medium {
  background: linear-gradient(to right, var(--primary-500), var(--accent-orange));
}

.progress-bar.low {
  background: var(--red-500);
}

.mastery-tip {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-xs);
  color: var(--red-500);
}

.recommend-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.recommend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  background: var(--gray-50);
  border-radius: var(--radius-lg);
}

.recommend-info {
  display: flex;
  flex-direction: column;
}

.recommend-name {
  font-weight: 500;
  color: var(--gray-800);
}

.recommend-course {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

@media (max-width: 1023px) {
  .overview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .mastery-content {
    flex-direction: column;
  }
  
  .radar-chart-container {
    width: 100%;
  }
}

@media (max-width: 767px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }
}
</style>