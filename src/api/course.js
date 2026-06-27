import request from '../utils/request.js'

/**
 * 课程相关API
 */

/**
 * 获取课程列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页数量
 * @param {string} params.category - 分类
 * @param {string} params.keyword - 关键词
 * @returns {Promise} 课程列表
 */
export function getCourseList(params) {
  return request({
    url: '/courses',
    method: 'get',
    params
  })
}

/**
 * 获取课程详情
 * @param {string} id - 课程ID
 * @returns {Promise} 课程详情
 */
export function getCourseDetail(id) {
  return request({
    url: `/courses/${id}`,
    method: 'get'
  })
}

/**
 * 选课
 * @param {string} courseId - 课程ID
 * @returns {Promise} 选课结果
 */
export function enrollCourse(courseId) {
  return request({
    url: `/courses/${courseId}/enroll`,
    method: 'post'
  })
}

/**
 * 退课
 * @param {string} courseId - 课程ID
 * @returns {Promise} 退课结果
 */
export function withdrawCourse(courseId) {
  return request({
    url: `/courses/${courseId}/withdraw`,
    method: 'post'
  })
}

/**
 * 获取已选课程列表
 * @returns {Promise} 已选课程列表
 */
export function getEnrolledCourses() {
  return request({
    url: '/courses/enrolled',
    method: 'get'
  })
}

/**
 * 获取课程章节列表
 * @param {string} courseId - 课程ID
 * @returns {Promise} 章节列表
 */
export function getCourseChapters(courseId) {
  return request({
    url: `/courses/${courseId}/chapters`,
    method: 'get'
  })
}

/**
 * 获取课程评价列表
 * @param {string} courseId - 课程ID
 * @param {Object} params - 查询参数
 * @returns {Promise} 评价列表
 */
export function getCourseReviews(courseId, params) {
  return request({
    url: `/courses/${courseId}/reviews`,
    method: 'get',
    params
  })
}

/**
 * 提交课程评价
 * @param {string} courseId - 课程ID
 * @param {Object} data - 评价数据
 * @returns {Promise} 提交结果
 */
export function submitCourseReview(courseId, data) {
  return request({
    url: `/courses/${courseId}/reviews`,
    method: 'post',
    data
  })
}

/**
 * 收藏课程
 * @param {string} courseId - 课程ID
 * @returns {Promise} 收藏结果
 */
export function favoriteCourse(courseId) {
  return request({
    url: `/courses/${courseId}/favorite`,
    method: 'post'
  })
}

/**
 * 取消收藏
 * @param {string} courseId - 课程ID
 * @returns {Promise} 取消结果
 */
export function unfavoriteCourse(courseId) {
  return request({
    url: `/courses/${courseId}/unfavorite`,
    method: 'post'
  })
}

/**
 * 创建课程（讲师）
 * @param {Object} data - 课程数据
 * @returns {Promise} 创建结果
 */
export function createCourse(data) {
  return request({
    url: '/courses',
    method: 'post',
    data
  })
}

/**
 * 更新课程（讲师）
 * @param {string} id - 课程ID
 * @param {Object} data - 课程数据
 * @returns {Promise} 更新结果
 */
export function updateCourse(id, data) {
  return request({
    url: `/courses/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除课程（讲师）
 * @param {string} id - 课程ID
 * @returns {Promise} 删除结果
 */
export function deleteCourse(id) {
  return request({
    url: `/courses/${id}`,
    method: 'delete'
  })
}

/**
 * 提交课程审核（讲师）
 * @param {string} id - 课程ID
 * @returns {Promise} 提交结果
 */
export function submitCourseForReview(id) {
  return request({
    url: `/courses/${id}/submit-review`,
    method: 'post'
  })
}

/**
 * 获取讲师的课程列表
 * @returns {Promise} 课程列表
 */
export function getTeacherCourses() {
  return request({
    url: '/courses/teacher',
    method: 'get'
  })
}