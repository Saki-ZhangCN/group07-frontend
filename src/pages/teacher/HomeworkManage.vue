<template>
  <div class="homework-manage">
    <div class="manage-header">
      <h1>作业管理</h1>
      <el-button type="primary" @click="openCreate">发布作业</el-button>
    </div>
    
    <div class="homework-list">
      <div class="homework-card" v-for="hw in homeworks" :key="hw.id">
        <div class="card-header">
          <h3>{{ hw.title }}</h3>
          <span class="status-tag" :class="hw.status">{{ getStatusLabel(hw.status) }}</span>
        </div>
        <p class="course-name">{{ hw.course }}</p>
        <div class="card-meta">
          <span><el-icon><Clock /></el-icon> {{ formatDate(hw.deadline) }}</span>
          <span><el-icon><Document /></el-icon> {{ hw.questionCount }}道题</span>
          <span><el-icon><Score /></el-icon> {{ hw.totalScore }}分</span>
        </div>
        <div class="card-actions">
          <el-button type="primary" size="small" @click="editHomework(hw)" v-if="hw.status === 'draft'">编辑</el-button>
          <el-button size="small" @click="publishHomework(hw)" v-if="hw.status === 'draft'">发布</el-button>
          <el-button type="danger" size="small" @click="remove(hw.id)">删除</el-button>
        </div>
      </div>
    </div>
    
    <el-dialog v-model="showCreateForm" title="从分类题库组卷并发布" width="900px" destroy-on-close>
      <el-form :model="form" label-width="100px">
        <el-form-item label="课程" required>
          <el-select v-model="form.courseId" placeholder="请选择本人任教课程" filterable @change="handleCourseChange">
            <el-option v-for="course in courses" :key="course.courseId" :label="`${course.courseName}（${course.category}）`" :value="course.courseId" />
          </el-select>
          <el-tag v-if="questionCategory" class="category-tag">题库分类：{{ questionCategory }}</el-tag>
        </el-form-item>
        <el-form-item label="作业标题" required>
          <el-input v-model="form.title" placeholder="请输入作业标题" />
        </el-form-item>
        <el-form-item label="作业描述">
          <el-textarea v-model="form.description" :rows="3" placeholder="请输入作业描述" />
        </el-form-item>
        <el-form-item label="截止日期" required>
          <el-date-picker v-model="form.deadline" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择截止日期" />
        </el-form-item>
        <el-form-item label="总分">
          <el-input-number v-model="form.totalScore" :min="1" :max="1000" />
        </el-form-item>
        <el-form-item label="及格分">
          <el-input-number v-model="form.passScore" :min="0" :max="1000" />
        </el-form-item>
        <el-form-item label="筛选习题" v-if="form.courseId">
          <div class="question-filters">
            <el-select v-model="filters.difficulty" clearable placeholder="难度" @change="loadExercises">
              <el-option label="简单" value="easy" /><el-option label="中等" value="medium" /><el-option label="困难" value="hard" />
            </el-select>
            <el-select v-model="filters.type" clearable placeholder="题型" @change="loadExercises">
              <el-option label="单选题" value="single" /><el-option label="多选题" value="multiple" /><el-option label="判断题" value="judge" /><el-option label="填空题" value="blank" /><el-option label="简答题" value="short" />
            </el-select>
            <el-input v-model="filters.keyword" clearable placeholder="题目/知识点" @keyup.enter="loadExercises" />
            <el-button @click="loadExercises">查询</el-button>
          </div>
        </el-form-item>
        <el-form-item label="选择题目" v-if="form.courseId">
          <div class="question-picker">
            <el-table :data="exercises" v-loading="questionLoading" @selection-change="handleSelectionChange" max-height="320">
              <el-table-column type="selection" width="45" />
              <el-table-column prop="content" label="题目" min-width="300" show-overflow-tooltip />
              <el-table-column prop="knowledgePoint" label="知识点" width="110" />
              <el-table-column label="题型" width="85"><template #default="scope">{{ typeLabel(scope.row.type) }}</template></el-table-column>
              <el-table-column label="难度" width="80"><template #default="scope"><el-tag :type="difficultyType(scope.row.difficulty)" size="small">{{ difficultyLabel(scope.row.difficulty) }}</el-tag></template></el-table-column>
              <el-table-column prop="score" label="分值" width="65" />
            </el-table>
            <div class="selection-summary">已选 {{ form.exerciseIds.length }} 题，题库原始总分 {{ selectedScore }} 分</div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateForm = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存草稿</el-button>
        <el-button type="success" @click="submitAndPublish">保存并发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createHomework, deleteHomework, getHomeworkList, getHomeworkStats, getQuestionBank, updateHomework } from '../../api/homework.js'
import { getTeacherCourses } from '../../api/course.js'
import { formatDate } from '../../utils/date.js'

const homeworks = ref([])
const courses = ref([])
const exercises = ref([])
const showCreateForm = ref(false)
const statsMap = ref({})
const questionLoading = ref(false)
const questionCategory = ref('')
const filters = ref({ difficulty: '', type: '', keyword: '' })

const form = ref({
  courseId: '',
  title: '',
  description: '',
  deadline: '',
  totalScore: 100,
  passScore: 60,
  exerciseIds: []
})
const selectedScore = computed(() => exercises.value.filter(item => form.value.exerciseIds.includes(item.id)).reduce((sum, item) => sum + Number(item.score || 0), 0))

