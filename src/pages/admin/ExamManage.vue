<template>
  <div class="exam-manage">
    <h1>题库管理</h1>
    <el-button type="primary" class="create-btn">
      <el-icon><Plus /></el-icon>
      创建题目
    </el-button>
    
    <el-table :data="questions">
      <el-table-column label="题目" prop="content" />
      <el-table-column label="类型" prop="type" />
      <el-table-column label="分类" prop="category" />
      <el-table-column label="操作">
        <template #default>
          <el-button size="small">编辑</el-button>
          <el-button size="small" type="danger">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const questions = ref([
  { content: 'Java基本数据类型有哪些？', type: '选择题', category: 'Java' },
  { content: 'Python中如何定义函数？', type: '简答题', category: 'Python' }
])
</script>

<style scoped>
.exam-manage {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
}

.exam-manage h1 {
  font-size: var(--font-size-xl);
  color: var(--gray-800);
  margin-bottom: var(--spacing-xl);
}

.create-btn {
  margin-bottom: var(--spacing-lg);
}
</style>