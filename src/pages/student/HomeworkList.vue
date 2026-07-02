<template>
  <div class="homework-list">
    <div class="filter-bar">
      <el-select v-model="statusFilter" placeholder="作业状态">
        <el-option label="全部" value="" />
        <el-option label="待完成" value="pending" />
        <el-option label="已完成" value="completed" />
      </el-select>
    </div>
    
    <div class="homework-items">
      <div class="homework-card" v-for="hw in filteredHomeworks" :key="hw.id">
        <div class="hw-header">
          <span class="hw-course">{{ hw.course }}</span>
          <span class="hw-status" :class="hw.statusClass">{{ hw.statusLabel }}</span>
        </div>
        <h3 class="hw-title">{{ hw.title }}</h3>
        <div class="hw-meta">
          <span class="hw-deadline">
            <el-icon><Clock /></el-icon>
            {{ hw.deadline }}
          </span>
          <span class="hw-type">{{ hw.type }}</span>
        </div>
        <div class="hw-actions">
          <el-button type="primary" size="small" v-if="hw.status === 'pending'" @click="openHomework(hw.id)">
            开始作答
          </el-button>
          <el-button size="small" v-else @click="openHomework(hw.id)">查看结果</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getHomeworkList } from '../../api/homework.js'

const statusFilter = ref('')
const router = useRouter()
const homeworks = ref([])
const filteredHomeworks = computed(() => statusFilter.value
  ? homeworks.value.filter(item => item.status === statusFilter.value)
  : homeworks.value)

onMounted(async () => {
  const data = await getHomeworkList({ page: 1, size: 100 })
  homeworks.value = (data.records || []).map(item => ({
    ...item,
    course: item.course || item.courseName,
    type: item.type || `${item.questionCount || 0}道题`,
    statusLabel: item.status === 'pending' ? '待完成' : item.status === 'graded' ? '已批改' : '已提交',
    statusClass: item.status === 'pending' ? 'pending' : 'completed'
  }))
})

function openHomework(id) { router.push(`/student/homework/${id}`) }
</script>

<style scoped>
.homework-list {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
}

.filter-bar {
  margin-bottom: var(--spacing-lg);
}

.homework-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.homework-card {
  padding: var(--spacing-lg);
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-lg);
}

.hw-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.hw-course {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

.hw-status {
  font-size: var(--font-size-xs);
  padding: 4px 12px;
  border-radius: var(--radius-full);
}

.hw-status.pending {
  background: rgba(249, 115, 22, 0.1);
  color: var(--accent-orange);
}

.hw-status.completed {
  background: rgba(34, 197, 94, 0.1);
  color: var(--green-500);
}

.hw-title {
  font-size: var(--font-size-lg);
  color: var(--gray-800);
}

.hw-meta {
  display: flex;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-md);
  color: var(--gray-500);
  font-size: var(--font-size-sm);
}

.hw-deadline {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.hw-actions {
  margin-top: var(--spacing-lg);
}
</style>
