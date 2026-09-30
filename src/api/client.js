import axios from 'axios'
import { unwrap } from './unwrap'
import { API_BASE_URL } from '../lib/env'
import { getAccessToken, getRefreshToken, saveTokenBundle, clearTokens } from './tokenStorage'

const BASE_URL = API_BASE_URL

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
})

// 인증 헤더와 401 자동 갱신이 필요 없는 경로.
const AUTH_WHITELIST = ['/auth/login', '/auth/logout']

api.interceptors.request.use((config) => {
  const skip = AUTH_WHITELIST.some((p) => config.url?.includes(p))
  const token = getAccessToken()
  if (!skip && token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ----- 401 동시성 제어용 큐 -----
// 동시에 여러 요청이 401을 받아도 refresh는 한 번만 보낸다(서버가 refresh token을 교체하므로).
let refreshing = null

/** refresh token으로 새 access/refresh token을 받아 저장한다. 실패하면 토큰을 지우고 reject한다. */
export function refreshTokens() {
  refreshing ??= (async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) throw new Error('No refresh token')
    const plain = axios.create({ baseURL: BASE_URL, timeout: 15000 })
    const bundle = unwrap(await plain.post('/auth/refresh', { refreshToken })) || {}
    if (!bundle.accessToken) throw new Error('No accessToken in refresh response')
    saveTokenBundle(bundle)
    return bundle.accessToken
  })()
    .catch((error) => {
      clearTokens()
      throw error
    })
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config: original, response } = error

    if (!response || !original) return Promise.reject(error)

    if (
      response.status !== 401 ||
      original._retried ||
      AUTH_WHITELIST.some((p) => original.url?.includes(p))
    ) {
      return Promise.reject(error)
    }

    const accessToken = await refreshTokens()
    original._retried = true
    original.headers = original.headers || {}
    original.headers.Authorization = `Bearer ${accessToken}`
    return api(original)
  },
)
