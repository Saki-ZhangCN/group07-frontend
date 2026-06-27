/**
 * 本地存储操作工具
 */

const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'userInfo'
const USER_ROLE_KEY = 'userRole'

/**
 * 设置Token
 * @param {string} token - JWT Token
 */
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * 获取Token
 * @returns {string|null} Token
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 移除Token
 */
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * 设置用户信息
 * @param {Object} info - 用户信息对象
 */
export function setUserInfo(info) {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(info))
}

/**
 * 获取用户信息
 * @returns {Object|null} 用户信息对象
 */
export function getUserInfo() {
  const info = localStorage.getItem(USER_INFO_KEY)
  return info ? JSON.parse(info) : null
}

/**
 * 移除用户信息
 */
export function removeUserInfo() {
  localStorage.removeItem(USER_INFO_KEY)
}

/**
 * 设置用户角色
 * @param {string} role - 用户角色
 */
export function setUserRole(role) {
  localStorage.setItem(USER_ROLE_KEY, role)
}

/**
 * 获取用户角色
 * @returns {string|null} 用户角色
 */
export function getUserRole() {
  return localStorage.getItem(USER_ROLE_KEY)
}

/**
 * 移除用户角色
 */
export function removeUserRole() {
  localStorage.removeItem(USER_ROLE_KEY)
}

/**
 * 清除所有登录相关数据
 */
export function clearAuthData() {
  removeToken()
  removeUserInfo()
  removeUserRole()
}

/**
 * 设置本地存储数据
 * @param {string} key - 存储键名
 * @param {*} value - 存储值
 */
export function setStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

/**
 * 获取本地存储数据
 * @param {string} key - 存储键名
 * @returns {*} 存储值
 */
export function getStorage(key) {
  const value = localStorage.getItem(key)
  return value ? JSON.parse(value) : null
}

/**
 * 移除本地存储数据
 * @param {string} key - 存储键名
 */
export function removeStorage(key) {
  localStorage.removeItem(key)
}