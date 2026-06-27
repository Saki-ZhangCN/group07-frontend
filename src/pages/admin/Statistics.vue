<template>
  <div class="statistics">
    <h1>统计分析</h1>
    <div ref="chartRef" class="chart-box"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref(null)
let chart = null

onMounted(() => {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value)
    chart.setOption({
      title: { text: '平台整体数据统计' },
      series: [{ type: 'pie', data: [{ value: 50, name: '学员' }, { value: 10, name: '讲师' }] }]
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