<template>
  <div class="announcement">
    <h1>公告管理</h1>
    <el-button type="primary" class="create-btn" @click="openCreate">
      <el-icon><Plus /></el-icon>
      发布公告
    </el-button>
    
    <el-table :data="announcements">
      <el-table-column label="标题" prop="title" />
      <el-table-column label="置顶" width="80" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.pinned" type="warning" size="small">置顶</el-tag>
          <span v-else class="not-pinned">-</span>
        </template>
      </el-table-column>
      <el-table-column label="发布时间" prop="publishTime" />
      <el-table-column label="状态" prop="status" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" type="warning" @click="edit(scope.row)">编辑</el-button>
          <el-button size="small" :type="scope.row.pinned ? 'info' : 'primary'" @click="togglePin(scope.row)">
            {{ scope.row.pinned ? '取消置顶' : '置顶' }}
          </el-button>
          <el-button size="small" type="danger" @click="remove(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" title="发布平台公告" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="72px">
        <el-form-item label="标题" prop="title"><el-input v-model="form.title" maxlength="120" show-word-limit placeholder="请输入公告标题" /></el-form-item>
        <el-form-item label="内容" prop="content"><el-input v-model="form.content" type="textarea" :rows="8" maxlength="5000" show-word-limit placeholder="请输入公告内容" /></el-form-item>
        <el-form-item label="置顶"><el-switch v-model="form.pinned" /></el-form-item>
      </el-form>
      <template #footer><el-button size="small" @click="dialogVisible=false">取消</el-button><el-button size="small" type="primary" :loading="submitting" @click="submit">立即发布</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { deleteAnnouncement, getAnnouncementList } from '../../api/admin.js'
import { createAnnouncement, updateAnnouncement } from '../../api/admin.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const announcements = ref([])
const dialogVisible=ref(false),submitting=ref(false),formRef=ref()
const form=ref({title:'',content:'',pinned:false})
const rules={title:[{required:true,message:'请输入公告标题',trigger:'blur'}],content:[{required:true,message:'请输入公告内容',trigger:'blur'}]}
async function load() {
  const data = await getAnnouncementList({ page: 1, size: 100 })
  announcements.value = (data.records || []).map(item => ({ ...item, publishTime: item.publishTime || item.createTime }))
}
async function remove(id) {
  await ElMessageBox.confirm('确定删除这条公告吗？', '提示', { type: 'warning' })
  await deleteAnnouncement(id)
  await load()
}
function openCreate(){form.value={title:'',content:'',pinned:false};dialogVisible.value=true}
async function submit(){await formRef.value.validate();submitting.value=true;try{await createAnnouncement({...form.value,scope:'all',status:'published'});ElMessage.success('公告已发布给所有成员');dialogVisible.value=false;await load()}finally{submitting.value=false}}
async function togglePin(row) {
  await updateAnnouncement(row.id, { pinned: row.pinned ? false : true })
  row.pinned = !row.pinned
  ElMessage.success(row.pinned ? '已置顶' : '已取消置顶')
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

.not-pinned {
  color: var(--gray-400);
}
</style>
