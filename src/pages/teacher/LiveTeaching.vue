<template>
  <div class="live-teaching">
    <div class="teaching-header">
      <h1>直播授课</h1>
      <el-button type="danger">结束直播</el-button>
    </div>
    
    <div class="teaching-content">
      <div class="video-section">
        <div class="video-placeholder">
          <el-icon :size="64"><VideoCamera /></el-icon>
          <p>直播画面</p>
        </div>
      </div>
      
      <div class="tools-section">
        <h3>授课工具</h3>
        <div class="tools-grid">
          <el-button>
            <el-icon><Edit /></el-icon>
            白板
          </el-button>
          <el-button>
            <el-icon><Document /></el-icon>
            资料
          </el-button>
          <el-button>
            <el-icon><ChatDotRound /></el-icon>
            互动
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.live-teaching {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
}

.teaching-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
}

.teaching-header h1 {
  font-size: var(--font-size-xl);
  color: var(--gray-800);
}

.video-section {
  width: 100%;
  aspect-ratio: 16/9;
  background: var(--gray-800);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-xl);
}

.video-placeholder {
  text-align: center;
  color: white;
}

.tools-section h3 {
  font-size: var(--font-size-lg);
  color: var(--gray-800);
  margin-bottom: var(--spacing-md);
}

.tools-grid {
  display: flex;
  gap: var(--spacing-md);
}
</style>