<template>
  <div class="system-config">
    <h1>系统配置</h1>
    <el-form label-width="120px">
      <el-form-item label="平台名称">
        <el-input value="在线教育智慧教学平台" />
      </el-form-item>
      <el-form-item label="Logo">
        <el-upload>
          <el-button>上传Logo</el-button>
        </el-upload>
      </el-form-item>
      <el-form-item>
        <el-button type="primary">保存配置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
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