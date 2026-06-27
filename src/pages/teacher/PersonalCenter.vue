<template>
  <div class="teacher-profile">
    <h1>讲师个人中心</h1>
    <el-form label-width="100px">
      <el-form-item label="姓名">
        <el-input value="讲师" />
      </el-form-item>
      <el-form-item label="简介">
        <el-input type="textarea" value="资深讲师" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
</script>

<style scoped>
.teacher-profile {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
}

.teacher-profile h1 {
  font-size: var(--font-size-xl);
  color: var(--gray-800);
  margin-bottom: var(--spacing-xl);
}
</style>