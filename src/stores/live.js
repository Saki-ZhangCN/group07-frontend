import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useLiveStore = defineStore('live', () => {
  const roomInfo = ref(null)
  const isConnected = ref(false)
  const chatMessages = ref([])
  const whiteboardData = ref([])
  const signStatus = ref(null)
  const voteStatus = ref(null)
  const handUpList = ref([])
  const participantList = ref([])

  const isLive = computed(() => roomInfo.value?.status === 'live')
  const messageCount = computed(() => chatMessages.value.length)

  function setRoomInfo(info) {
    roomInfo.value = info
  }

  function setConnected(status) {
    isConnected.value = status
  }

  function addChatMessage(message) {
    chatMessages.value.push({
      ...message,
      timestamp: new Date().toISOString()
    })
  }

  function clearChatMessages() {
    chatMessages.value = []
  }

  function addWhiteboardData(data) {
    whiteboardData.value.push(data)
  }

  function clearWhiteboardData() {
    whiteboardData.value = []
  }

  function setSignStatus(status) {
    signStatus.value = status
  }

  function setVoteStatus(status) {
    voteStatus.value = status
  }

  function addHandUp(userId, userName) {
    handUpList.value.push({ userId, userName, timestamp: new Date().toISOString() })
  }

  function removeHandUp(userId) {
    handUpList.value = handUpList.value.filter(h => h.userId !== userId)
  }

  function setParticipantList(list) {
    participantList.value = list
  }

  function reset() {
    roomInfo.value = null
    isConnected.value = false
    chatMessages.value = []
    whiteboardData.value = []
    signStatus.value = null
    voteStatus.value = null
    handUpList.value = []
    participantList.value = []
  }

  return {
    roomInfo,
    isConnected,
    chatMessages,
    whiteboardData,
    signStatus,
    voteStatus,
    handUpList,
    participantList,
    isLive,
    messageCount,
    setRoomInfo,
    setConnected,
    addChatMessage,
    clearChatMessages,
    addWhiteboardData,
    clearWhiteboardData,
    setSignStatus,
    setVoteStatus,
    addHandUp,
    removeHandUp,
    setParticipantList,
    reset
  }
})