import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))
  const userRole = ref(localStorage.getItem('userRole') || '')

  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.name || '')

  function login(data) {
    token.value = data.token
    userInfo.value = data.user
    userRole.value = data.role
    localStorage.setItem('token', data.token)
    localStorage.setItem('userInfo', JSON.stringify(data.user))
    localStorage.setItem('userRole', data.role)
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    userRole.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('userRole')
  }

  function updateUserInfo(info) {
    userInfo.value = { ...userInfo.value, ...info }
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
  }

  return {
    token,
    userInfo,
    userRole,
    isLoggedIn,
    userName,
    login,
    logout,
    updateUserInfo
  }
})