import request from '../utils/request.js'

export function getMemberAnnouncements() {
  return request({ url: '/announcements', method: 'get' })
}

export function markAnnouncementRead(id) {
  return request({ url: `/announcements/${id}/read`, method: 'post' })
}
