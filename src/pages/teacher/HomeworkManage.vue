<template>
  <div class="homework-manage">
    <div class="manage-container">
      <!-- 左侧课程导航 -->
      <aside class="course-sidebar">
        <div class="sidebar-header">
          <h3>课程列表</h3>
          <el-input v-model="courseSearch" placeholder="搜索课程" size="small" clearable />
        </div>
        <div class="course-list">
          <div class="course-item" :class="{ active: selectedCourseId === '' }" @click="selectCourse('')">
            <el-icon><FolderOpened /></el-icon>
            <span>全部课程</span>
            <el-tag size="small" type="info">{{ allCourseCount }}</el-tag>
          </div>
          <div v-for="course in filteredCourses" :key="course.courseId" class="course-item"
            :class="{ active: selectedCourseId === course.courseId }" @click="selectCourse(course.courseId)">
            <el-icon><FolderOpened /></el-icon>
            <span class="course-name">{{ course.courseName }}</span>
            <el-tag size="small" type="info">{{ course.homeworkCount || 0 }}</el-tag>
          </div>
        </div>
      </aside>

      <!-- 右侧内容区 -->
      <section class="content-area">
        <div class="content-header">
          <h1>{{ selectedCourseName || '全部课程' }} - 作业管理</h1>
          <el-button type="primary" @click="openCreate">发布作业</el-button>
        </div>

        <!-- 标签页切换 -->
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="作业列表" name="list">
            <!-- 排序栏 -->
            <div class="sort-bar">
              <span class="sort-label">排序：</span>
              <el-radio-group v-model="sortOrder" size="small" @change="sortHomework">
                <el-radio-button value="deadline">按截止时间</el-radio-button>
                <el-radio-button value="createTime">按创建时间</el-radio-button>
                <el-radio-button value="title">按标题</el-radio-button>
              </el-radio-group>
            </div>

            <div class="homework-list">
              <div class="homework-card" v-for="hw in sortedHomeworks" :key="hw.id" @click="openReviewed(hw)">
                <div class="card-header">
                  <h3>{{ hw.title }}</h3>
                  <span class="status-tag" :class="hw.status">{{ getStatusLabel(hw.status) }}</span>
                </div>
                <p class="course-name">{{ hw.courseName }}</p>
                <div class="card-meta">
                  <span><el-icon><Clock /></el-icon> {{ formatDate(hw.deadline) }}</span>
                  <span><el-icon><Document /></el-icon> {{ hw.questionCount }}道题</span>
                  <span>
                    <el-icon><User /></el-icon> 提交 {{ hw.submittedCount || 0 }}/{{ hw.totalStudents || 0 }}
                  </span>
                  <span v-if="hw.pendingCount > 0" class="pending-badge">
                    待批改 {{ hw.pendingCount }}
                  </span>
                </div>
                <div class="card-actions">
                  <el-button type="primary" size="small" @click.stop="editHomework(hw)" v-if="hw.status === 'draft'">编辑</el-button>
                  <el-button size="small" @click.stop="publishHomework(hw)" v-if="hw.status === 'draft'">发布</el-button>
                  <el-button type="danger" size="small" @click.stop="remove(hw.id)">删除</el-button>
                </div>
              </div>
              <div v-if="sortedHomeworks.length === 0" class="empty-state">
                <p>暂无作业，请选择课程后发布</p>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="待批改" name="grade">
            <div class="grade-list">
              <el-table :data="submissions" empty-text="暂无待批改作业">
                <el-table-column label="学员" prop="studentName" />
                <el-table-column label="作业" prop="homeworkTitle" />
                <el-table-column label="课程" prop="courseName" />
                <el-table-column label="提交时间" prop="submitTime" />
                <el-table-column label="状态" prop="status">
                  <template #default="scope">
                    <el-tag type="warning" size="small">未批改</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作">
                  <template #default="scope">
                    <el-button type="warning" size="small" @click="grade(scope.row)">批改</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </section>
    </div>

    <!-- 发布/编辑作业弹窗 -->
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
        <el-form-item label="截止日期" required>
          <el-date-picker v-model="form.deadline" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择截止日期" />
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
            </el-table>
            <div class="selection-summary">已选 {{ form.exerciseIds.length }} 题</div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateForm = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存草稿</el-button>
        <el-button type="success" @click="submitAndPublish">保存并发布</el-button>
      </template>
    </el-dialog>

    <!-- 已批改作业查看弹窗 -->
    <el-dialog v-model="reviewedVisible" title="已批改作业查看" width="860px">
      <div class="review-toolbar">
        <el-input
          v-model="reviewStudentKeyword"
          placeholder="搜索学员姓名/学号"
          clearable
          @keyup.enter="loadReviewedSubmissions"
          @clear="loadReviewedSubmissions"
        />
        <el-button type="primary" @click="loadReviewedSubmissions">筛选</el-button>
        <span class="review-count">当前作业已批改 {{ reviewedSubmissions.length }} 份</span>
      </div>
      <div v-if="reviewedData" class="grade-content">
        <div class="grade-header">
          <span class="student-name">当前学员：{{ reviewedData.studentName }}</span>
          <span class="homework-title">作业：{{ reviewedData.homeworkTitle }}</span>
          <span class="total-score">得分：{{ formatScore(reviewedData.score) }}/{{ formatScore(reviewedData.totalScore) }}分</span>
        </div>
        <div class="answers-list">
          <div v-for="(answer, index) in reviewedData.answers" :key="answer.answerId" class="answer-item">
            <div class="answer-header">
              <span class="answer-number">{{ index + 1 }}.</span>
              <span class="answer-type">{{ getQuestionTypeName(answer.type) }}</span>
            </div>
            <div class="question-content">{{ answer.content }}</div>
            <div class="answer-content">
              <span class="label">学生答案：</span>
              <span class="value">{{ answer.answer || '未作答' }}</span>
            </div>
            <div v-if="answer.standardAnswer" class="standard-answer">
              <span class="label">标准答案：</span>
              <span class="value">{{ answer.standardAnswer }}</span>
            </div>            <div class="grade-input">
              <div class="grade-input-row">
                <span class="label">判定：</span>
                <template v-if="answer.correct !== null && answer.correct !== undefined">
                  <el-tag :type="answer.correct ? 'success' : 'danger'" size="small">{{ answer.correct ? '正确' : '错误' }}</el-tag>
                </template>
                <el-radio-group v-else v-model="answer.manualCorrect" size="small">
                  <el-radio-button :label="true">正确</el-radio-button>
                  <el-radio-button :label="false">错误</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无已批改提交" />
      <template #footer>
        <el-button @click="reviewedVisible = false">关闭</el-button>
        <el-button type="primary" :disabled="reviewedSubmissions.length <= 1" @click="nextReviewed">下一份</el-button>
      </template>
    </el-dialog>

    <!-- 批改弹窗 -->
    <el-dialog v-model="gradeVisible" title="批改作业" width="800px">
      <div v-if="gradeData" class="grade-content">
        <div class="grade-header">
          <span class="student-name">学员：{{ gradeData.studentName }}</span>
          <span class="homework-title">作业：{{ gradeData.homeworkTitle }}</span>
          <span class="total-score">总分：{{ formatScore(gradeData.totalScore) }}分</span>
        </div>
        <div class="answers-list">
          <div v-for="(answer, index) in gradeData.answers" :key="answer.answerId" class="answer-item">
            <div class="answer-header">
              <span class="answer-number">{{ index + 1 }}.</span>
              <span class="answer-type">{{ getQuestionTypeName(answer.type) }}</span>
            </div>
            <div class="question-content">{{ answer.content }}</div>
            <div class="answer-content">
              <span class="label">学生答案：</span>
              <span class="value">{{ answer.answer || '未作答' }}</span>
            </div>
            <div v-if="answer.standardAnswer" class="standard-answer">
              <span class="label">标准答案：</span>
              <span class="value">{{ answer.standardAnswer }}</span>
            </div>            <div class="grade-input">
              <div class="grade-input-row">
                <span class="label">判定：</span>
                <template v-if="answer.correct !== null && answer.correct !== undefined">
                  <el-tag :type="answer.correct ? 'success' : 'danger'" size="small">{{ answer.correct ? '正确' : '错误' }}</el-tag>
                </template>
                <el-radio-group v-else v-model="answer.manualCorrect" size="small">
                  <el-radio-button :label="true">正确</el-radio-button>
                  <el-radio-button :label="false">错误</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </div>
        </div>
        <div class="grade-summary">
          <span class="summary-label">整份作业得分：</span>
          <el-input-number v-model="manualScore" :min="0" :max="100" :step="1" :precision="0" />
          <span class="summary-value">{{ totalScore }} / 100</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="gradeVisible = false">取消</el-button>
        <el-button type="primary" @click="submitGrade">提交批改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createHomework, deleteHomework, getHomeworkList, getPendingSubmissions, getQuestionBank, getSubmissionDetail, gradeSubmission, updateHomework } from '../../api/homework.js'
