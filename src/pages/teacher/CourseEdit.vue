<template>
  <div class="course-edit">
    <h1>编辑课程</h1>
    <el-form ref="formRef" :model="form" label-width="120px">
      <el-form-item label="课程名称" prop="courseName" :rules="[{ required: true, message: '请输入课程名称', trigger: 'blur' }]">
        <el-input v-model="form.courseName" placeholder="请输入课程名称" />
      </el-form-item>
      
      <el-form-item label="课程分类">
        <el-select v-model="form.category" placeholder="请选择分类">
          <el-option label="编程开发" value="编程开发" />
          <el-option label="设计艺术" value="设计艺术" />
          <el-option label="语言学习" value="语言学习" />
          <el-option label="数学科学" value="数学科学" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="课程简介">
        <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入课程简介" />
      </el-form-item>
      
      <el-form-item label="课程封面">
        <el-upload 
          class="cover-upload"
          action="/api/upload"
          :headers="uploadHeaders"
          :show-file-list="false"
          :on-success="handleCoverUpload"
        >
          <img v-if="form.coverImage" :src="courseCoverUrl(form.coverImage)" class="cover-preview" @error="useFallbackCover" />
          <el-button v-else>上传封面</el-button>
        </el-upload>
      </el-form-item>
      
      <el-form-item label="总课时">
        <el-input-number v-model="form.totalHours" :min="1" placeholder="请输入总课时" />
      </el-form-item>
    </el-form>
    <ChapterManager :course-id="courseId" />
    
    <div class="action-buttons">
      <button class="btn btn-secondary" @click="saveAsDraft" :disabled="saving">
        {{ saving ? '保存中...' : '保存为草稿' }}
      </button>
      <button class="btn btn-primary" @click="submitForReview" :disabled="saving">
        {{ saving ? '提交中...' : '提交审核' }}
      </button>
      <button class="btn btn-ghost" @click="goBack">取消</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCourseDetail, updateCourse } from '../../api/course.js'
import { courseCoverUrl, useFallbackCover } from '../../utils/assets.js'
import ChapterManager from '../../components/ChapterManager.vue'

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const saving = ref(false)
const courseId = route.params.id
const uploadHeaders = { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }

const form = reactive({
  courseName: '',
  category: '',
  description: '',
  coverImage: '',
  totalHours: 0,
  syllabus: '',
  assessmentMethod: ''
})

onMounted(async () => {
  await loadCourseDetail()
})

async function loadCourseDetail() {
  try {
    const course = await getCourseDetail(courseId)
    form.courseName = course.courseName || ''
    form.category = course.category || ''
    form.description = course.description || ''
    form.coverImage = course.coverImage || ''
    form.totalHours = course.totalHours || 0
  } catch (error) {
    ElMessage.error('获取课程详情失败')
    router.push('/teacher/courses')
  }
}

function handleCoverUpload(response) {
  if (response.code !== 200) {
    ElMessage.error(response.message || '封面上传失败')
    return
  }
  form.coverImage = response.data?.url || response.url || ''
}

async function saveAsDraft() {
  if (!form.courseName.trim()) {
    ElMessage.warning('请输入课程名称')
    return
  }
  
  saving.value = true
  try {
    await updateCourse(courseId, {
      courseName: form.courseName,
      category: form.category,
      description: form.description,
      coverImage: form.coverImage,
      totalHours: form.totalHours,
      syllabus: form.syllabus,
      assessmentMethod: form.assessmentMethod,
      status: 'draft'
    })
    ElMessage.success('课程已保存为草稿')
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function submitForReview() {
  if (!form.courseName.trim()) {
    ElMessage.warning('请输入课程名称')
    return
  }
  
  saving.value = true
  try {
    await updateCourse(courseId, {
      courseName: form.courseName,
      category: form.category,
      description: form.description,
      coverImage: form.coverImage,
      totalHours: form.totalHours,
      syllabus: form.syllabus,
      assessmentMethod: form.assessmentMethod,
      status: 'pending'
    })
    ElMessage.success('课程已提交审核，请等待管理员审核')
    router.push('/teacher/courses')
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '提交失败')
  } finally {
    saving.value = false
  }
}

function goBack() {
  router.push('/teacher/courses')
}
</script>

<style scoped>
.course-edit {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
}

.course-edit h1 {
  font-size: var(--font-size-xl);
  color: var(--gray-800);
  margin-bottom: var(--spacing-xl);
}

.cover-upload {
  width: 200px;
}

.cover-preview {
  width: 200px;
  height: 120px;
  border-radius: var(--radius-lg);
  object-fit: cover;
}

.action-buttons {
  margin-top: var(--spacing-xxl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
