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
          :show-file-list="false"
          :on-success="handleCoverUpload"
        >
          <img v-if="form.coverImage" :src="form.coverImage" class="cover-preview" />
          <el-button v-else>上传封面</el-button>
        </el-upload>
      </el-form-item>
      
      <el-form-item label="课程价格">
        <el-input-number v-model="form.price" :min="0" :precision="2" placeholder="免费课程请输入0" />
      </el-form-item>
      
      <el-form-item label="总课时">
        <el-input-number v-model="form.totalHours" :min="1" placeholder="请输入总课时" />
      </el-form-item>
      
      <el-form-item label="教学大纲">
        <el-input v-model="form.syllabus" type="textarea" :rows="6" placeholder="请输入教学大纲" />
      </el-form-item>
      
      <el-form-item label="考核方式">
        <el-input v-model="form.assessmentMethod" type="textarea" :rows="3" placeholder="请输入考核方式" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
        <el-button @click="goBack">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCourseDetail, updateCourse } from '../../api/course.js'

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const saving = ref(false)
const courseId = route.params.id

const form = reactive({
  courseName: '',
  category: '',
  description: '',
  coverImage: '',
  price: 0,
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
    form.price = course.price || 0
    form.totalHours = course.totalHours || 0
  } catch (error) {
    ElMessage.error('获取课程详情失败')
    router.push('/teacher/courses')
  }
}

function handleCoverUpload(response) {
  form.coverImage = response.url
}

async function handleSave() {
  if (!form.courseName.trim()) {
    ElMessage.warning('请输入课程名称')
    return
  }
  
  saving.value = true
  try {
    const course = await updateCourse(courseId, {
      courseName: form.courseName,
      category: form.category,
      description: form.description,
      coverImage: form.coverImage,
      price: form.price,
      totalHours: form.totalHours,
      syllabus: form.syllabus,
      assessmentMethod: form.assessmentMethod
    })
    
    if (course.status === 'pending') {
      ElMessage.success('课程已更新，编辑后课程需重新审核')
    } else {
      ElMessage.success('课程更新成功')
    }
    router.push('/teacher/courses')
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '更新失败')
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
</style>
