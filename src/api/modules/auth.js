import { api } from '../client'
import { unwrap } from '../unwrap'
import { saveTokenBundle, getRefreshToken, clearTokens } from '../tokenStorage'

export async function login({ id, email, password }) {
  if (!password || (!id && !email)) {
    throw new Error('아이디/이메일 또는 비밀번호가 없습니다.')
  }

  const body = { id: id ?? email, email, password }
  const res = await api.post('/auth/login', body)
  const payload = unwrap(res)

  if (!payload?.accessToken) {
    throw new Error('응답에 accessToken이 없습니다.')
  }
  saveTokenBundle(payload)

  return payload.user
}

/** 서버의 refresh token을 폐기한 뒤 로컬 토큰을 지운다. 서버 호출이 실패해도 로그아웃한다. */
export async function logout() {
  const refreshToken = getRefreshToken()
  try {
    if (refreshToken) await api.post('/auth/logout', { refreshToken })
  } catch {
    // 네트워크 오류 등은 무시하고 로컬 로그아웃을 진행한다.
  } finally {
    clearTokens()
  }
}
