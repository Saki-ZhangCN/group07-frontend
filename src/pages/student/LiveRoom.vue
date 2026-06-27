<template>
  <div class="live-room">
    <div class="live-header">
      <div class="live-video">
        <div class="video-placeholder">
          <el-icon :size="64"><VideoCamera /></el-icon>
          <p>直播画面区域</p>
        </div>
      </div>
      <div class="live-info">
        <h2>{{ liveInfo.title }}</h2>
        <div class="live-meta">
          <span class="live-badge badge-live">
            <span class="live-dot"></span>
            直播中
          </span>
          <span class="viewers">
            <el-icon><User /></el-icon>
            {{ liveInfo.viewers }}人观看
          </span>
        </div>
      </div>
    </div>
    
    <div class="live-content">
      <div class="whiteboard-section">
        <h3>电子白板</h3>
        <div class="whiteboard-placeholder">
          <el-icon :size="48"><Edit /></el-icon>
          <p>白板同步区域</p>
        </div>
      </div>
      
      <div class="chat-section">
        <h3>互动聊天</h3>
        <div class="chat-messages">
          <div class="message-item" v-for="msg in messages" :key="msg.id">
            <span class="message-user">{{ msg.user }}:</span>
            <span class="message-content">{{ msg.content }}</span>
          </div>
        </div>
        <div class="chat-input">
          <el-input v-model="messageInput" placeholder="输入消息..." />
          <el-button type="primary">发送</el-button>
        </div>
      </div>
    </div>
    
    <div class="live-actions">
      <el-button type="primary">
        <el-icon><ChatDotRound /></el-icon>
        申请连麦
      </el-button>
      <el-button>
        <el-icon><QuestionFilled /></el-icon>
        提问
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const messageInput = ref('')

const liveInfo = ref({
  title: 'Java编程基础 - 第三章',
  viewers: 156
})

const messages = ref([
  { id: '1', user: '学员A', content: '老师讲的很清楚' },
  { id: '2', user: '学员B', content: '请问这个知识点怎么理解?' },
  { id: '3', user: '学员C', content: '谢谢老师!' }
])
</script>

<style scoped>
.live-room {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.live-header {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-xl);
}

.live-video {
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

.live-info {
  margin-top: var(--spacing-lg);
}

.live-info h2 {
  font-size: var(--font-size-xl);
  color: var(--gray-800);
}

.live-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-md);
}

.viewers {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--gray-500);
}

.live-content {
  display: flex;
  gap: var(--spacing-lg);
}

.whiteboard-section,
.chat-section {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-xl);
}

.whiteboard-section {
  flex: 2;
}

.chat-section {
  flex: 1;
}

.whiteboard-section h3,
.chat-section h3 {
  font-size: var(--font-size-lg);
  color: var(--gray-800);
  margin-bottom: var(--spacing-md);
}

.whiteboard-placeholder {
  width: 100%;
  height: 300px;
  background: var(--gray-50);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-400);
}

.chat-messages {
  height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.message-item {
  font-size: var(--font-size-sm);
}

.message-user {
  font-weight: 500;
  color: var(--primary-500);
}

.message-content {
  color: var(--gray-600);
}

.chat-input {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.live-actions {
  display: flex;
  gap: var(--spacing-md);
}
</style>