import { getTeacherCourses } from '../../api/course.js'
import { formatDate } from '../../utils/date.js'

// 课程导航
const courses = ref([])
const selectedCourseId = ref('')
const courseSearch = ref('')
const allCourseCount = ref(0)

const filteredCourses = computed(() => {
  if (!courseSearch.value) return courses.value
  const keyword = courseSearch.value.toLowerCase()
  return courses.value.filter(c => c.courseName.toLowerCase().includes(keyword))
})

const selectedCourseName = computed(() => {
  if (!selectedCourseId.value) return ''
  return courses.value.find(c => c.courseId === selectedCourseId.value)?.courseName || ''
})

// 作业列表
const homeworks = ref([])
const sortOrder = ref('deadline')

const sortedHomeworks = computed(() => {
  const list = [...homeworks.value]
  if (sortOrder.value === 'deadline') {
    list.sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0))
  } else if (sortOrder.value === 'createTime') {
    list.sort((a, b) => new Date(b.createTime || 0) - new Date(a.createTime || 0))
  } else {
    list.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
  }
  return list
})

// 标签页
const activeTab = ref('list')

// 发布作业
const showCreateForm = ref(false)
const exercises = ref([])
const questionLoading = ref(false)
const questionCategory = ref('')
const filters = ref({ difficulty: '', type: '', keyword: '' })
const form = ref({
  courseId: '', title: '', deadline: '',
  exerciseIds: []
})

