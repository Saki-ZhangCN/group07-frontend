import request from '../utils/request.js'

/**
 * 认证相关API
 */

/**
 * 用户登录
 * @param {Object} data - 登录数据
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @param {string} data.role - 角色 (student/teacher/admin)
 * @returns {Promise} 登录结果
 */
export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

/**
 * 用户登出
 * @returns {Promise} 登出结果
 */
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

/**
 * 获取当前用户信息
 * @returns {Promise} 用户信息
 */
export function getUserInfo() {
  return request({
    url: '/auth/profile',
    method: 'get'
  })
}

/**
 * 修改密码
 * @param {Object} data - 密码数据
 * @param {string} data.oldPassword - 旧密码
 * @param {string} data.newPassword - 新密码
 * @returns {Promise} 修改结果
 */
export function changePassword(data) {
  return request({
    url: '/auth/change-password',
    method: 'post',
    data
  })
}

/**
 * 重置密码
 * @param {Object} data - 重置数据
 * @param {string} data.email - 邮箱
 * @returns {Promise} 重置结果
 */
export function resetPassword(data) {
  return request({
    url: '/auth/reset-password',
    method: 'post',
    data
  })
}

/**
 * 获取验证码
 * @returns {Promise} 验证码图片
 */
export function getCaptcha() {
  return request({
    url: '/auth/captcha',
    method: 'get'
  })
}