function getStatusLabel(status) {
  const labels = {
    'draft': '草稿',
    'published': '已发布',
    'closed': '已结束'
  }
  return labels[status] || status
}

async function load() {
  const data = await getHomeworkList({ page: 1, size: 100, role: 'teacher' })
  homeworks.value = data.records || []
  await loadStats()
}

async function loadStats() {
  statsMap.value = {}
  for (const hw of homeworks.value) {
    try {
      const stats = await getHomeworkStats(hw.id)
      statsMap.value[hw.id] = stats
    } catch (e) {
      statsMap.value[hw.id] = null
    }
  }
}

async function loadCourses() {
  const data = await getTeacherCourses()
  courses.value = data.courses || []
}

async function loadExercises() {
  if (!form.value.courseId) return
  questionLoading.value = true
  try {
    const data = await getQuestionBank({ courseId: form.value.courseId, ...filters.value, page: 1, size: 100 })
    exercises.value = data.records || []
    questionCategory.value = data.course?.category || ''
  } finally { questionLoading.value = false }
}

function openCreate() {
  form.value = { courseId: '', title: '', description: '', deadline: '', totalScore: 100, passScore: 60, exerciseIds: [] }
  exercises.value = []
  questionCategory.value = ''
  filters.value = { difficulty: '', type: '', keyword: '' }
  showCreateForm.value = true
}

async function handleCourseChange() {
  form.value.exerciseIds = []
  filters.value = { difficulty: '', type: '', keyword: '' }
  await loadExercises()
}

function handleSelectionChange(rows) { form.value.exerciseIds = rows.map(item => item.id) }
function difficultyLabel(value) { return ({ easy: '简单', medium: '中等', hard: '困难' })[value] || value }
function difficultyType(value) { return ({ easy: 'success', medium: 'warning', hard: 'danger' })[value] || 'info' }
function typeLabel(value) { return ({ single: '单选', multiple: '多选', judge: '判断', blank: '填空', short: '简答' })[value] || value }

async function remove(id) {
  await ElMessageBox.confirm('确定删除该作业吗？', '提示', { type: 'warning' })
  await deleteHomework(id)
  await load()
  ElMessage.success('删除成功')
}

function editHomework(hw) {
  form.value = {
    courseId: hw.courseId || '',
    title: hw.title,
    description: hw.description || '',
    deadline: hw.deadline || '',
    totalScore: hw.totalScore || 100,
    passScore: hw.passScore || 60,
    exerciseIds: []
  }
  loadExercises()
  showCreateForm.value = true
}

async function submitForm() {
  if (!validateForm()) return
  await createHomework({ ...form.value, status: 'draft' })
  showCreateForm.value = false
  await load()
  ElMessage.success('保存草稿成功')
}

async function submitAndPublish() {
  if (!validateForm()) return
  await ElMessageBox.confirm(`确认向《${courses.value.find(c => c.courseId === form.value.courseId)?.courseName}》的选课学生发布 ${form.value.exerciseIds.length} 道题吗？`, '发布确认', { type: 'warning' })
  await createHomework({ ...form.value, status: 'published' })
  showCreateForm.value = false
  await load()
  ElMessage.success('作业发布成功')
}

function validateForm() {
  if (!form.value.courseId) { ElMessage.warning('请选择课程'); return false }
  if (!form.value.title.trim()) { ElMessage.warning('请输入作业标题'); return false }
  if (!form.value.deadline) { ElMessage.warning('请选择截止时间'); return false }
  if (!form.value.exerciseIds.length) { ElMessage.warning('请至少选择一道题'); return false }
  return true
}

async function publishHomework(hw) {
  await updateHomework(hw.id, { status: 'published' })
  await load()
  ElMessage.success('作业发布成功')
}

onMounted(() => {
  load()
  loadCourses()
})
</script>

<style scoped>
.homework-manage {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
}

.manage-header { 
  display:flex; 
  align-items:center; 
  justify-content:space-between; 
  margin-bottom: var(--spacing-xl);
}

.homework-manage h1 {
  font-size: var(--font-size-xl);
  color: var(--gray-800);
}

.homework-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-lg);
}

.homework-card {
  padding: var(--spacing-lg);
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-lg);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.card-header h3 {
  font-size: var(--font-size-lg);
  color: var(--gray-800);
}

.status-tag {
  font-size: var(--font-size-xs);
  padding: 4px 12px;
  border-radius: var(--radius-full);
}

.status-tag.draft {
  background: rgba(249, 115, 22, 0.1);
  color: var(--accent-orange);
}

.status-tag.published {
  background: rgba(34, 197, 94, 0.1);
  color: var(--green-500);
}

.status-tag.closed {
  background: rgba(107, 114, 128, 0.1);
  color: var(--gray-500);
}

.course-name {
  color: var(--gray-500);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-md);
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--gray-500);
  margin-bottom: var(--spacing-lg);
}

.card-actions {
  display: flex;
  gap: var(--spacing-sm);
}
.category-tag { margin-left: 12px; }
.question-filters { display:grid; grid-template-columns:120px 120px 1fr auto; gap:10px; width:100%; }
.question-picker { width:100%; }
.selection-summary { margin-top:10px; color:var(--gray-600); text-align:right; }
</style>
