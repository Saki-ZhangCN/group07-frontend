import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCourseStore = defineStore('course', () => {
  const courseList = ref([])
  const currentCourse = ref(null)
  const learningProgress = ref({})
  const enrolledCourses = ref([])

  const totalProgress = computed(() => {
    if (!currentCourse.value) return 0
    const courseId = currentCourse.value.id
    const chapters = currentCourse.value.chapters || []
    if (chapters.length === 0) return 0
    
    const completedCount = chapters.filter(ch => 
      learningProgress.value[courseId]?.[ch.id]?.completed
    ).length
    return Math.round((completedCount / chapters.length) * 100)
  })

  function setCourseList(list) {
    courseList.value = list
  }

  function setCurrentCourse(course) {
    currentCourse.value = course
  }

  function setEnrolledCourses(list) {
    enrolledCourses.value = list
  }

  function updateProgress(courseId, chapterId, position, completed = false) {
    if (!learningProgress.value[courseId]) {
      learningProgress.value[courseId] = {}
    }
    learningProgress.value[courseId][chapterId] = {
      position,
      completed,
      updatedAt: new Date().toISOString()
    }
  }

  function getProgress(courseId, chapterId) {
    return learningProgress.value[courseId]?.[chapterId]?.position || 0
  }

  function isChapterCompleted(courseId, chapterId) {
    return learningProgress.value[courseId]?.[chapterId]?.completed || false
  }

  function reset() {
    courseList.value = []
    currentCourse.value = null
    learningProgress.value = {}
  }

  return {
    courseList,
    currentCourse,
    learningProgress,
    enrolledCourses,
    totalProgress,
    setCourseList,
    setCurrentCourse,
    setEnrolledCourses,
    updateProgress,
    getProgress,
    isChapterCompleted,
    reset
  }
})