<template>
  <div class="report" v-loading="loading">
    <header class="hero">
      <div>
        <p class="eyebrow">AI LEARNING ANALYTICS</p>
        <h1>AI 学情分析</h1>
        <p>基于课程资源完成度、学习时长和作业表现生成个性化学习建议。</p>
      </div>
      <div class="toolbar">
        <el-select v-model="selectedCourseId" placeholder="全部课程" clearable filterable size="small" @change="reloadAi">
          <el-option v-for="course in data.courseProgress || []" :key="course.courseId" :label="course.courseName" :value="course.courseId" />
        </el-select>
        <el-button size="small" @click="load">刷新</el-button>
        <el-button type="primary" size="small" :loading="aiLoading" @click="loadAi">AI 分析</el-button>
      </div>
    </header>

    <section class="dashboard-grid">
      <article class="metric-card">
        <span>学习时长</span>
        <strong>{{ hours }}<small> 小时</small></strong>
        <em>累计视频与 PDF 学习</em>
      </article>
      <article class="metric-card">
        <span>已选课程</span>
        <strong>{{ data.enrolledCourses || 0 }}</strong>
        <em>已完成 {{ data.completedCourses || 0 }} 门</em>
      </article>
      <div class="mini-chart-card"><div ref="progressGauge" class="mini-chart"></div><p>平均课程进度</p></div>
      <div class="mini-chart-card"><div ref="scoreGauge" class="mini-chart"></div><p>作业平均分</p></div>
      <div class="mini-chart-card"><div ref="accuracyGauge" class="mini-chart"></div><p>作业正确率</p></div>
    </section>

    <section class="ai-panel">
      <div class="ai-title">
        <div class="spark">AI</div>
        <div>
          <h2>GLM-5.2 AI 学习诊断</h2>
          <p>{{ selectedCourseName ? `当前聚焦：${selectedCourseName}` : '当前分析范围：全部已选课程' }}</p>
        </div>
      </div>
      <el-skeleton v-if="aiLoading" :rows="6" animated />
      <div v-else-if="aiReport.content" class="ai-content" v-html="renderAi(aiReport.content)"></div>
      <el-empty v-else description="点击 AI 分析获取建议" />
    </section>

    <section class="grid">
      <div class="panel">
        <div class="title"><div><h2>课程进度对比</h2><p>各课程视频/PDF资源完成度</p></div></div>
        <div ref="courseProgressChart" class="chart"></div>
      </div>
      <div class="panel">
        <div class="title"><div><h2>课程学习时长</h2><p>观察学习投入分布</p></div></div>
        <div ref="courseDurationChart" class="chart"></div>
      </div>
    </section>

    <section class="grid lower-grid">
      <div class="panel">
        <div class="title"><div><h2>近 30 日学习趋势</h2><p>每日学习分钟数</p></div></div>
        <div ref="studyChart" class="chart"></div>
        <el-empty v-if="!data.studyTrend?.dates?.length" description="暂无学习时长数据" />
      </div>
      <div class="panel">
        <div class="title"><div><h2>作业正确率趋势</h2><p>当前平台仅以作业作为考核方式</p></div></div>
        <div ref="accuracyChart" class="chart"></div>
      </div>
    </section>

    <section class="panel">
      <div class="title"><div><h2>作业成绩明细</h2><p>用于复盘不同课程作业表现</p></div></div>
      <el-table :data="filteredScoreHistory" empty-text="暂无作业成绩记录">
        <el-table-column prop="name" label="作业" min-width="160" />
        <el-table-column prop="courseName" label="课程" min-width="120" />
        <el-table-column label="成绩" width="120">
          <template #default="{ row }"><el-tag :type="Number(row.score || 0) >= 60 ? 'success' : 'danger'">{{ row.score }} / {{ row.totalScore }}</el-tag></template>
        </el-table-column>
        <el-table-column label="类型" width="90"><template #default>作业</template></el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { getAiStudentReport, getLearningReport } from '../../api/analysis.js'

const loading = ref(false)
const aiLoading = ref(false)
const data = ref({})
const aiReport = ref({})
const selectedCourseId = ref('')
const progressGauge = ref()
const scoreGauge = ref()
const accuracyGauge = ref()
const courseProgressChart = ref()
const courseDurationChart = ref()
const studyChart = ref()
const accuracyChart = ref()
let charts = []

