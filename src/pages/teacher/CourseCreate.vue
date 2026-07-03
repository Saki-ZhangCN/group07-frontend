<template>
  <div class="course-create">
    <h1>创建课程</h1>
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
      
      <el-alert title="课程保存后，将进入“课程章节”页面创建每节课并上传视频或PDF资料。" type="info" :closable="false" />
      
      <el-form-item>
        <el-button type="primary" @click="submitForm">创建并管理章节</el-button>
        <el-button @click="saveDraft">保存草稿</el-button>
        <el-button @click="cancelForm">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createCourse } from '../../api/course.js'
import { courseCoverUrl, useFallbackCover } from '../../utils/assets.js'

const router = useRouter()
const formRef = ref(null)
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

function handleCoverUpload(response) {
  if (response.code !== 200) {
    ElMessage.error(response.message || '封面上传失败')
    return
  }
  form.coverImage = response.data?.url || response.url || ''
}

async function submitForm() {
  if (!form.courseName.trim()) {
    ElMessage.warning('请输入课程名称')
    return
  }
  
  try {
    const course = await createCourse({
      courseName: form.courseName,
      category: form.category,
      description: form.description,
      coverImage: form.coverImage,
      totalHours: form.totalHours,
      syllabus: form.syllabus,
      assessmentMethod: form.assessmentMethod
    })
    ElMessage.success('课程基本信息已创建，请继续创建课程章节')
    router.push(`/teacher/course/edit/${course.courseId}`)
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '创建失败')
  }
}

async function saveDraft() {
  try {
    const course = await createCourse({
      courseName: form.courseName || '未命名课程',
      category: form.category,
      description: form.description,
      coverImage: form.coverImage,
      totalHours: form.totalHours,
      syllabus: form.syllabus,
      assessmentMethod: form.assessmentMethod
    })
    ElMessage.success('草稿保存成功')
    router.push(`/teacher/course/edit/${course.courseId}`)
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '保存失败')
  }
}

function cancelForm() {
  router.push('/teacher/courses')
}
</script>

<style scoped>
.course-create {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
}

.course-create h1 {
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
</style>
