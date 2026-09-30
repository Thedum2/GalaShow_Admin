const ACCESS_KEY = 'accessToken'
const REFRESH_KEY = 'refreshToken'
const EXPIRES_AT_KEY = 'accessTokenExpiresAt'

const STORE = sessionStorage

// 토큰이 저장·삭제될 때 알린다. AuthContext가 로그인 상태와 자동 갱신 타이머를 맞춘다.
export const AUTH_CHANGED_EVENT = 'galashow:auth-changed'
const notify = () => window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))

export const getAccessToken = () => STORE.getItem(ACCESS_KEY)
export const setAccessToken = (token, expiresAt) => {
  STORE.setItem(ACCESS_KEY, token)
  if (expiresAt) STORE.setItem(EXPIRES_AT_KEY, String(expiresAt))
  notify()
}
export const getRefreshToken = () => STORE.getItem(REFRESH_KEY)
export const setRefreshToken = (token) => {
  if (token) STORE.setItem(REFRESH_KEY, token)
}

/** access token 만료 시각(ms). 없거나 해석할 수 없으면 null. */
export const getAccessExpiresAt = () => {
  const value = Date.parse(STORE.getItem(EXPIRES_AT_KEY) ?? '')
  return Number.isFinite(value) ? value : null
}

/**
 * 로그인·갱신 응답을 저장한다. 서버는 갱신 때마다 refresh token을 교체(이전 토큰 폐기)하므로
 * 두 토큰을 항상 함께 바꾼다. 만료 시각은 브라우저 시계 차이를 피하려고 expiresIn을 우선한다.
 */
export const saveTokenBundle = ({ accessToken, refreshToken, expiresIn, accessExpiresAt }) => {
  const expiresAt =
    typeof expiresIn === 'number'
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : accessExpiresAt
  setRefreshToken(refreshToken)
  setAccessToken(accessToken, expiresAt)
}

export const clearTokens = () => {
  STORE.removeItem(ACCESS_KEY)
  STORE.removeItem(REFRESH_KEY)
  STORE.removeItem(EXPIRES_AT_KEY)
  notify()
}