const hours = computed(() => (Number(data.value.totalStudyTime || 0) / 3600).toFixed(1))
const averageProgress = computed(() => {
  const courses = data.value.courseProgress || []
  if (!courses.length) return 0
  return courses.reduce((sum, item) => sum + Number(item.progress || 0), 0) / courses.length
})
const selectedCourseName = computed(() => (data.value.courseProgress || []).find(item => item.courseId === selectedCourseId.value)?.courseName || '')
const filteredScoreHistory = computed(() => {
  if (!selectedCourseName.value) return data.value.scoreHistory || []
  return (data.value.scoreHistory || []).filter(item => item.courseName === selectedCourseName.value)
})

const number = value => Number(value || 0).toFixed(1)

async function load() {
  loading.value = true
  try {
    data.value = await getLearningReport()
    await nextTick()
    initCharts()
  } finally {
    loading.value = false
  }
}

async function reloadAi() {
  await nextTick()
  initCharts()
  await loadAi()
}

async function loadAi() {
  aiLoading.value = true
  try {
    aiReport.value = await getAiStudentReport({ courseId: selectedCourseId.value || undefined })
  } catch (error) {
    ElMessage.error(error.message || 'AI 分析生成失败')
  } finally {
    aiLoading.value = false
  }
}

function clearCharts() {
  charts.forEach(chart => chart.dispose())
  charts = []
}

function initCharts() {
  clearCharts()
  createGauge(progressGauge.value, averageProgress.value, '#6366f1')
  createGauge(scoreGauge.value, Number(data.value.averageScore || 0), '#f59e0b')
  createGauge(accuracyGauge.value, Number(data.value.homeworkAccuracy || 0), '#14b8a6')
  initCourseProgressChart()
  initCourseDurationChart()
  initStudyTrendChart()
  initAccuracyChart()
}

function initCourseProgressChart() {
  if (!courseProgressChart.value) return
  const courses = data.value.courseProgress || []
  const chart = echarts.init(courseProgressChart.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 45, right: 20, top: 20, bottom: 70 },
    xAxis: { type: 'category', data: courses.map(item => item.courseName), axisLabel: { rotate: 30 } },
    yAxis: { type: 'value', max: 100, name: '%' },
    series: [{ type: 'bar', data: courses.map(item => Math.round(Number(item.progress || 0))), itemStyle: { color: '#6366f1', borderRadius: [8, 8, 0, 0] } }]
  })
  charts.push(chart)
}

function initCourseDurationChart() {
  if (!courseDurationChart.value) return
  const courses = [...(data.value.courseProgress || [])].sort((a, b) => Number(b.studySeconds || 0) - Number(a.studySeconds || 0))
  const chart = echarts.init(courseDurationChart.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 100, right: 24, top: 16, bottom: 24 },
    xAxis: { type: 'value', name: '分钟' },
    yAxis: { type: 'category', data: courses.map(item => item.courseName).reverse() },
    series: [{ type: 'bar', data: courses.map(item => Math.round(Number(item.studySeconds || 0) / 60)).reverse(), itemStyle: { color: '#8b5cf6', borderRadius: [0, 8, 8, 0] }, label: { show: true, position: 'right' } }]
  })
  charts.push(chart)
}

function initStudyTrendChart() {
  if (!studyChart.value) return
  const trend = data.value.studyTrend || {}
  const chart = echarts.init(studyChart.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 45, right: 20, top: 25, bottom: 30 },
    xAxis: { type: 'category', data: trend.dates || [] },
    yAxis: { type: 'value', name: '分钟' },
    series: [{ type: 'line', smooth: true, data: trend.values || [], areaStyle: { color: 'rgba(79,70,229,.12)' }, lineStyle: { color: '#4f46e5', width: 3 }, itemStyle: { color: '#4f46e5' } }]
  })
  charts.push(chart)
}

function initAccuracyChart() {
  if (!accuracyChart.value) return
  const trend = data.value.accuracyTrend || {}
  const chart = echarts.init(accuracyChart.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 45, right: 20, top: 25, bottom: 30 },
    xAxis: { type: 'category', data: trend.dates || [] },
    yAxis: { type: 'value', min: 0, max: 100, name: '正确率%' },
    series: [{ type: 'bar', data: trend.values || [], itemStyle: { color: '#14b8a6', borderRadius: [6, 6, 0, 0] } }]
  })
  charts.push(chart)
}

