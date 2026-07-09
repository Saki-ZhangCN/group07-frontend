import request from '../utils/request.js'

/**
 * 学情分析相关API
 */

/**
 * 获取学员学习报告
 * @returns {Promise} 学习报告数据
 */
export function getLearningReport() {
  return request({
    url: '/analysis/report',
    method: 'get'
  })
}

export function getAiStudentReport(params) {
  return request({
    url: '/analysis/ai/student-report',
    method: 'get',
    params
  })
}

/**
 * 获取学习时长统计
 * @param {Object} params - 查询参数
 * @returns {Promise} 学习时长数据
 */
export function getStudyTimeStats(params) {
  return request({
    url: '/analysis/study-time',
    method: 'get',
    params
  })
}

/**
 * 获取作业正确率趋势
 * @param {Object} params - 查询参数
 * @returns {Promise} 正确率趋势数据
 */
export function getAccuracyTrend(params) {
  return request({
    url: '/analysis/accuracy-trend',
    method: 'get',
    params
  })
}

/**
 * 获取班级学情数据（讲师）
 * @param {string} courseId - 课程ID
 * @returns {Promise} 班级学情数据
 */
export function getClassLearningData(courseId) {
  return request({
    url: `/analysis/class/${courseId}`,
    method: 'get'
  })
}

export function getAiClassReport(courseId) {
  return request({
    url: `/analysis/ai/class/${courseId}`,
    method: 'get'
  })
}

/**
 * 获取知识点热力图（讲师）
 * @param {string} courseId - 课程ID
 * @returns {Promise} 热力图数据
 */
export function getKnowledgeHeatmap(courseId) {
  return request({
    url: `/analysis/heatmap/${courseId}`,
    method: 'get'
  })
}

/**
 * 获取学员详细学情（讲师）
 * @param {string} studentId - 学员ID
 * @param {string} courseId - 课程ID
 * @returns {Promise} 学员学情数据
 */
export function getStudentDetail(studentId, courseId) {
  return request({
    url: `/analysis/student/${studentId}/course/${courseId}`,
    method: 'get'
  })
}

/**
 * 上传线下成绩（讲师）
 * @param {Object} data - 成绩数据
 * @returns {Promise} 上传结果
 */
export function uploadOfflineScore(data) {
  return request({
    url: '/analysis/offline-score',
    method: 'post',
    data
  })
}

/**
 * 上报学习时长（视频观看或PDF阅读）
 * @param {Object} data - 时长数据
 * @param {string} data.courseId - 课程ID
 * @param {string} [data.chapterId] - 章节ID
 * @param {string} data.resourceType - 资源类型（video/pdf）
 * @param {string} [data.resourceId] - 资源ID
 * @param {number} data.duration - 学习时长（秒）
 * @returns {Promise} 上报结果
 */
export function reportStudyDuration(data) {
  return request({
    url: '/analysis/report-study-duration',
    method: 'post',
    data
  })
}

export function getCourseProgress(courseId) {
  return request({ url: `/analysis/course-progress/${courseId}`, method: 'get' })
}

export function completeLearningResource(data) {
  return request({ url: '/analysis/resource-complete', method: 'post', data })
}