// 批改
const submissions = ref([])
const gradeVisible = ref(false)
const reviewedVisible = ref(false)
const gradeData = ref(null)
const overallComment = ref('')
const reviewedHomework = ref(null)
const reviewedSubmissions = ref([])
const reviewedData = ref(null)
const reviewedIndex = ref(0)
const reviewStudentKeyword = ref('')

const manualScore = ref(0)
const totalScore = computed(() => Math.round(Number(manualScore.value || 0)))

// 工具函数
function getStatusLabel(status) {
  return { draft: '草稿', published: '已发布', closed: '已结束' }[status] || status
}
function formatScore(value) {
  const n = Number(value ?? 0)
  return Math.round(Number.isFinite(n) ? n : 0)
}
function difficultyLabel(value) { return { easy: '简单', medium: '中等', hard: '困难' }[value] || value }
function difficultyType(value) { return { easy: 'success', medium: 'warning', hard: 'danger' }[value] || 'info' }
function typeLabel(value) { return { single: '单选', multiple: '多选', judge: '判断', blank: '填空', short: '简答' }[value] || value }
function isSubjective(type) { return !['single', 'multiple', 'judge', 'blank', 'fill'].includes(type) }
function getQuestionTypeName(type) {
  return { single: '单选题', multiple: '多选题', judge: '判断题', fill: '填空题', blank: '填空题', essay: '问答题', short: '简答题' }[type] || type
}

// 课程选择
function selectCourse(courseId) {
  selectedCourseId.value = courseId
  load()
  if (activeTab.value === 'grade') loadSubmissions()
}

// 加载数据
async function load() {
  const params = { page: 1, size: 100, role: 'teacher' }
  if (selectedCourseId.value) params.courseId = selectedCourseId.value
  const data = await getHomeworkList(params)
  homeworks.value = data.records || []
  if (activeTab.value === 'grade') {
    await loadSubmissions()
  }
}

async function loadCourses() {
  const data = await getTeacherCourses({ page: 1, size: 100, status: 'online' })
  courses.value = (data.courses || []).map(c => ({ ...c, homeworkCount: 0 }))
  allCourseCount.value = 0
  const counts = await Promise.all(
    courses.value.map(course =>
      getHomeworkList({ page: 1, size: 1, role: 'teacher', courseId: course.courseId })
        .then(hwData => ({ courseId: course.courseId, count: hwData.total || 0 }))
        .catch(() => ({ courseId: course.courseId, count: 0 }))
    )
  )
  for (const { courseId, count } of counts) {
    const course = courses.value.find(c => c.courseId === courseId)
    if (course) course.homeworkCount = count
    allCourseCount.value += count
  }
}