function createGauge(el, value, color) {
  if (!el) return
  const chart = echarts.init(el)
  chart.setOption({
    series: [{
      type: 'gauge',
      min: 0,
      max: 100,
      radius: '92%',
      startAngle: 210,
      endAngle: -30,
      progress: { show: true, width: 12, itemStyle: { color } },
      axisLine: { lineStyle: { width: 12, color: [[1, '#eef2f7']] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      pointer: { show: false },
      title: { show: false },
      detail: { valueAnimation: true, formatter: '{value}%', fontSize: 22, fontWeight: 800, color: '#18212f', offsetCenter: [0, '8%'] },
      data: [{ value: Math.round(value || 0) }]
    }]
  })
  charts.push(chart)
}

function sanitizeAi(content) {
  return String(content || '')
    .replace(/（AI 服务未配置完整，当前为系统规则分析。）/g, '')
    .replace(/（AI 返回为空，当前为系统规则分析。）/g, '')
    .replace(/（AI 服务暂时不可用，当前为系统规则分析。）/g, '')
    .trim()
}

function renderAi(content) {
  return sanitizeAi(content)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^- (.*)$/gm, '<li>$1</li>')
    .replace(/\n/g, '<br/>')
    .replace(/(<li>.*?<\/li>)(<br\/>)?/g, '$1')
}

const resize = () => charts.forEach(chart => chart.resize())

onMounted(async () => {
  await load()
  await loadAi()
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  clearCharts()
  window.removeEventListener('resize', resize)
})
</script>

<style scoped>
.report { max-width: 1440px; margin: auto; color: #18212f; }
.hero { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 20px; padding: 22px 24px; border-radius: 22px; background: linear-gradient(135deg, #eef2ff, #f8fafc 48%, #ecfeff); border: 1px solid #e8edf7; }
.hero h1 { font-size: 30px; margin: 4px 0; }
.hero p { margin: 0; color: #8491a5; }
.toolbar { display: flex; gap: 8px; align-items: center; justify-content: flex-end; flex-wrap: nowrap; }
.toolbar .el-select { width: 190px; }
.eyebrow { font-size: 12px!important; letter-spacing: 1.6px; color: #4f46e5!important; font-weight: 700; }
.dashboard-grid { display: grid; grid-template-columns: 1fr 1fr repeat(3, 1.15fr); gap: 14px; margin-bottom: 18px; }
.metric-card, .panel, .ai-panel, .mini-chart-card { background: rgba(255,255,255,.92); border: 1px solid #edf0f5; border-radius: 18px; box-shadow: 0 10px 30px rgba(31,41,55,.055); }
.metric-card { padding: 20px; display: grid; gap: 8px; min-height: 126px; }
.metric-card span, .metric-card em, .title p, .ai-title p, .mini-chart-card p { color: #8491a5; font-style: normal; font-size: 13px; }
.metric-card strong { font-size: 34px; line-height: 1; }
.metric-card small { font-size: 14px; font-weight: 500; }
.mini-chart-card { padding: 12px 12px 10px; text-align: center; min-height: 126px; }
.mini-chart { height: 104px; }
.mini-chart-card p { margin: -8px 0 0; }
.ai-panel { padding: 22px; margin-bottom: 18px; background: linear-gradient(135deg, #ffffff, #f7f7ff); }
.ai-title { display: flex; gap: 14px; align-items: center; margin-bottom: 16px; }
.ai-title h2 { margin: 0 0 5px; font-size: 19px; }
.spark { width: 42px; height: 42px; border-radius: 14px; display: grid; place-items: center; color: #fff; font-weight: 800; background: linear-gradient(135deg, #6366f1, #14b8a6); }
.ai-content { line-height: 1.8; color: #344256; }
.ai-content :deep(h3) { margin: 14px 0 6px; color: #1f2a44; font-size: 16px; }
.ai-content :deep(li) { margin-left: 18px; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.lower-grid { grid-template-columns: 1.08fr .92fr; }
.panel { padding: 22px; margin-bottom: 18px; }
.title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.title h2 { margin: 0 0 5px; font-size: 19px; }
.chart { height: 340px; }
@media(max-width:1180px){ .dashboard-grid{grid-template-columns:repeat(2,1fr)} .grid,.lower-grid{grid-template-columns:1fr} }
@media(max-width:640px){ .dashboard-grid{grid-template-columns:1fr} .hero{align-items:flex-start;flex-direction:column} .toolbar{justify-content:flex-start;flex-wrap:wrap}.toolbar .el-select{width:100%} }
</style>
