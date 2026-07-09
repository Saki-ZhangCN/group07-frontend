<template>
  <div class="learning-analysis" v-loading="loading">
    <header class="hero">
      <div>
        <p class="eyebrow">AI TEACHING ANALYTICS</p>
        <h1>学情分析</h1>
        <p>基于课程学习进度与作业数据，为教师生成可执行教学建议。</p>
      </div>
      <div class="toolbar">
        <el-select v-model="courseId" placeholder="选择课程" filterable size="small" @change="loadData">
          <el-option v-for="course in courses" :key="course.courseId" :label="course.courseName" :value="course.courseId" />
        </el-select>
        <el-button type="primary" size="small" :disabled="!courseId" :loading="aiLoading" @click="loadAi">AI 分析</el-button>
      </div>
    </header>

    <el-empty v-if="!courseId && !loading" description="请先选择一门已通过审核的课程" />

    <template v-else>
      <section class="dashboard-grid">
        <article class="metric-card">
          <span>在读学生</span>
          <strong>{{ data.studentCount || 0 }}</strong>
          <em>当前选课人数</em>
        </article>
        <article class="metric-card">
          <span>已发布作业</span>
          <strong>{{ data.homeworkCount || 0 }}</strong>
          <em>待批改 {{ data.pendingGradeCount || 0 }} 份</em>
        </article>
        <div class="mini-chart-card">
          <div ref="progressGauge" class="mini-chart"></div>
          <p>平均学习进度</p>
        </div>
        <div class="mini-chart-card">
          <div ref="homeworkGauge" class="mini-chart"></div>
          <p>作业完成率</p>
        </div>
        <div class="mini-chart-card">
          <div ref="scoreGauge" class="mini-chart"></div>
          <p>作业平均分</p>
        </div>
      </section>

      <section class="ai-panel">
        <div class="ai-title">
          <div class="spark">AI</div>
          <div>
            <h2>GLM-5.2 AI 班级诊断</h2>
            <p>结合学生进度、作业提交和成绩生成教学干预建议。</p>
          </div>
        </div>
        <el-skeleton v-if="aiLoading" :rows="5" animated />
        <div v-else-if="aiReport.content" class="ai-content" v-html="renderAi(aiReport.content)"></div>
        <el-empty v-else description="点击“生成 AI 分析”获取班级诊断" />
      </section>

      <section class="grid">
        <div class="panel">
          <div class="title">
            <div>
              <h2>学习进度分布</h2>
              <p>每位学生的视频/PDF 完成度</p>
            </div>
          </div>
          <div ref="progressChart" class="chart"></div>
        </div>
        <div class="panel">
          <div class="title">
            <div>
              <h2>作业成绩表现</h2>
              <p>已批改作业平均分</p>
            </div>
          </div>
          <div ref="scoreChart" class="chart"></div>
        </div>
      </section>

      <section class="grid lower-grid">
        <div class="panel">
          <div class="title">
            <div>
              <h2>学习时长排行</h2>
              <p>用于观察学生投入程度</p>
            </div>
          </div>
          <div ref="durationChart" class="chart"></div>
        </div>
        <div class="panel">
          <div class="title">
            <div>
              <h2>作业流转状态</h2>
              <p>提交、已批改与待批改数量</p>
            </div>
          </div>
          <div ref="homeworkStatusChart" class="chart"></div>
        </div>
      </section>

      <section class="panel risk-panel">
        <div class="title">
          <div>
            <h2>重点关注学生</h2>
            <p>系统根据学习进度、作业均分和作业提交情况自动筛选</p>
          </div>
        </div>
        <div v-if="riskStudents.length" class="risk-list">
          <article v-for="student in riskStudents" :key="student.studentId" class="risk-card">
            <div>
              <b>{{ student.studentName }}</b>
              <span>{{ riskReason(student) }}</span>
            </div>
            <el-tag :type="riskLevel(student).type">{{ riskLevel(student).label }}</el-tag>
          </article>
        </div>
        <el-empty v-else description="暂无明显风险学生" />
      </section>

      <section class="panel">
        <div class="title">
          <div>
            <h2>学生明细</h2>
            <p>用于定位需要提醒、补学或批改跟进的学生</p>
          </div>
        </div>
        <el-table :data="data.students || []" empty-text="暂无学生数据">
          <el-table-column prop="studentName" label="学生" min-width="120" />
          <el-table-column label="学习进度" min-width="180">
            <template #default="{ row }">
              <el-progress :percentage="Math.round(Number(row.progress || 0))" :stroke-width="8" :color="progressColor" />
              <small>{{ row.completedResources || 0 }}/{{ row.totalResources || 0 }} 资源</small>
            </template>
          </el-table-column>
          <el-table-column label="学习时长" width="120">
            <template #default="{ row }">{{ duration(row.studySeconds) }}</template>
          </el-table-column>
          <el-table-column label="提交作业" width="120">
            <template #default="{ row }">{{ row.submittedHomework || 0 }} 份</template>
          </el-table-column>
          <el-table-column label="已批改" width="110">
            <template #default="{ row }">{{ row.gradedHomework || 0 }} 份</template>
          </el-table-column>
          <el-table-column label="作业均分" width="120">
            <template #default="{ row }">
              <el-tag :type="Number(row.averageScore || 0) >= 60 ? 'success' : 'danger'">{{ number(row.averageScore) }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { getTeacherCourses } from '../../api/course.js'
import { getAiClassReport, getClassLearningData } from '../../api/analysis.js'

const route = useRoute()
const loading = ref(false)
const aiLoading = ref(false)
const courses = ref([])
const courseId = ref('')
const data = ref({})
const aiReport = ref({})
const progressGauge = ref()
const homeworkGauge = ref()
const scoreGauge = ref()
const progressChart = ref()
const scoreChart = ref()
const durationChart = ref()
const homeworkStatusChart = ref()
let charts = []

const number = value => Number(value || 0).toFixed(1)
const duration = seconds => Number(seconds || 0) >= 3600 ? `${(Number(seconds) / 3600).toFixed(1)}小时` : `${Math.round(Number(seconds || 0) / 60)}分钟`
const progressColor = value => value < 40 ? '#f56c6c' : value < 80 ? '#e6a23c' : '#22c55e'
const riskStudents = computed(() => {
  const homeworkCount = Number(data.value.homeworkCount || 0)
  return [...(data.value.students || [])]
    .filter(student => Number(student.progress || 0) < 50 || Number(student.averageScore || 0) < 60 || Number(student.submittedHomework || 0) < homeworkCount)
    .sort((a, b) => riskScore(b) - riskScore(a))
    .slice(0, 6)
})

async function loadCourses() {
  const response = await getTeacherCourses({ page: 1, size: 100, status: 'online' })
  courses.value = Array.isArray(response) ? response : (response.courses || response.records || [])
  const queryCourse = route.query.course
  if (queryCourse && courses.value.some(course => course.courseId === queryCourse)) {
    courseId.value = queryCourse
  } else if (!courseId.value && courses.value.length) {
    courseId.value = courses.value[0].courseId
  }
}

async function loadData() {
  if (!courseId.value) return
  loading.value = true
  aiReport.value = {}
  try {
    data.value = await getClassLearningData(courseId.value)
    await nextTick()
    initCharts()
  } catch (error) {
    ElMessage.error(error.message || '学情数据加载失败')
  } finally {
    loading.value = false
  }
}

async function loadAi() {
  if (!courseId.value) return
  aiLoading.value = true
  try {
    aiReport.value = await getAiClassReport(courseId.value)
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
  const students = data.value.students || []
  createGauge(progressGauge.value, '进度', Number(data.value.averageProgress || 0), '#6366f1')
  createGauge(homeworkGauge.value, '完成', Number(data.value.homeworkCompletionRate || 0), '#14b8a6')
  createGauge(scoreGauge.value, '均分', Number(data.value.averageHomeworkScore || 0), '#f59e0b')
  if (progressChart.value) {
    const chart = echarts.init(progressChart.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 20, top: 20, bottom: 60 },
      xAxis: { type: 'category', data: students.map(item => item.studentName), axisLabel: { rotate: 35 } },
      yAxis: { type: 'value', max: 100, name: '%' },
      series: [{ type: 'bar', data: students.map(item => Number(item.progress || 0)), itemStyle: { color: '#6366f1', borderRadius: [6, 6, 0, 0] } }]
    })
    charts.push(chart)
  }
  if (scoreChart.value) {
    const chart = echarts.init(scoreChart.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 20, top: 20, bottom: 60 },
      xAxis: { type: 'category', data: students.map(item => item.studentName), axisLabel: { rotate: 35 } },
      yAxis: { type: 'value', max: 100, name: '分' },
      series: [{ type: 'bar', data: students.map(item => Number(item.averageScore || 0)), itemStyle: { color: '#14b8a6', borderRadius: [6, 6, 0, 0] } }]
    })
    charts.push(chart)
  }
  if (durationChart.value) {
    const sorted = [...students].sort((a, b) => Number(b.studySeconds || 0) - Number(a.studySeconds || 0)).slice(0, 12)
    const chart = echarts.init(durationChart.value)
    chart.setOption({
      tooltip: { trigger: 'axis', formatter: params => `${params[0].name}<br/>学习时长：${duration(params[0].value * 60)}` },
      grid: { left: 90, right: 24, top: 16, bottom: 24 },
      xAxis: { type: 'value', name: '分钟' },
      yAxis: { type: 'category', data: sorted.map(item => item.studentName).reverse() },
      series: [{
        type: 'bar',
        data: sorted.map(item => Math.round(Number(item.studySeconds || 0) / 60)).reverse(),
        itemStyle: { color: '#8b5cf6', borderRadius: [0, 8, 8, 0] },
        label: { show: true, position: 'right', formatter: '{c} 分钟' }
      }]
    })
    charts.push(chart)
  }
  if (homeworkStatusChart.value) {
    const submitted = students.reduce((sum, item) => sum + Number(item.submittedHomework || 0), 0)
    const graded = students.reduce((sum, item) => sum + Number(item.gradedHomework || 0), 0)
    const expected = Number(data.value.homeworkCount || 0) * students.length
    const missing = Math.max(0, expected - submitted)
    const pending = Math.max(0, submitted - graded)
    const chart = echarts.init(homeworkStatusChart.value)
    chart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [{
        type: 'pie',
        radius: ['48%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        label: { formatter: '{b}\n{c}' },
        data: [
          { name: '已批改', value: graded, itemStyle: { color: '#22c55e' } },
          { name: '待批改', value: pending, itemStyle: { color: '#f59e0b' } },
          { name: '未提交', value: missing, itemStyle: { color: '#ef4444' } }
        ]
      }]
    })
    charts.push(chart)
  }
}

