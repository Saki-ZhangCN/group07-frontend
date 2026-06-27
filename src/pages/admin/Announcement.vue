<template>
  <div class="announcement">
    <h1>公告管理</h1>
    <el-button type="primary" class="create-btn">
      <el-icon><Plus /></el-icon>
      发布公告
    </el-button>
    
    <el-table :data="announcements">
      <el-table-column label="标题" prop="title" />
      <el-table-column label="发布时间" prop="publishTime" />
      <el-table-column label="状态" prop="status" />
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

const announcements = ref([
  { title: '系统升级通知', publishTime: '2024-01-15', status: '已发布' },
  { title: '课程更新提醒', publishTime: '2024-01-12', status: '已发布' }
])
</script>

<style scoped>
.announcement {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
}

.announcement h1 {
  font-size: var(--font-size-xl);
  color: var(--gray-800);
  margin-bottom: var(--spacing-xl);
}

.create-btn {
  margin-bottom: var(--spacing-lg);
}
</style>