import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { refreshTokens } from 'src/api/client'
import { logout as logoutApi } from 'src/api/modules/auth'
import { AUTH_CHANGED_EVENT, getAccessExpiresAt, getAccessToken } from 'src/api/tokenStorage'

// access token 만료 이만큼 전에 미리 갱신한다.
const REFRESH_BEFORE_MS = 60 * 1000
// 만료 시각을 모르면 이 간격으로 갱신한다.
const FALLBACK_REFRESH_MS = 10 * 60 * 1000

const Ctx = createContext(null)
export const useAuth = () => {
  const v = useContext(Ctx)
  if (!v) throw new Error('AuthProvider missing')
  return v
}

export function AuthProvider({ children }) {
  const [isAuthed, setIsAuthed] = useState(() => Boolean(getAccessToken()))
  const [ready, setReady] = useState(false)

  // 토큰 저장·삭제(로그인, 갱신, 갱신 실패, 로그아웃)를 로그인 상태에 반영한다.
  useEffect(() => {
    const sync = () => setIsAuthed(Boolean(getAccessToken()))
    sync()
    setReady(true)
    window.addEventListener(AUTH_CHANGED_EVENT, sync)
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, sync)
  }, [])

  // 로그인 중에는 access token이 만료되기 전에 자동으로 갱신한다. 갱신 실패 시 토큰이 지워지고
  // RequireAuth가 로그인 화면으로 보낸다. 탭이 다시 보일 때도 만료 여부를 확인한다.
  useEffect(() => {
    if (!isAuthed) return undefined
    let timer
    const schedule = () => {
      clearTimeout(timer)
      const expiresAt = getAccessExpiresAt()
      const delay = expiresAt ? expiresAt - Date.now() - REFRESH_BEFORE_MS : FALLBACK_REFRESH_MS
      timer = setTimeout(
        () => {
          refreshTokens().catch(() => {})
        },
        Math.max(0, delay),
      )
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') schedule()
    }
    schedule()
    window.addEventListener(AUTH_CHANGED_EVENT, schedule)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearTimeout(timer)
      window.removeEventListener(AUTH_CHANGED_EVENT, schedule)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [isAuthed])

  const login = useCallback(() => setIsAuthed(Boolean(getAccessToken())), [])
  const logout = useCallback(() => logoutApi(), [])

  return <Ctx.Provider value={{ isAuthed, ready, login, logout }}>{children}</Ctx.Provider>
}
