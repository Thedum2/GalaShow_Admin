import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowRight, cilLockLocked, cilUser } from '@coreui/icons'
import GalaBrand from '../../../components/GalaBrand'
import OrbitScene from '../../../components/OrbitScene'
import EnvironmentBadge from '../../../components/EnvironmentBadge'
import { login as loginApi } from 'src/api/modules/auth'
import { useAuth } from 'src/auth/AuthContext'
import { getAccessToken } from 'src/api/tokenStorage'

const Login = () => {
  const { login: setAuthed } = useAuth()
  const [idOrEmail, setIdOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!idOrEmail || !password) {
      setError('아이디(또는 이메일)와 비밀번호를 입력하세요.')
      return
    }
    try {
      setLoading(true)
      await loginApi({ id: idOrEmail, email: idOrEmail, password })
      setAuthed(getAccessToken())
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          '로그인에 실패했습니다. 입력 정보를 확인하세요.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <header className="login-header">
        <GalaBrand />
        <EnvironmentBadge />
      </header>
      <div className="login-layout">
        <section className="login-story" aria-labelledby="welcome-title">
          <p className="eyebrow">
            <span aria-hidden="true">✦</span> BEHIND EVERY GREAT SHOW
          </p>
          <h1 id="welcome-title">
            즐거움을 만드는
            <br />
            <span>당신의 공간.</span>
          </h1>
          <p className="login-story-description">
            함께 웃고, 놀라고, 몰입하는 순간들.
            <br />
            GalaShow의 모든 가능성이 이곳에서 시작됩니다.
          </p>
          <OrbitScene />
          <span className="login-story-caption">IMAGINE MORE. PLAY TOGETHER.</span>
        </section>
        <section className="login-panel" aria-labelledby="login-title">
          <span className="login-welcome-icon" aria-hidden="true">
            ✦
          </span>
          <p className="eyebrow">WELCOME BACK</p>
          <h2 id="login-title">다시 만나 반가워요</h2>
          <p className="login-panel-description">관리자 계정으로 워크스페이스에 입장하세요.</p>
          <CForm onSubmit={handleSubmit}>
            <div className="login-field">
              <CFormLabel htmlFor="admin-username">아이디 또는 이메일</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilUser} />
                </CInputGroupText>
                <CFormInput
                  id="admin-username"
                  name="username"
                  placeholder="아이디 또는 이메일을 입력하세요"
                  autoComplete="username"
                  value={idOrEmail}
                  onChange={(e) => setIdOrEmail(e.target.value)}
                  disabled={loading}
                />
              </CInputGroup>
            </div>
            <div className="login-field">
              <CFormLabel htmlFor="admin-password">비밀번호</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilLockLocked} />
                </CInputGroupText>
                <CFormInput
                  id="admin-password"
                  name="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </CInputGroup>
            </div>
            <CButton color="primary" className="login-submit" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <CSpinner size="sm" /> 로그인 중…
                </>
              ) : (
                <>
                  워크스페이스 입장 <CIcon icon={cilArrowRight} />
                </>
              )}
            </CButton>
          </CForm>
          <p className="login-access-note">
            <CIcon icon={cilLockLocked} size="sm" /> 허가된 관리자만 이용할 수 있습니다.
          </p>
        </section>
      </div>
      <footer className="login-footer">
        <span>© {new Date().getFullYear()} GALASHOW</span>
        <span>작은 상상, 함께하는 즐거움.</span>
      </footer>
      <CModal
        visible={!!error}
        onClose={() => setError(null)}
        backdrop="static"
        keyboard
        aria-labelledby="login-error-title"
      >
        <CModalHeader>
          <CModalTitle id="login-error-title">로그인 오류</CModalTitle>
        </CModalHeader>
        <CModalBody>{error}</CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={() => setError(null)}>
            확인
          </CButton>
        </CModalFooter>
      </CModal>
    </main>
  )
}

export default Login
