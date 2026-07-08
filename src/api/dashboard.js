import request from '../utils/request.js'

/**
 * 数据看板相关API（运营端）
 */

/**
 * 获取核心统计指标
 * @returns {Promise} 统计数据
 */
export function getDashboardStats() {
  return request({
    url: '/dashboard/stats',
    method: 'get'
  })
}

/**
 * 获取完课率统计
 * @param {Object} params - 查询参数
 * @returns {Promise} 完课率数据
 */
export function getCompletionRate(params) {
  return request({
    url: '/dashboard/completion-rate',
    method: 'get',
    params
  })
}

/**
 * 获取活跃度趋势
 * @param {Object} params - 查询参数
 * @returns {Promise} 活跃度数据
 */
export function getActivityTrend(params) {
  return request({
    url: '/dashboard/activity-trend',
    method: 'get',
    params
  })
}

/**
 * 获取课程排行榜
 * @param {Object} params - 查询参数
 * @returns {Promise} 排行榜数据
 */
export function getCourseRanking(params) {
  return request({
    url: '/dashboard/course-ranking',
    method: 'get',
    params
  })
}

/**
 * 获取作业统计
 * @param {Object} params - 查询参数
 * @returns {Promise} 作业统计数据
 */
export function getHomeworkStatistics(params) {
  return request({
    url: '/dashboard/homework-stats',
    method: 'get',
    params
  })
}

/**
 * 导出统计报表
 * @param {Object} params - 导出参数
 * @returns {Promise} 导出结果
 */
export function exportStatistics(params) {
  return request({
    url: '/dashboard/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}