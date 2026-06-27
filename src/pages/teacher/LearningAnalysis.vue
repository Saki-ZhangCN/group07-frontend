<template>
  <div class="learning-analysis">
    <h1>学情分析</h1>
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
      title: { text: '学员学习进度' },
      xAxis: { type: 'category', data: ['学员A', '学员B', '学员C', '学员D'] },
      yAxis: { type: 'value', max: 100 },
      series: [{ type: 'bar', data: [75, 82, 65, 90] }]
    })
  }
})

onUnmounted(() => chart?.dispose())
</script>

<style scoped>
.learning-analysis {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
}

.learning-analysis h1 {
  font-size: var(--font-size-xl);
  color: var(--gray-800);
  margin-bottom: var(--spacing-xl);
}

.chart-box {
  width: 100%;
  height: 400px;
}
</style>