<template>
  <section class="manager">
    <div class="intro">
      <div>
        <h2>课程章节</h2>
        <p>先创建章节，再在章节内创建小节，最后为小节上传视频或PDF。</p>
      </div>
      <div class="intro-actions">
        <el-button size="small" @click="autoSortAll">🔄 自动排序</el-button>
        <el-button type="primary" @click="addSection">＋ 创建章节</el-button>
      </div>
    </div>
    
    <el-steps :active="2" simple>
      <el-step title="创建章节" />
      <el-step title="添加小节" />
      <el-step title="上传教学内容" />
    </el-steps>
    
    <el-empty v-if="!sections.length" description="暂无章节，请点击右上角创建章节" />
    
    <el-card v-for="(section, sectionIndex) in sections" :key="section.sectionId" class="section">
      <template #header>
        <div class="row">
          <div class="section-title">
            <el-input 
              v-model="section.sectionOrder" 
              size="small" 
              class="order-input"
              @blur="updateSectionOrder(section)"
              @keyup.enter="updateSectionOrder(section)"
              placeholder="编号"
            />
            <span class="dot">·</span>
            <el-input 
              v-model="section.sectionName" 
              size="small" 
              class="name-input"
              @blur="updateSectionName(section)"
              @keyup.enter="updateSectionName(section)"
              placeholder="章节名"
            />
          </div>
          <div>
            <el-button type="primary" plain size="small" @click="addLesson(section)">＋ 添加小节</el-button>
            <el-button link type="danger" @click="removeSection(section)">删除章节</el-button>
          </div>
        </div>
      </template>
      
      <el-empty v-if="!section.lessons?.length" description="本章暂无小节，请添加小节" :image-size="55" />
      
      <div v-for="(lesson, lessonIndex) in section.lessons" :key="lesson.chapterId" class="lesson">
        <div class="lesson-title">
          <div class="lesson-info">
            <el-input 
              v-model="lesson.chapterOrder" 
              size="small" 
              class="order-input"
              @blur="updateLessonOrder(lesson)"
              @keyup.enter="updateLessonOrder(lesson)"
              placeholder="编号"
            />
            <span class="dot">·</span>
            <el-input 
              v-model="lesson.chapterName" 
              size="small" 
              class="name-input"
              @blur="updateLessonName(lesson)"
              @keyup.enter="updateLessonName(lesson)"
              placeholder="小节名"
            />
          </div>
          <div>
            <el-button link type="danger" @click="removeLesson(lesson)">删除小节</el-button>
          </div>
        </div>
        
        <div class="uploads">
          <el-upload 
            :action="uploadUrl(lesson.chapterId, 'video')" 
            :headers="headers" 
            accept="video/mp4" 
            :show-file-list="false" 
            :on-success="uploaded"
          >
            <el-button size="small">上传MP4视频</el-button>
          </el-upload>
          <el-upload 
            :action="uploadUrl(lesson.chapterId, 'material')" 
            :headers="headers" 
            accept="application/pdf" 
            :show-file-list="false" 
            :on-success="uploaded"
          >
            <el-button size="small">上传PDF资料</el-button>
          </el-upload>
        </div>
        
        <el-table v-if="resources(lesson).length" :data="resources(lesson)" size="small">
          <el-table-column prop="title" label="资源" />
          <el-table-column prop="kindLabel" label="类型" width="75" />
          <el-table-column label="审核状态" width="100">
            <template #default="{ row }">
              <el-tag :type="tag(row.status)">{{ label(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="reviewComment" label="审核意见" />
          <el-table-column label="操作" width="170">
            <template #default="{ row }">
              <el-upload 
                :action="replaceUrl(row)" 
                :headers="headers" 
                :accept="row.kind === 'video' ? 'video/mp4' : 'application/pdf'" 
                :show-file-list="false" 
                :on-success="uploaded" 
                class="inline"
              >
                <el-button link type="primary">替换</el-button>
              </el-upload>
              <el-button link type="danger" @click="withdraw(row)">撤回</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  createLesson, 
  createSection, 
  deleteChapter, 
  deleteSection, 
  getTeacherChapters, 
  updateLesson, 
  updateSection, 
  withdrawResource 
} from '../api/courseContent.js'

const props = defineProps({
  courseId: {
    type: String,
    required: true
  }
})

const sections = ref([])
const headers = { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }

const load = async () => {
  sections.value = await getTeacherChapters(props.courseId)
}

onMounted(load)

async function addSection() {
  const { value } = await ElMessageBox.prompt(
    '例如：第一章 Java语言基础', 
    '创建章节', 
    { 
      inputValue: '', 
      inputValidator: v => !!v?.trim() || '章节名不能为空' 
    }
  )
  await createSection(props.courseId, { sectionName: value })
  ElMessage.success('章节创建成功，请继续添加小节')
  await load()
}

async function addLesson(section) {
  const { value } = await ElMessageBox.prompt(
    '请输入小节名', 
    `在“${section.sectionName}”中添加小节`, 
    { 
      inputValidator: v => !!v?.trim() || '小节名不能为空' 
    }
  )
  await createLesson(section.sectionId, { chapterName: value })
  ElMessage.success('小节创建成功，现在可以上传教学内容')
  await load()
}

async function updateSectionName(section) {
  const name = section.sectionName?.trim()
  if(!name) {
    ElMessage.error('章节名不能为空')
    await load()
    return
  }
  try {
    await updateSection(section.sectionId, { sectionName: name })
  } catch(e) {
    ElMessage.error(e.response?.data?.message || '更新失败')
    await load()
  }
}

async function updateLessonName(lesson) {
  const name = lesson.chapterName?.trim()
  if(!name) {
    ElMessage.error('小节名不能为空')
    await load()
    return
  }
  try {
    await updateLesson(lesson.chapterId, { chapterName: name })
  } catch(e) {
    ElMessage.error(e.response?.data?.message || '更新失败')
    await load()
  }
}

async function updateSectionOrder(section) {
  const order = section.sectionOrder?.trim()
  if(!order) {
    await load()
    return
  }
  if(!order.match(/^\d+(\.\d+)*$/)) {
    ElMessage.error('章节编号格式不正确，应为数字或层级编号如 1、2.1')
    await load()
    return
  }
  try {
    await updateSection(section.sectionId, { sectionOrder: order })
    await load()
  } catch(e) {
    ElMessage.error(e.response?.data?.message || '更新失败')
    await load()
  }
}

async function updateLessonOrder(lesson) {
  const order = lesson.chapterOrder?.trim()
  if(!order) {
    await load()
    return
  }
  if(!order.match(/^\d+(\.\d+)*$/)) {
    ElMessage.error('小节编号格式不正确，应为数字或层级编号如 1.1、2.1')
    await load()
    return
  }
  try {
    await updateLesson(lesson.chapterId, { chapterOrder: order })
    await load()
  } catch(e) {
    ElMessage.error(e.response?.data?.message || '更新失败')
    await load()
  }
}

async function autoSortAll() {
  await ElMessageBox.confirm('将按照创建顺序重新编排所有章节和小节的编号，确定继续？', '自动排序', { type: 'warning' })
  const tempSections = [...sections.value]
  for(let i = 0; i < tempSections.length; i++) {
    await updateSection(tempSections[i].sectionId, { sectionOrder: String(i + 1) })
    const lessons = tempSections[i].lessons || []
    for(let j = 0; j < lessons.length; j++) {
      await updateLesson(lessons[j].chapterId, { chapterOrder: `${i + 1}.${j + 1}` })
    }
  }
  ElMessage.success('排序完成')
  await load()
}

async function removeSection(section) {
  await ElMessageBox.confirm(`删除章节“${section.sectionName}”及其全部小节？`, '警告', { type: 'warning' })
  await deleteSection(section.sectionId)
  ElMessage.success('章节已删除，编号已自动重排')
  await load()
}

async function removeLesson(lesson) {
  await ElMessageBox.confirm(`删除小节“${lesson.chapterName}”？`, '提示', { type: 'warning' })
  await deleteChapter(lesson.chapterId)
  ElMessage.success('小节已删除，编号已自动重排')
  await load()
}

const uploadUrl = (id, kind) => `/api/course-content/teacher/chapters/${id}/upload?kind=${kind}`
const replaceUrl = row => `/api/course-content/teacher/resources/${row.kind}/${row.id}/replace`

async function uploaded(response) {
  if (response.code !== 200) {
    ElMessage.error(response.message || '上传失败')
    return
  }
  ElMessage.success('操作成功，资源等待管理员重新审核')
  await load()
}

async function withdraw(row) {
  await ElMessageBox.confirm(
    `撤回“${row.title}”后学生将无法查看，确定继续？`, 
    '撤回资源', 
    { type: 'warning' }
  )
  await withdrawResource(row.kind, row.id)
  ElMessage.success('资源已撤回')
  await load()
}

const resources = lesson => [
  ...(lesson.videos || []).map(x => ({ ...x, kind: 'video', kindLabel: '视频' })),
  ...(lesson.materials || []).map(x => ({ ...x, kind: 'material', kindLabel: 'PDF' }))
]

const label = status => ({ pending: '待审核', approved: '已通过', rejected: '已拒绝' }[status] || status)
const tag = status => status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'warning'
</script>

<style scoped>
.manager {
  margin-top: 32px;
  border-top: 1px solid #eee;
  padding-top: 24px;
}

.intro {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.intro-actions {
  display: flex;
  gap: 8px;
}

.intro p {
  color: #909399;
}

.row, .lesson-title, .uploads {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.section-title, .lesson-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.order-input {
  width: 60px;
  text-align: center;
}

.name-input {
  width: 200px;
}

.dot {
  color: #909399;
  font-size: 18px;
}

.section {
  margin-top: 18px;
}

.section h3 {
  margin: 0;
}

.lesson {
  margin: 14px 0;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  background: #fafafa;
}

.uploads {
  justify-content: flex-start;
  margin: 12px 0;
}

.inline {
  display: inline-block;
  margin-right: 8px;
}
</style>