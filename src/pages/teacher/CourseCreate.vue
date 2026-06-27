<template>
  <div class="course-create">
    <h1>创建课程</h1>
    <el-form label-width="120px">
      <el-form-item label="课程名称">
        <el-input v-model="form.name" placeholder="请输入课程名称" />
      </el-form-item>
      <el-form-item label="课程分类">
        <el-select v-model="form.category" placeholder="请选择分类">
          <el-option label="编程开发" value="programming" />
          <el-option label="设计艺术" value="design" />
          <el-option label="语言学习" value="language" />
        </el-select>
      </el-form-item>
      <el-form-item label="课程简介">
        <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入课程简介" />
      </el-form-item>
      <el-form-item label="课程封面">
        <el-upload>
          <el-button>上传封面</el-button>
        </el-upload>
      </el-form-item>
      <el-form-item>
        <el-button type="primary">保存并下一步</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  name: '',
  category: '',
  description: ''
})
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
</style>