async function loadSubmissions() {
  const params = { page: 1, size: 100, status: 'pending' }
  if (selectedCourseId.value) params.courseId = selectedCourseId.value
  const data = await getPendingSubmissions(params)
  submissions.value = data.records || []
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

function handleTabChange(tab) {
  if (tab === 'grade') loadSubmissions()
}

function sortHomework() {
  // sortedHomeworks 是 computed，自动响应
}

// 发布作业
function openCreate() {
  form.value = { courseId: selectedCourseId.value || '', title: '', deadline: '', exerciseIds: [] }
  exercises.value = []
  questionCategory.value = ''
  filters.value = { difficulty: '', type: '', keyword: '' }
  showCreateForm.value = true
  if (form.value.courseId) loadExercises()
}

async function handleCourseChange() {
  form.value.exerciseIds = []
  filters.value = { difficulty: '', type: '', keyword: '' }
  await loadExercises()
}

function handleSelectionChange(rows) { form.value.exerciseIds = rows.map(item => item.id) }

async function remove(id) {
  await ElMessageBox.confirm('确定删除该作业吗？', '提示', { type: 'warning' })
  await deleteHomework(id)
  await load()
  ElMessage.success('删除成功')
}

function editHomework(hw) {
  form.value = {
    courseId: hw.courseId || '', title: hw.title,
    deadline: hw.deadline || '', exerciseIds: []
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

// 批改

async function grade(row) {
  gradeData.value = JSON.parse(JSON.stringify(await getSubmissionDetail(row.submissionId)))
  overallComment.value = ''
  manualScore.value = Math.round(Number(gradeData.value?.score || 0))
  gradeVisible.value = true
}

async function openReviewed(hw) {
  reviewedHomework.value = hw
  reviewStudentKeyword.value = ''
  reviewedIndex.value = 0
  reviewedVisible.value = true
  await loadReviewedSubmissions()
}

async function loadReviewedSubmissions() {
  if (!reviewedHomework.value) return
  const params = {
    page: 1,
    size: 100,
    status: 'graded',
    homeworkId: reviewedHomework.value.id
  }
  if (selectedCourseId.value) params.courseId = selectedCourseId.value
  if (reviewStudentKeyword.value.trim()) params.studentKeyword = reviewStudentKeyword.value.trim()
  const data = await getPendingSubmissions(params)
  reviewedSubmissions.value = data.records || []
  reviewedIndex.value = 0
  await loadReviewedCurrent()
}

async function loadReviewedCurrent() {
  const current = reviewedSubmissions.value[reviewedIndex.value]
  reviewedData.value = current ? await getSubmissionDetail(current.submissionId) : null
}

async function nextReviewed() {
  if (!reviewedSubmissions.value.length) return
  reviewedIndex.value = (reviewedIndex.value + 1) % reviewedSubmissions.value.length
  await loadReviewedCurrent()
}

async function submitGrade() {
  const score = Math.max(0, Math.min(100, Math.round(Number(manualScore.value || 0))))
  const correctness = {}
  gradeData.value.answers.forEach(a => { if (a.manualCorrect !== undefined) correctness[a.questionId] = a.manualCorrect })
  const missing = gradeData.value.answers.some(a => (a.correct === null || a.correct === undefined) && a.manualCorrect === undefined)
  if (missing) { ElMessage.warning('请为主观题选择正确或错误'); return }
  await gradeSubmission(gradeData.value.submissionId, { score, comment: '', correctness })
  ElMessage.success('批改完成')
  gradeVisible.value = false
  if (typeof loadSubmissions === 'function') await loadSubmissions()
  await load()
}

onMounted(() => {
  load()
  loadCourses()
})
</script>

<style scoped>
.homework-manage {
  background: white;
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.manage-container {
  display: flex;
  min-height: calc(100vh - 112px);
}

/* 左侧课程导航 */
.course-sidebar {
  width: 240px;
  border-right: 1px solid var(--gray-100);
  background: var(--gray-50);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--gray-100);
}

.sidebar-header h3 {
  font-size: var(--font-size-md);
  color: var(--gray-800);
  margin-bottom: var(--spacing-md);
}

.course-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm);
}

.course-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--gray-600);
  font-size: var(--font-size-sm);
}

.course-item:hover {
  background: var(--gray-100);
}

.course-item.active {
  background: rgba(59, 130, 246, 0.08);
  color: var(--primary-500);
}

