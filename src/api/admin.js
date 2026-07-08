import request from '../utils/request.js'

/**
 * 运营管理相关API
 */

/**
 * 获取用户列表
 * @param {Object} params - 查询参数
 * @returns {Promise} 用户列表
 */
export function getUserList(params) {
  return request({
    url: '/admin/users',
    method: 'get',
    params
  })
}

/**
 * 创建用户
 * @param {Object} data - 用户数据
 * @returns {Promise} 创建结果
 */
export function createUser(data) {
  return request({
    url: '/admin/users',
    method: 'post',
    data
  })
}

/**
 * 更新用户
 * @param {string} id - 用户ID
 * @param {Object} data - 用户数据
 * @returns {Promise} 更新结果
 */
export function updateUser(id, data) {
  return request({
    url: `/admin/users/${id}`,
    method: 'put',
    data
  })
}

/**
 * 重置用户密码
 * @param {string} id - 用户ID
 * @returns {Promise} 重置结果
 */
export function resetUserPassword(id) {
  return request({
    url: `/admin/users/${id}/reset-password`,
    method: 'post'
  })
}

/**
 * 删除用户
 * @param {string} id - 用户ID
 * @returns {Promise} 删除结果
 */
export function deleteUser(id) {
  return request({
    url: `/admin/users/${id}`,
    method: 'delete'
  })
}

/**
 * 导出用户数据
 * @param {Object} params - 导出参数
 * @returns {Promise} 导出结果
 */
export function exportUsers(params) {
  return request({
    url: '/admin/users/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

/**
 * 获取待审核课程列表
 * @param {Object} params - 查询参数
 * @returns {Promise} 待审核列表
 */
export function getPendingCourses(params) {
  return request({
    url: '/admin/courses/pending',
    method: 'get',
    params
  })
}

/**
 * 获取课程详情
 * @param {string} courseId - 课程ID
 * @returns {Promise} 课程详情
 */
export function getCourseDetail(courseId) {
  return request({
    url: `/courses/${courseId}`,
    method: 'get'
  })
}

/**
 * 审核课程
 * @param {string} courseId - 课程ID
 * @param {Object} data - 审核数据
 * @returns {Promise} 审核结果
 */
export function auditCourse(courseId, data) {
  return request({
    url: `/admin/courses/${courseId}/audit`,
    method: 'post',
    data
  })
}

/**
 * 上架课程
 * @param {string} courseId - 课程ID
 * @returns {Promise} 上架结果
 */
export function publishCourse(courseId) {
  return request({
    url: `/admin/courses/${courseId}/publish`,
    method: 'post'
  })
}

/**
 * 下架课程
 * @param {string} courseId - 课程ID
 * @returns {Promise} 下架结果
 */
export function unpublishCourse(courseId) {
  return request({
    url: `/admin/courses/${courseId}/unpublish`,
    method: 'post'
  })
}

/**
 * 获取公告列表
 * @param {Object} params - 查询参数
 * @returns {Promise} 公告列表
 */
export function getAnnouncementList(params) {
  return request({
    url: '/admin/announcements',
    method: 'get',
    params
  })
}

/**
 * 创建公告
 * @param {Object} data - 公告数据
 * @returns {Promise} 创建结果
 */
export function createAnnouncement(data) {
  return request({
    url: '/admin/announcements',
    method: 'post',
    data
  })
}

/**
 * 更新公告
 * @param {string} id - 公告ID
 * @param {Object} data - 公告数据
 * @returns {Promise} 更新结果
 */
export function updateAnnouncement(id, data) {
  return request({
    url: `/admin/announcements/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除公告
 * @param {string} id - 公告ID
 * @returns {Promise} 删除结果
 */
export function deleteAnnouncement(id) {
  return request({
    url: `/admin/announcements/${id}`,
    method: 'delete'
  })
}

/**
 * 获取题库列表
 * @param {Object} params - 查询参数
 * @returns {Promise} 题库列表
 */
export function getQuestionBank(params) {
  return request({
    url: '/admin/questions',
    method: 'get',
    params
  })
}

/**
 * 创建题目
 * @param {Object} data - 题目数据
 * @returns {Promise} 创建结果
 */
export function createQuestion(data) {
  return request({
    url: '/admin/questions',
    method: 'post',
    data
  })
}

/**
 * 更新题目
 * @param {string} id - 题目ID
 * @param {Object} data - 题目数据
 * @returns {Promise} 更新结果
 */
export function updateQuestion(id, data) {
  return request({
    url: `/admin/questions/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除题目
 * @param {string} id - 题目ID
 * @returns {Promise} 删除结果
 */
export function deleteQuestion(id) {
  return request({
    url: `/admin/questions/${id}`,
    method: 'delete'
  })
}