function createGauge(el, name, value, color) {
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
      detail: { valueAnimation: true, formatter: `{value}%`, fontSize: 22, fontWeight: 800, color: '#18212f', offsetCenter: [0, '8%'] },
      data: [{ value: Math.round(value), name }]
    }]
  })
  charts.push(chart)
}

function riskScore(student) {
  const homeworkCount = Number(data.value.homeworkCount || 0)
  let score = 0
  if (Number(student.progress || 0) < 50) score += 2
  if (Number(student.averageScore || 0) < 60) score += 2
  if (Number(student.submittedHomework || 0) < homeworkCount) score += 1
  return score
}

function riskLevel(student) {
  const score = riskScore(student)
  if (score >= 4) return { label: '高风险', type: 'danger' }
  if (score >= 2) return { label: '需关注', type: 'warning' }
  return { label: '轻提醒', type: 'info' }
}

function riskReason(student) {
  const reasons = []
  const homeworkCount = Number(data.value.homeworkCount || 0)
  if (Number(student.progress || 0) < 50) reasons.push(`进度 ${number(student.progress)}%`)
  if (Number(student.averageScore || 0) < 60) reasons.push(`均分 ${number(student.averageScore)}`)
  if (Number(student.submittedHomework || 0) < homeworkCount) reasons.push(`作业 ${student.submittedHomework || 0}/${homeworkCount}`)
  return reasons.join(' · ') || '暂无明显异常'
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

function sanitizeAi(content) {
  return String(content || '')
    .replace(/（AI 服务未配置完整，当前为系统规则分析。）/g, '')
    .replace(/（AI 返回为空，当前为系统规则分析。）/g, '')
    .replace(/（AI 服务暂时不可用，当前为系统规则分析。）/g, '')
    .trim()
}

const resize = () => charts.forEach(chart => chart.resize())

onMounted(async () => {
  loading.value = true
  try {
    await loadCourses()
    await loadData()
    await loadAi()
  } finally {
    loading.value = false
  }
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  clearCharts()
  window.removeEventListener('resize', resize)
})
</script>

<style scoped>
.learning-analysis { max-width: 1440px; margin: auto; color: #18212f; }
.hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
  padding: 22px 24px;
  border-radius: 22px;
  background: linear-gradient(135deg, #eef2ff, #f8fafc 48%, #ecfeff);
  border: 1px solid #e8edf7;
}
.hero h1 { font-size: 30px; margin: 4px 0; }
.hero p { margin: 0; color: #8491a5; }
.eyebrow { font-size: 12px; letter-spacing: 1.6px; color: #4f46e5; font-weight: 700; }
.toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: nowrap;
  justify-content: flex-end;
  padding-top: 2px;
}
.toolbar .el-select { width: 190px; }
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr repeat(3, 1.15fr);
  gap: 14px;
  margin-bottom: 18px;
}
.metric-card, .panel, .ai-panel, .mini-chart-card {
  background: rgba(255,255,255,.92);
  border: 1px solid #edf0f5;
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(31,41,55,.055);
}
.metric-card { padding: 20px; display: grid; gap: 8px; min-height: 126px; }
.metric-card span, .metric-card em, .title p, .ai-title p, small, .mini-chart-card p { color: #8491a5; font-style: normal; font-size: 13px; }
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
.risk-panel { background: linear-gradient(135deg, #fff, #fff7ed); }
.risk-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.risk-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(255,255,255,.78);
  border: 1px solid #f1e7dc;
}
.risk-card div { display: grid; gap: 5px; min-width: 0; }
.risk-card b { font-size: 15px; color: #1f2937; }
.risk-card span { color: #7c8798; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
@media(max-width:1180px){
  .dashboard-grid{grid-template-columns:repeat(2,1fr)}
  .grid,.lower-grid{grid-template-columns:1fr}
  .risk-list{grid-template-columns:repeat(2,1fr)}
}
@media(max-width:640px){
  .dashboard-grid,.risk-list{grid-template-columns:1fr}
  .hero{align-items:flex-start;flex-direction:column}
  .toolbar{justify-content:flex-start;flex-wrap:wrap}
  .toolbar .el-select{width:100%}
}
</style>