.course-item .course-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 右侧内容区 */
.content-area {
  flex: 1;
  padding: var(--spacing-xl);
  overflow-y: auto;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.content-header h1 {
  font-size: var(--font-size-xl);
  color: var(--gray-800);
}

/* 排序栏 */
.sort-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.sort-label {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

/* 作业列表 */
.homework-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: var(--spacing-lg);
}

.homework-card {
  padding: var(--spacing-lg);
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-lg);
  transition: box-shadow var(--transition-fast);
  cursor: pointer;
}

.homework-card:hover {
  box-shadow: var(--shadow-md);
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

.status-tag.draft { background: rgba(249, 115, 22, 0.1); color: var(--accent-orange); }
.status-tag.published { background: rgba(34, 197, 94, 0.1); color: var(--green-500); }
.status-tag.closed { background: rgba(107, 114, 128, 0.1); color: var(--gray-500); }

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

.pending-badge {
  color: var(--accent-orange);
  font-weight: 500;
}

.card-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--gray-400);
}

/* 弹窗通用 */
.category-tag { margin-left: 12px; }
.fixed-score-tip { margin-left: 12px; color: var(--gray-500); font-size: var(--font-size-sm); }
.question-filters { display: grid; grid-template-columns: 120px 120px 1fr auto; gap: 10px; width: 100%; }
.question-picker { width: 100%; }
.selection-summary { margin-top: 10px; color: var(--gray-600); text-align: right; }

/* 详情/批改弹窗 */
.detail-content, .grade-content { padding: var(--spacing-lg); }
.detail-header, .grade-header {
  display: flex; flex-wrap: wrap; gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg); padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--gray-100);
}
.detail-header span, .grade-header span {
  font-size: var(--font-size-sm); color: var(--gray-600);
}
.student-name, .homework-title, .submit-time, .total-score {
  background: var(--gray-50); padding: 4px 12px; border-radius: var(--radius-md);
}
.answers-list { display: flex; flex-direction: column; gap: var(--spacing-lg); }
.answer-item {
  padding: var(--spacing-lg); background: var(--gray-50); border-radius: var(--radius-lg);
}
.answer-header {
  display: flex; align-items: center; gap: var(--spacing-md); margin-bottom: var(--spacing-md);
}
.answer-number { font-weight: 600; color: var(--primary-500); }
.answer-type {
  font-size: var(--font-size-xs); padding: 4px 12px;
  background: var(--primary-50); color: var(--primary-500); border-radius: var(--radius-full);
}
.answer-score { color: var(--gray-500); font-size: var(--font-size-sm); }
.question-content { font-size: var(--font-size-base); color: var(--gray-800); margin-bottom: var(--spacing-md); }
.answer-content, .standard-answer, .teacher-comment {
  display: flex; flex-wrap: wrap; gap: var(--spacing-sm); margin-bottom: var(--spacing-sm);
}
.answer-content .label, .standard-answer .label, .teacher-comment .label {
  font-weight: 500; color: var(--gray-600); font-size: var(--font-size-sm);
}
.answer-content .value, .standard-answer .value, .teacher-comment .value {
  color: var(--gray-800); font-size: var(--font-size-sm); word-break: break-word;
}
.standard-answer .value { color: var(--green-500); }
.grade-input {
  margin-top: var(--spacing-md); padding: var(--spacing-md);
  background: white; border-radius: var(--radius-md);
}
.grade-input-row {
  display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-sm);
}
.grade-input .label {
  font-weight: 500; color: var(--gray-600); font-size: var(--font-size-sm); margin-right: var(--spacing-sm);
}
.grade-summary {
  display: flex; align-items: center; justify-content: flex-end; gap: var(--spacing-md);
  margin-top: var(--spacing-lg); padding-top: var(--spacing-md); border-top: 1px solid var(--gray-100);
}
.summary-label { font-weight: 500; color: var(--gray-600); }
.summary-value { font-size: var(--font-size-xl); font-weight: 600; color: var(--primary-500); }
.grade-comment { margin-top: var(--spacing-md); }
.grade-comment .label {
  font-weight: 500; color: var(--gray-600); font-size: var(--font-size-sm); display: block; margin-bottom: var(--spacing-sm);
}
.review-toolbar {
  display: grid;
  grid-template-columns: minmax(220px, 320px) auto 1fr;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}
.review-count {
  color: var(--gray-500);
  font-size: var(--font-size-sm);
}
.review-comment {
  margin: 0;
  padding: var(--spacing-md);
  background: var(--gray-50);
  border-radius: var(--radius-md);
  color: var(--gray-700);
  line-height: 1.6;
}
</style>

