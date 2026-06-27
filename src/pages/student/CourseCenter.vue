<template>
  <div class="course-center">
    <!-- 搜索和筛选 -->
    <div class="search-filter-section">
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索课程名称、讲师..."
          prefix-icon="Search"
          clearable
          size="large"
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" size="large" @click="handleSearch">
          搜索
        </el-button>
      </div>
      
      <div class="filter-categories">
        <button 
          class="category-btn" 
          :class="{ active: selectedCategory === '' }"
          @click="selectedCategory = ''"
        >
          全部
        </button>
        <button 
          class="category-btn" 
          :class="{ active: selectedCategory === 'programming' }"
          @click="selectedCategory = 'programming'"
        >
          编程开发
        </button>
        <button 
          class="category-btn" 
          :class="{ active: selectedCategory === 'design' }"
          @click="selectedCategory = 'design'"
        >
          设计艺术
        </button>
        <button 
          class="category-btn" 
          :class="{ active: selectedCategory === 'language' }"
          @click="selectedCategory = 'language'"
        >
          语言学习
        </button>
        <button 
          class="category-btn" 
          :class="{ active: selectedCategory === 'math' }"
          @click="selectedCategory = 'math'"
        >
          数学科学
        </button>
      </div>
    </div>
    
    <!-- 课程列表 -->
    <div class="courses-section">
      <div class="courses-header">
        <span class="courses-count">共 {{ courses.length }} 门课程</span>
        <el-select v-model="sortBy" placeholder="排序方式" size="default">
          <el-option label="最新发布" value="latest" />
          <el-option label="评分最高" value="rating" />
          <el-option label="学习人数" value="students" />
          <el-option label="价格最低" value="price" />
        </el-select>
      </div>
      
      <div class="courses-grid" v-if="courses.length">
        <div 
          class="course-card" 
          v-for="course in courses" 
          :key="course.id"
          @click="goToDetail(course.id)"
        >
          <div class="course-cover">
            <img :src="course.coverImage" :alt="course.name" />
            <span class="badge badge-live" v-if="course.isLive">
              <span class="live-dot"></span>
              直播中
            </span>
            <span class="badge badge-success" v-if="course.isFree">
              免费
            </span>
          </div>
          <div class="course-info">
            <div class="course-category">
              <span class="tag">{{ course.category }}</span>
            </div>
            <h3 class="course-name">{{ course.name }}</h3>
            <p class="course-teacher">{{ course.teacher }}</p>
            <div class="course-meta">
              <span class="course-rating">
                <el-icon><Star /></el-icon>
                {{ course.rating }}
              </span>
              <span class="course-students">
                {{ course.students }}人学习
              </span>
            </div>
            <div class="course-footer">
              <div class="course-price">
                <span class="price-current" v-if="!course.isFree">¥{{ course.price }}</span>
                <span class="price-free" v-else>免费</span>
              </div>
              <el-button type="primary" size="small" @click.stop="handleEnroll(course.id)">
                选课
              </el-button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="empty-state" v-else>
        <el-icon :size="48"><Search /></el-icon>
        <p>暂无相关课程</p>
      </div>
      
      <!-- 分页 -->
      <div class="pagination-section" v-if="courses.length">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 36]"
          :total="totalCount"
          layout="total, sizes, prev, pager, next"
          background
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const searchKeyword = ref('')
const selectedCategory = ref('')
const sortBy = ref('latest')
const currentPage = ref(1)
const pageSize = ref(12)
const totalCount = ref(100)

