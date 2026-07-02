<template>
  <div class="homework-grade">
    <h1>作业批改</h1>
    <div class="grade-list">
      <el-table :data="submissions">
        <el-table-column label="学员" prop="studentName" />
        <el-table-column label="作业" prop="homeworkTitle" />
        <el-table-column label="提交时间" prop="submitTime" />
        <el-table-column label="状态" prop="status" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button type="primary" size="small" @click="grade(scope.row)">批改</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getPendingSubmissions } from '../../api/homework.js'
import { gradeSubmission } from '../../api/homework.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const submissions = ref([])
async function load() {
  const data = await getPendingSubmissions({ page: 1, size: 100 })
  submissions.value = data.records || []
}
async function grade(row) {
  const { value } = await ElMessageBox.prompt('请输入分数（0-100）', '批改作业', { inputPattern: /^(100|[1-9]?\d)$/, inputErrorMessage: '请输入0到100的整数' })
  await gradeSubmission(row.submissionId, { score: Number(value), comment: '教师已完成批改' })
  ElMessage.success('批改完成')
  await load()
}
onMounted(load)
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
