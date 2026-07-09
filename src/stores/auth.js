import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUserInfo } from '../api/auth.js'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))
  const userRole = ref(localStorage.getItem('userRole') || '')

  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.realName || '')

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

  async function refreshProfile() {
    if (!token.value) return null
    const profile = await getUserInfo()
    const merged = {
      ...userInfo.value,
      ...profile,
      avatar: profile.avatarUrl || profile.avatar || userInfo.value?.avatar || ''
    }
    userInfo.value = merged
    userRole.value = profile.role || userRole.value
    localStorage.setItem('userInfo', JSON.stringify(merged))
    if (userRole.value) localStorage.setItem('userRole', userRole.value)
    return merged
  }

  return {
    token,
    userInfo,
    userRole,
    isLoggedIn,
    userName,
    login,
    logout,
    updateUserInfo,
    refreshProfile
  }
})
