<template>
  <div class="statistics">
    <h1>统计分析</h1>
    <el-row :gutter="16" class="cards"><el-col v-for="item in cards" :key="item.label" :span="6"><el-card><div class="value">{{item.value}}</div><div>{{item.label}}</div></el-card></el-col></el-row>
    <div ref="chartRef" class="chart-box"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { getActivityTrend, getCompletionRate, getDashboardStats } from '../../api/dashboard.js'

const chartRef = ref(null)
const cards = ref([])
let chart = null

onMounted(async () => {
  const [stats, completion, activity] = await Promise.all([getDashboardStats(), getCompletionRate(), getActivityTrend()])
  cards.value = [{label:'用户总数',value:stats.totalUsers},{label:'课程总数',value:stats.totalCourses},{label:'近7日活跃',value:stats.activeUsers},{label:'平均作业分',value:Number(stats.averageScore||0).toFixed(1)}]
  if (chartRef.value) {
    chart = echarts.init(chartRef.value)
    chart.setOption({
      title: { text: '平台学习趋势' }, tooltip: { trigger: 'axis' }, legend: { data: ['完课率','日活用户'] },
      xAxis: { type: 'category', data: [...new Set([...(completion.dates||[]),...(activity.dates||[])])] }, yAxis: { type: 'value' },
      series: [{ name:'完课率',type:'line',smooth:true,data:completion.values||[] },{ name:'日活用户',type:'bar',data:activity.values||[] }]
    })
  }
})

onUnmounted(() => chart?.dispose())
</script>

<style scoped>
.statistics {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
}
.cards { margin-bottom: 24px; }.value { font-size: 28px; font-weight: 700; color: var(--primary-500); margin-bottom: 8px; }

.statistics h1 {
  font-size: var(--font-size-xl);
  color: var(--gray-800);
  margin-bottom: var(--spacing-xl);
}

.chart-box {
  width: 100%;
  height: 400px;
}
</style>
