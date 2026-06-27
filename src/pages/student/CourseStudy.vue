<template>
  <div class="course-study">
    <div class="study-header">
      <div class="video-container">
        <div class="video-placeholder">
          <el-icon :size="64"><VideoPlay /></el-icon>
          <p>视频播放区域</p>
        </div>
      </div>
      <div class="lesson-info">
        <h2>{{ currentLesson.title }}</h2>
        <p>{{ currentLesson.chapter }}</p>
      </div>
    </div>
    
    <div class="study-content">
      <div class="chapters-sidebar">
        <h3>课程章节</h3>
        <div class="chapter-list">
          <div class="chapter-item" v-for="chapter in chapters" :key="chapter.id">
            <div class="chapter-title">{{ chapter.title }}</div>
            <div class="lesson-list">
              <div 
                class="lesson-item" 
                v-for="lesson in chapter.lessons" 
                :key="lesson.id"
                :class="{ active: lesson.id === currentLessonId, completed: lesson.completed }"
                @click="selectLesson(lesson)"
              >
                <span class="lesson-status">
                  <el-icon v-if="lesson.completed"><CircleCheck /></el-icon>
                  <el-icon v-else><VideoPlay /></el-icon>
                </span>
                <span class="lesson-name">{{ lesson.title }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="study-main">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="课程笔记" name="notes">
            <div class="notes-section">
              <el-input
                v-model="notes"
                type="textarea"
                :rows="10"
                placeholder="在此记录你的学习笔记..."
              />
              <el-button type="primary" class="save-btn">保存笔记</el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="课程讨论" name="discussion">
            <div class="discussion-section">
              <p>课程讨论功能</p>
            </div>
          </el-tab-pane>
          <el-tab-pane label="相关资料" name="materials">
            <div class="materials-section">
              <p>课程相关资料下载</p>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const currentLessonId = ref('1-1')
const activeTab = ref('notes')
const notes = ref('')

const currentLesson = ref({
  title: 'Java概述与环境搭建',
  chapter: '第一章 Java语言基础'
})

const chapters = ref([
  {
    id: '1',
    title: '第一章 Java语言基础',
    lessons: [
      { id: '1-1', title: 'Java概述与环境搭建', completed: true },
      { id: '1-2', title: '基本数据类型', completed: false },
      { id: '1-3', title: '运算符与表达式', completed: false }
    ]
  },
  {
    id: '2',
    title: '第二章 面向对象编程',
    lessons: [
      { id: '2-1', title: '类与对象', completed: false },
      { id: '2-2', title: '继承与多态', completed: false }
    ]
  }
])

function selectLesson(lesson) {
  currentLessonId.value = lesson.id
  currentLesson.value.title = lesson.title
}
</script>

<style scoped>
.course-study {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.study-header {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-xl);
}

.video-container {
  width: 100%;
  aspect-ratio: 16/9;
  background: var(--gray-800);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-placeholder {
  text-align: center;
  color: white;
}

.video-placeholder p {
  margin-top: var(--spacing-md);
}

.lesson-info {
  margin-top: var(--spacing-lg);
}

.lesson-info h2 {
  font-size: var(--font-size-xl);
  color: var(--gray-800);
}

.lesson-info p {
  color: var(--gray-500);
}

.study-content {
  display: flex;
  gap: var(--spacing-lg);
}

.chapters-sidebar {
  width: 300px;
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-xl);
}

.chapters-sidebar h3 {
  font-size: var(--font-size-lg);
  color: var(--gray-800);
  margin-bottom: var(--spacing-lg);
}

.chapter-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.chapter-title {
  font-weight: 500;
  color: var(--gray-700);
  margin-bottom: var(--spacing-md);
}

.lesson-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.lesson-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
}

.lesson-item:hover {
  background: var(--gray-50);
}

.lesson-item.active {
  background: var(--primary-50);
  color: var(--primary-500);
}

.lesson-item.completed {
  color: var(--green-500);
}

.lesson-name {
  font-size: var(--font-size-sm);
}

.study-main {
  flex: 1;
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-xl);
}

.notes-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.save-btn {
  align-self: flex-end;
}
</style>