const courses = ref([
  {
    id: '1',
    name: 'Java编程基础：从入门到精通',
    teacher: '王老师',
    category: '编程开发',
    coverImage: 'https://picsum.photos/seed/java1/400/225',
    rating: 4.8,
    students: 2568,
    price: 99,
    isFree: false,
    isLive: true
  },
  {
    id: '2',
    name: 'Python数据分析实战',
    teacher: '李老师',
    category: '编程开发',
    coverImage: 'https://picsum.photos/seed/python2/400/225',
    rating: 4.6,
    students: 1235,
    price: 0,
    isFree: true,
    isLive: false
  },
  {
    id: '3',
    name: 'Web前端开发完整教程',
    teacher: '张老师',
    category: '编程开发',
    coverImage: 'https://picsum.photos/seed/web3/400/225',
    rating: 4.9,
    students: 3250,
    price: 199,
    isFree: false,
    isLive: false
  },
  {
    id: '4',
    name: '数据库原理与应用',
    teacher: '陈老师',
    category: '编程开发',
    coverImage: 'https://picsum.photos/seed/db4/400/225',
    rating: 4.5,
    students: 856,
    price: 149,
    isFree: false,
    isLive: true
  },
  {
    id: '5',
    name: 'UI设计从零开始',
    teacher: '刘老师',
    category: '设计艺术',
    coverImage: 'https://picsum.photos/seed/ui5/400/225',
    rating: 4.7,
    students: 1650,
    price: 129,
    isFree: false,
    isLive: false
  },
  {
    id: '6',
    name: '英语口语提升班',
    teacher: '赵老师',
    category: '语言学习',
    coverImage: 'https://picsum.photos/seed/eng6/400/225',
    rating: 4.4,
    students: 2156,
    price: 0,
    isFree: true,
    isLive: false
  }
])

// 从路由获取搜索关键词
onMounted(() => {
  if (route.query.keyword) {
    searchKeyword.value = route.query.keyword
    handleSearch()
  }
})

watch([selectedCategory, sortBy, currentPage], () => {
  // 加载课程数据
})

function handleSearch() {
  currentPage.value = 1
  // 调用API搜索课程
}

function goToDetail(courseId) {
  router.push(`/student/course/${courseId}`)
}

function handleEnroll(courseId) {
  ElMessage.success('选课成功，开始学习吧！')
  router.push(`/student/study/${courseId}`)
}
</script>

<style scoped>
.course-center {
  max-width: 1200px;
}

.search-filter-section {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-xl);
  margin-bottom: var(--spacing-xl);
}

.search-box {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.search-box .el-input {
  flex: 1;
}

.filter-categories {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.category-btn {
  padding: 8px 20px;
  background: var(--gray-100);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  color: var(--gray-600);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.category-btn:hover {
  background: var(--gray-200);
}

.category-btn.active {
  background: var(--primary-500);
  color: white;
}

.courses-section {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-xl);
}

.courses-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.courses-count {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
}

.course-card {
  border-radius: var(--radius-xl);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-base);
  border: 1px solid var(--gray-100);
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-100);
}

.course-cover {
  position: relative;
  aspect-ratio: 16/9;
  overflow: hidden;
}

.course-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.course-card:hover .course-cover img {
  transform: scale(1.05);
}

.course-cover .badge {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
}

.course-cover .badge-success {
  top: var(--spacing-md);
  left: var(--spacing-md);
  right: auto;
}

.course-info {
  padding: var(--spacing-lg);
}

.course-category {
  margin-bottom: var(--spacing-sm);
}

.course-name {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: var(--spacing-sm);
  line-height: 1.4;
}

.course-card:hover .course-name {
  color: var(--primary-500);
}

.course-teacher {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
  margin-bottom: var(--spacing-md);
}

.course-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  font-size: var(--font-size-sm);
  color: var(--gray-500);
  margin-bottom: var(--spacing-md);
}

.course-rating {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--yellow-400);
}

.course-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price-current {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--accent-orange);
}

.price-free {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--green-500);
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-xl);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--gray-500);
}

.empty-state p {
  margin-top: var(--spacing-md);
}

@media (max-width: 1023px) {
  .courses-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .courses-grid {
    grid-template-columns: 1fr;
  }
  
  .search-box {
    flex-direction: column;
  }
  
  .filter-categories {
    justify-content: center;
  }
}
</style>