import { api as client } from '../client'
import { unwrap } from '../unwrap'

export const questionCategories = {
  getAll: async () => {
    const res = await client.get('/question-categories')
    return unwrap(res)
  },
  create: async (name) => {
    const res = await client.post('/question-categories', { name })
    return unwrap(res)
  },
  update: async (categoryId, name) => {
    const res = await client.put(`/question-categories/${categoryId}`, { name })
    return unwrap(res)
  },
  remove: async (categoryId) => {
    const res = await client.delete(`/question-categories/${categoryId}`)
    return unwrap(res)
  },
  getQuestionsByCategoryId: async (categoryId, limit, shuffle) => {
    const res = await client.get(`/question-categories/${categoryId}`, {
      params: { limit, shuffle },
    })
    return unwrap(res)
  },
}

export const questions = {
  getRandom: async (count) => {
    const res = await client.get('/questions/random', { params: { count } })
    return unwrap(res)
  },
  getById: async (questionId) => {
    const res = await client.get(`/questions/${questionId}`)
    return unwrap(res)
  },
  create: async (categoryId, title, choices) => {
    const res = await client.post('/questions', { categoryId, title, choices })
    return unwrap(res)
  },
  update: async (questionId, title, choices) => {
    const res = await client.put(`/questions/${questionId}`, { title, choices })
    return unwrap(res)
  },
  remove: async (questionId) => {
    const res = await client.delete(`/questions/${questionId}`)
    return unwrap(res)
  },
}
