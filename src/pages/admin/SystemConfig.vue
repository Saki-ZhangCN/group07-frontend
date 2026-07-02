<template>
  <div class="system-config">
    <h1>系统配置</h1>
    <el-form label-width="120px" v-loading="loading">
      <el-form-item label="平台名称">
        <el-input v-model="form.siteName" />
      </el-form-item>
      <el-form-item label="开放注册">
        <el-switch v-model="form.allowRegister" />
      </el-form-item>
      <el-form-item label="默认及格分">
        <el-input-number v-model="form.homeworkPassScore" :min="0" :max="100" />
      </el-form-item>
      <el-form-item label="维护模式">
        <el-switch v-model="form.maintenanceMode" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save">保存配置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getSystemConfig, updateSystemConfig } from '../../api/admin.js'

const loading = ref(false)
const form = reactive({ siteName: '', allowRegister: false, homeworkPassScore: 60, maintenanceMode: false })
onMounted(async () => {
  loading.value = true
  try { Object.assign(form, await getSystemConfig()) } finally { loading.value = false }
})
async function save() {
  await updateSystemConfig({ ...form })
  ElMessage.success('配置已保存')
}
</script>

<style scoped>
.system-config {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
}

.system-config h1 {
  font-size: var(--font-size-xl);
  color: var(--gray-800);
  margin-bottom: var(--spacing-xl);
}
</style>
