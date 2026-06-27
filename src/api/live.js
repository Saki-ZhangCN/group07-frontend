import request from '../utils/request.js'

/**
 * 直播相关API
 */

/**
 * 获取直播间信息
 * @param {string} roomId - 直播间ID
 * @returns {Promise} 直播间信息
 */
export function getRoomInfo(roomId) {
  return request({
    url: `/live/rooms/${roomId}`,
    method: 'get'
  })
}

/**
 * 创建直播间（讲师）
 * @param {Object} data - 直播间数据
 * @returns {Promise} 创建结果
 */
export function createRoom(data) {
  return request({
    url: '/live/rooms',
    method: 'post',
    data
  })
}

/**
 * 开始直播（讲师）
 * @param {string} roomId - 直播间ID
 * @returns {Promise} 开始结果
 */
export function startLive(roomId) {
  return request({
    url: `/live/rooms/${roomId}/start`,
    method: 'post'
  })
}

/**
 * 结束直播（讲师）
 * @param {string} roomId - 直播间ID
 * @returns {Promise} 结束结果
 */
export function stopLive(roomId) {
  return request({
    url: `/live/rooms/${roomId}/stop`,
    method: 'post'
  })
}

/**
 * 获取直播推流地址（讲师）
 * @param {string} roomId - 直播间ID
 * @returns {Promise} 推流地址
 */
export function getPushUrl(roomId) {
  return request({
    url: `/live/rooms/${roomId}/push-url`,
    method: 'get'
  })
}

/**
 * 获取直播拉流地址
 * @param {string} roomId - 直播间ID
 * @returns {Promise} 拉流地址
 */
export function getPullUrl(roomId) {
  return request({
    url: `/live/rooms/${roomId}/pull-url`,
    method: 'get'
  })
}

/**
 * 发起签到（讲师）
 * @param {string} roomId - 直播间ID
 * @param {Object} data - 签到数据
 * @returns {Promise} 签到结果
 */
export function createSign(roomId, data) {
  return request({
    url: `/live/rooms/${roomId}/sign`,
    method: 'post',
    data
  })
}

/**
 * 参与签到（学员）
 * @param {string} roomId - 直播间ID
 * @param {string} signId - 签到ID
 * @returns {Promise} 签到结果
 */
export function joinSign(roomId, signId) {
  return request({
    url: `/live/rooms/${roomId}/sign/${signId}/join`,
    method: 'post'
  })
}

/**
 * 发起投票（讲师）
 * @param {string} roomId - 直播间ID
 * @param {Object} data - 投票数据
 * @returns {Promise} 投票结果
 */
export function createVote(roomId, data) {
  return request({
    url: `/live/rooms/${roomId}/vote`,
    method: 'post',
    data
  })
}

/**
 * 参与投票（学员）
 * @param {string} roomId - 直播间ID
 * @param {string} voteId - 投票ID
 * @param {Object} data - 投票选择
 * @returns {Promise} 投票结果
 */
export function submitVote(roomId, voteId, data) {
  return request({
    url: `/live/rooms/${roomId}/vote/${voteId}/submit`,
    method: 'post',
    data
  })
}

/**
 * 举手申请连麦（学员）
 * @param {string} roomId - 直播间ID
 * @returns {Promise} 申请结果
 */
export function requestHandUp(roomId) {
  return request({
    url: `/live/rooms/${roomId}/hand-up`,
    method: 'post'
  })
}

/**
 * 处理连麦申请（讲师）
 * @param {string} roomId - 直播间ID
 * @param {string} userId - 用户ID
 * @param {boolean} approve - 是否同意
 * @returns {Promise} 处理结果
 */
export function handleHandUp(roomId, userId, approve) {
  return request({
    url: `/live/rooms/${roomId}/hand-up/${userId}`,
    method: 'post',
    data: { approve }
  })
}

/**
 * 获取直播回放列表
 * @param {string} courseId - 课程ID
 * @returns {Promise} 回放列表
 */
export function getLiveReplays(courseId) {
  return request({
    url: `/live/replays/${courseId}`,
    method: 'get'
  })
}

/**
 * 获取直播统计信息
 * @param {string} roomId - 直播间ID
 * @returns {Promise} 统计信息
 */
export function getLiveStats(roomId) {
  return request({
    url: `/live/rooms/${roomId}/stats`,
    method: 'get'
  })
}