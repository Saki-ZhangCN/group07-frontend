<template>
  <div class="homework-grade">
    <h1>作业批改</h1>
    <div class="grade-list">
      <el-table :data="submissions">
        <el-table-column label="学员" prop="student" />
        <el-table-column label="作业" prop="homework" />
        <el-table-column label="提交时间" prop="submitTime" />
        <el-table-column label="状态" prop="status" />
        <el-table-column label="操作">
          <template #default>
            <el-button type="primary" size="small">批改</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const submissions = ref([
  { student: '学员A', homework: '第一章习题', submitTime: '2024-01-15', status: '待批改' },
  { student: '学员B', homework: '第一章习题', submitTime: '2024-01-14', status: '已批改' }
])
</script>

<style scoped>
.homework-grade {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
}

.homework-grade h1 {
  font-size: var(--font-size-xl);
  color: var(--gray-800);
  margin-bottom: var(--spacing-xl);
}
</style>