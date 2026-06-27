import request from '../utils/request.js'

/**
 * 作业相关API
 */

/**
 * 获取作业列表（学员）
 * @param {Object} params - 查询参数
 * @returns {Promise} 作业列表
 */
export function getHomeworkList(params) {
  return request({
    url: '/homework',
    method: 'get',
    params
  })
}

/**
 * 获取作业详情
 * @param {string} id - 作业ID
 * @returns {Promise} 作业详情
 */
export function getHomeworkDetail(id) {
  return request({
    url: `/homework/${id}`,
    method: 'get'
  })
}

/**
 * 提交作业
 * @param {string} id - 作业ID
 * @param {Object} data - 答题数据
 * @returns {Promise} 提交结果
 */
export function submitHomework(id, data) {
  return request({
    url: `/homework/${id}/submit`,
    method: 'post',
    data
  })
}

/**
 * 获取作业结果
 * @param {string} id - 作业ID
 * @returns {Promise} 作业结果
 */
export function getHomeworkResult(id) {
  return request({
    url: `/homework/${id}/result`,
    method: 'get'
  })
}

/**
 * 创建作业（讲师）
 * @param {Object} data - 作业数据
 * @returns {Promise} 创建结果
 */
export function createHomework(data) {
  return request({
    url: '/homework',
    method: 'post',
    data
  })
}

/**
 * 更新作业（讲师）
 * @param {string} id - 作业ID
 * @param {Object} data - 作业数据
 * @returns {Promise} 更新结果
 */
export function updateHomework(id, data) {
  return request({
    url: `/homework/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除作业（讲师）
 * @param {string} id - 作业ID
 * @returns {Promise} 删除结果
 */
export function deleteHomework(id) {
  return request({
    url: `/homework/${id}`,
    method: 'delete'
  })
}

/**
 * 获取待批改作业列表（讲师）
 * @param {Object} params - 查询参数
 * @returns {Promise} 待批改列表
 */
export function getPendingSubmissions(params) {
  return request({
    url: '/homework/submissions/pending',
    method: 'get',
    params
  })
}

/**
 * 获取作业提交详情（讲师）
 * @param {string} submissionId - 提交ID
 * @returns {Promise} 提交详情
 */
export function getSubmissionDetail(submissionId) {
  return request({
    url: `/homework/submissions/${submissionId}`,
    method: 'get'
  })
}

/**
 * 批改作业（讲师）
 * @param {string} submissionId - 提交ID
 * @param {Object} data - 批改数据
 * @returns {Promise} 批改结果
 */
export function gradeSubmission(submissionId, data) {
  return request({
    url: `/homework/submissions/${submissionId}/grade`,
    method: 'post',
    data
  })
}

/**
 * 批量打回作业（讲师）
 * @param {Array} submissionIds - 提交ID列表
 * @returns {Promise} 打回结果
 */
export function batchRejectSubmissions(submissionIds) {
  return request({
    url: '/homework/submissions/batch-reject',
    method: 'post',
    data: { submissionIds }
  })
}

/**
 * 获取作业统计（讲师）
 * @param {string} homeworkId - 作业ID
 * @returns {Promise} 统计数据
 */
export function getHomeworkStats(homeworkId) {
  return request({
    url: `/homework/${homeworkId}/stats`,
    method: 'get'
  })
}

/**
 * 获取错题本
 * @returns {Promise} 错题列表
 */
export function getWrongBook() {
  return request({
    url: '/homework/wrong-book',
    method: 'get'
  })
}

/**
 * 重做错题
 * @param {string} questionId - 题目ID
 * @param {Object} data - 答题数据
 * @returns {Promise} 结果
 */
export function retryWrongQuestion(questionId, data) {
  return request({
    url: `/homework/wrong-book/${questionId}/retry`,
    method: 'post',
    data
  })
}