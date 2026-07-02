<template>
  <div class="announcement">
    <h1>公告管理</h1>
    <el-button type="primary" class="create-btn" @click="create">
      <el-icon><Plus /></el-icon>
      发布公告
    </el-button>
    
    <el-table :data="announcements">
      <el-table-column label="标题" prop="title" />
      <el-table-column label="发布时间" prop="publishTime" />
      <el-table-column label="状态" prop="status" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="edit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="remove(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { deleteAnnouncement, getAnnouncementList } from '../../api/admin.js'
import { createAnnouncement, updateAnnouncement } from '../../api/admin.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const announcements = ref([])
async function load() {
  const data = await getAnnouncementList({ page: 1, size: 100 })
  announcements.value = (data.records || []).map(item => ({ ...item, publishTime: item.publishTime || item.createTime }))
}
async function remove(id) {
  await ElMessageBox.confirm('确定删除这条公告吗？', '提示', { type: 'warning' })
  await deleteAnnouncement(id)
  await load()
}
async function create() {
  const { value: title } = await ElMessageBox.prompt('请输入公告标题', '发布公告')
  const { value: content } = await ElMessageBox.prompt('请输入公告内容', '发布公告')
  await createAnnouncement({ title, content, scope: 'all', status: 'published' })
  ElMessage.success('公告已发布')
  await load()
}
async function edit(row) {
  const { value: content } = await ElMessageBox.prompt('修改公告内容', '编辑公告', { inputValue: row.content })
  await updateAnnouncement(row.id, { content })
  ElMessage.success('公告已更新')
  await load()
}
onMounted(load)
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
