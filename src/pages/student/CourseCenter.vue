<template>
  <div class="course-center">
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
          @click="selectedCategory = ''; handleSearch()"
        >
          全部
        </button>
        <button 
          v-for="category in categories" 
          :key="category"
          class="category-btn" 
          :class="{ active: selectedCategory === category }"
          @click="selectedCategory = category; handleSearch()"
        >
          {{ category }}
        </button>
      </div>
    </div>
    
    <div class="courses-section">
      <div class="courses-header">
        <el-select v-model="sortBy" placeholder="排序方式" size="default" @change="handleSearch">
          <el-option label="最新发布" value="latest" />
          <el-option label="评分最高" value="rating" />
          <el-option label="学习人数" value="students" />
        </el-select>
      </div>
      
      <div class="courses-grid" v-if="courses.length">
        <div 
          class="course-card" 
          v-for="course in courses" 
          :key="course.courseId"
          @click="goToDetail(course.courseId)"
        >
          <div class="course-cover">
            <img :src="courseCoverUrl(course.coverImage)" :alt="course.courseName" @error="useFallbackCover" />
          </div>
          <div class="course-info">
            <div class="course-category">
              <span class="tag">{{ course.category }}</span>
            </div>
            <h3 class="course-name">{{ course.courseName }}</h3>
            <p class="course-teacher">{{ course.teacherName }}</p>
            <div class="course-meta">
              <span class="course-rating">
                <el-icon><Star /></el-icon>
                {{ course.rating || '暂无评分' }}
              </span>
              <span class="course-students">
                {{ course.studentCount }}人学习
              </span>
            </div>
            <div class="course-footer">
              <el-button v-if="enrolledIds.has(course.courseId)" type="info" size="small" disabled>
                已选
              </el-button>
              <el-button v-else type="primary" size="small" @click.stop="handleEnroll(course)">
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
      
      <div class="pagination-section" v-if="totalCount > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 36]"
          :total="totalCount"
          layout="total, sizes, prev, pager, next"
          background
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCourseList, enrollCourse, getEnrolledCourses } from '../../api/course.js'
import { courseCoverUrl, useFallbackCover } from '../../utils/assets.js'

const router = useRouter()
const route = useRoute()

const searchKeyword = ref('')
const selectedCategory = ref('')
const sortBy = ref('latest')
const currentPage = ref(1)
const pageSize = ref(12)
const totalCount = ref(0)
const courses = ref([])
const enrolledIds = ref(new Set())
const categories = ref(['编程开发', '设计艺术', '语言学习', '数学科学'])

onMounted(() => {
  if (route.query.keyword) {
    searchKeyword.value = route.query.keyword
  }
  handleSearch()
  loadEnrolledIds()
})

async function loadEnrolledIds() {
  try {
    const list = await getEnrolledCourses()
    enrolledIds.value = new Set((list || []).map(c => c.courseId))
  } catch (e) { /* 静默失败 */ }
}

async function handleSearch() {
  try {
    const response = await getCourseList({
      keyword: searchKeyword.value,
      category: selectedCategory.value || undefined,
      status: 'online',
      page: currentPage.value,
      size: pageSize.value
    })
    courses.value = response.courses || []
    totalCount.value = response.total || 0
  } catch (error) {
    ElMessage.error('获取课程列表失败')
    console.error(error)
  }
}

function goToDetail(courseId) {
  router.push(`/student/course/${courseId}`)
}

async function handleEnroll(course) {
  try {
    await enrollCourse(course.courseId)
    ElMessage.success('选课成功！')
    enrolledIds.value.add(course.courseId)
    handleSearch()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '选课失败')
  }
}
</script>

<style scoped>
.course-center {
  width: 100%;
}

.search-filter-section {
  background: white;
  padding: var(--spacing-md);
  border-radius: var(--radius-xl);
  margin-bottom: var(--spacing-md);
}

.search-box {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
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
  padding: var(--spacing-md);
  border-radius: var(--radius-xl);
}

.courses-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: var(--spacing-md);
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--spacing-md);
}

.course-card {
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-base);
  border: 1px solid var(--gray-100);
}

.course-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
  border-color: var(--primary-100);
}

.course-cover {
  position: relative;
  height: 90px;
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

.course-info {
  padding: 6px;
}

.course-category {
  margin-bottom: 4px;
}

.course-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 4px;
  line-height: 1.4;
}

.course-card:hover .course-name {
  color: var(--primary-500);
}

.course-teacher {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
  margin-bottom: 4px;
}

.course-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--gray-500);
  margin-bottom: 4px;
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
