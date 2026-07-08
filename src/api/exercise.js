import request from '../utils/request.js'
export const createExercise = data => request({ url: '/exercises', method: 'post', data })
export const getTrainingCourses = () => request({ url: '/exercises/training/courses', method: 'get' })
export const startTraining = courseId => request({ url: '/exercises/training/start', method: 'post', data: { courseId } })
export const answerTraining = (id, data) => request({ url: `/exercises/training/${id}/answer`, method: 'post', data })
export const finishTraining = id => request({ url: `/exercises/training/${id}/finish`, method: 'post' })
export const cancelTraining = id => request({ url: `/exercises/training/${id}/cancel`, method: 'post' })
