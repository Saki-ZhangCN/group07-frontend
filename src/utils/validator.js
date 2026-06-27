/**
 * 表单验证工具
 */

/**
 * 验证是否为空
 * @param {*} value - 待验证值
 * @returns {boolean} 是否为空
 */
export function isEmpty(value) {
  return value === null || value === undefined || value === '' || 
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0)
}

/**
 * 验证手机号
 * @param {string} phone - 手机号
 * @returns {boolean} 是否有效
 */
export function isValidPhone(phone) {
  const reg = /^1[3-9]\d{9}$/
  return reg.test(phone)
}

/**
 * 验证邮箱
 * @param {string} email - 邮箱
 * @returns {boolean} 是否有效
 */
export function isValidEmail(email) {
  const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return reg.test(email)
}

/**
 * 验证密码强度
 * @param {string} password - 密码
 * @returns {Object} 验证结果
 */
export function validatePassword(password) {
  const result = {
    valid: false,
    strength: 'weak',
    message: ''
  }
  
  if (!password || password.length < 6) {
    result.message = '密码长度至少6位'
    return result
  }
  
  if (password.length >= 8) {
    result.strength = 'medium'
  }
  
  if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
    result.strength = 'strong'
  }
  
  result.valid = true
  result.message = '密码验证通过'
  return result
}

/**
 * 验证身份证号
 * @param {string} idCard - 身份证号
 * @returns {boolean} 是否有效
 */
export function isValidIdCard(idCard) {
  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return reg.test(idCard)
}

/**
 * 验证数字范围
 * @param {number} value - 待验证值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {boolean} 是否在范围内
 */
export function isInRange(value, min, max) {
  return value >= min && value <= max
}

/**
 * 验证URL格式
 * @param {string} url - URL
 * @returns {boolean} 是否有效
 */
export function isValidUrl(url) {
  const reg = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
  return reg.test(url)
}