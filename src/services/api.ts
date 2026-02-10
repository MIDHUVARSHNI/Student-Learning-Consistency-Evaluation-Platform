import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL,
  timeout: 30000,
})

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, name: string, password: string) =>
    api.post('/auth/register', { email, name, password }),
}

export const learnerAPI = {
  getAll: () => api.get('/learners'),
  getById: (id: number) => api.get(`/learners/${id}`),
  create: (userId: number, enrollment: string) =>
    api.post('/learners', { userId, enrollment }),
  update: (id: number, enrollment: string) =>
    api.put(`/learners/${id}`, { enrollment }),
  delete: (id: number) => api.delete(`/learners/${id}`),
}

export const evaluationAPI = {
  getAll: () => api.get('/evaluations'),
  getById: (id: number) => api.get(`/evaluations/${id}`),
  create: (learnerId: number, attendance: number, performance: number, participation: number, assignments: number) =>
    api.post('/evaluations', { learnerId, attendance, performance, participation, assignments }),
  update: (id: number, attendance: number, performance: number, participation: number, assignments: number) =>
    api.put(`/evaluations/${id}`, { attendance, performance, participation, assignments }),
  delete: (id: number) => api.delete(`/evaluations/${id}`),
}

export default api
