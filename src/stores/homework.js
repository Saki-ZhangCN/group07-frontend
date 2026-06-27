import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useHomeworkStore = defineStore('homework', () => {
  const homeworkList = ref([])
  const currentHomework = ref(null)
  const submissions = ref([])
  const wrongAnswers = ref([])

  const pendingHomework = computed(() => 
    homeworkList.value.filter(hw => hw.status === 'pending')
  )

  const completedHomework = computed(() => 
    homeworkList.value.filter(hw => hw.status === 'completed')
  )

  function setHomeworkList(list) {
    homeworkList.value = list
  }

  function setCurrentHomework(homework) {
    currentHomework.value = homework
  }

  function updateHomeworkStatus(homeworkId, status, score = null) {
    const hw = homeworkList.value.find(h => h.id === homeworkId)
    if (hw) {
      hw.status = status
      if (score !== null) hw.score = score
    }
  }

  function addWrongAnswer(answer) {
    wrongAnswers.value.push(answer)
  }

  function removeWrongAnswer(questionId) {
    wrongAnswers.value = wrongAnswers.value.filter(w => w.questionId !== questionId)
  }

  function setSubmissions(list) {
    submissions.value = list
  }

  function reset() {
    homeworkList.value = []
    currentHomework.value = null
    submissions.value = []
  }

  return {
    homeworkList,
    currentHomework,
    submissions,
    wrongAnswers,
    pendingHomework,
    completedHomework,
    setHomeworkList,
    setCurrentHomework,
    updateHomeworkStatus,
    addWrongAnswer,
    removeWrongAnswer,
    setSubmissions,
    reset
  }
})