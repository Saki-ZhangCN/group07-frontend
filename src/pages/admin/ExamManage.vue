<template>
  <div class="question-bank">
    <div class="page-header">
      <div>
        <h1>题库管理</h1>
        <p>集中查看平台题库内容，支持按课程、题型、难度和关键词筛选。</p>
      </div>
      <el-button :loading="loading" @click="load">刷新</el-button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-label">当前筛选题数</span>
        <strong>{{ pagination.total }}</strong>
      </div>
      <div class="stat-card">
        <span class="stat-label">本页题目</span>
        <strong>{{ questions.length }}</strong>
      </div>
      <div class="stat-card">
        <span class="stat-label">课程数量</span>
        <strong>{{ courses.length }}</strong>
      </div>
    </div>

    <el-card shadow="never" class="filter-card">
      <el-form :model="filters" inline>
        <el-form-item label="课程">
          <el-select v-model="filters.courseId" clearable filterable placeholder="全部课程" class="filter-select">
            <el-option
              v-for="course in courses"
              :key="course.courseId"
              :label="course.courseName"
              :value="course.courseId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="题型">
          <el-select v-model="filters.type" clearable placeholder="全部题型" class="small-select">
            <el-option label="单选题" value="single" />
            <el-option label="多选题" value="multiple" />
            <el-option label="判断题" value="judge" />
            <el-option label="填空题" value="blank" />
            <el-option label="简答题" value="short" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度">
          <el-select v-model="filters.difficulty" clearable placeholder="全部难度" class="small-select">
            <el-option label="简单" value="easy" />
            <el-option label="中等" value="medium" />
            <el-option label="困难" value="hard" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" clearable placeholder="题干 / 知识点 / 课程名" class="keyword-input" @keyup.enter="search" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-table :data="questions" v-loading="loading" class="question-table" row-key="id">
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="question-detail">
            <div class="detail-block">
              <h4>题目内容</h4>
              <p>{{ row.content || '-' }}</p>
            </div>
            <div v-if="row.options?.length" class="detail-block">
              <h4>选项</h4>
              <div class="option-list">
                <div v-for="option in row.options" :key="option.key || option.optionKey" class="option-item" :class="{ correct: option.isCorrect || option.correct }">
                  <span class="option-key">{{ option.key || option.optionKey }}</span>
                  <span>{{ option.content || option.optionContent }}</span>
                  <el-tag v-if="option.isCorrect || option.correct" size="small" type="success">正确答案</el-tag>
                </div>
              </div>
            </div>
            <div class="detail-grid">
              <div>
                <span class="meta-label">标准答案</span>
                <p>{{ row.answer || '-' }}</p>
              </div>
              <div>
                <span class="meta-label">解析</span>
                <p>{{ row.analysis || '暂无解析' }}</p>
              </div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="题目" min-width="360">
        <template #default="{ row }">
          <div class="question-title">{{ row.content }}</div>
          <div class="question-sub">
            <span>{{ row.courseName }}</span>
            <span v-if="row.knowledge">知识点：{{ row.knowledge }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="题型" width="110">
        <template #default="{ row }">
          <el-tag>{{ typeLabel(row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="难度" width="110">
        <template #default="{ row }">
          <el-tag :type="difficultyTag(row.difficulty)">{{ difficultyLabel(row.difficulty) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="optionCount" label="选项数" width="90" align="center" />
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button type="danger" size="small" plain @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-bar">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="load"
        @current-change="load"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteQuestion, getQuestionBank } from '../../api/admin.js'
import { getCourseList } from '../../api/course.js'

const loading = ref(false)
const questions = ref([])
const courses = ref([])
const filters = reactive({
  courseId: '',
  type: '',
  difficulty: '',
  keyword: ''
})
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

function typeLabel(type) {
  return {
    single: '单选题',
    multiple: '多选题',
    judge: '判断题',
    blank: '填空题',
    fill: '填空题',
    short: '简答题',
    essay: '问答题'
  }[type] || type || '-'
}

function difficultyLabel(difficulty) {
  return { easy: '简单', medium: '中等', hard: '困难' }[difficulty] || difficulty || '-'
}

function difficultyTag(difficulty) {
  return { easy: 'success', medium: 'warning', hard: 'danger' }[difficulty] || 'info'
}

async function loadCourses() {
  const data = await getCourseList({ page: 1, size: 200 })
  courses.value = data.courses || data.records || []
}

async function load() {
  loading.value = true
  try {
    const data = await getQuestionBank({
      page: pagination.page,
      size: pagination.size,
      courseId: filters.courseId || undefined,
      type: filters.type || undefined,
      difficulty: filters.difficulty || undefined,
      keyword: filters.keyword || undefined
    })
    questions.value = data.records || []
    pagination.total = data.total || 0
  } finally {
    loading.value = false
  }
}

function search() {
  pagination.page = 1
  load()
}

function reset() {
  filters.courseId = ''
  filters.type = ''
  filters.difficulty = ''
  filters.keyword = ''
  search()
}

async function remove(row) {
  await ElMessageBox.confirm(`确定删除这道题吗？删除后不会再出现在题库中。`, '删除确认', { type: 'warning' })
  await deleteQuestion(row.id)
  ElMessage.success('题目已删除')
  await load()
}

onMounted(async () => {
  await loadCourses()
  await load()
})
</script>

<style scoped>
.question-bank {
  padding: var(--spacing-xl);
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.page-header h1 {
  margin: 0 0 6px;
  color: var(--gray-900);
}

.page-header p {
  margin: 0;
  color: var(--gray-500);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.stat-card {
  background: #fff;
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.stat-label {
  display: block;
  color: var(--gray-500);
  font-size: var(--font-size-sm);
  margin-bottom: 8px;
}

.stat-card strong {
  font-size: 28px;
  color: var(--gray-900);
}

.filter-card {
  margin-bottom: var(--spacing-lg);
  border-radius: var(--radius-lg);
}

.filter-select {
  width: 220px;
}

.small-select {
  width: 130px;
}

.keyword-input {
  width: 260px;
}

.question-table {
  width: 100%;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.question-title {
  color: var(--gray-900);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.question-sub {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-top: 6px;
  color: var(--gray-500);
  font-size: var(--font-size-sm);
}

.question-detail {
  padding: var(--spacing-lg) var(--spacing-xl);
  background: var(--gray-50);
}

.detail-block {
  margin-bottom: var(--spacing-lg);
}

.detail-block h4 {
  margin: 0 0 8px;
  color: var(--gray-800);
}

.detail-block p,
.detail-grid p {
  margin: 0;
  line-height: 1.8;
  color: var(--gray-700);
  white-space: pre-wrap;
}

.option-list {
  display: grid;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-md);
  background: #fff;
}

.option-item.correct {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.08);
}

.option-key {
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--primary-50);
  color: var(--primary-600);
  font-weight: 700;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--spacing-lg);
}

.meta-label {
  display: block;
  color: var(--gray-500);
  font-size: var(--font-size-sm);
  margin-bottom: 6px;
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
}

@media (max-width: 900px) {
  .stats-grid,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .filter-select,
  .small-select,
  .keyword-input {
    width: 100%;
  }
}
</style>
