import React, { useState } from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'

import { login } from 'src/api/modules/auth'
import {isDev} from "src/lib/env";


const Login = () => {
  const [idOrEmail, setIdOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()


  const location = useLocation();
  const nextPath = location.state?.from?.pathname || '/dashboard';
  const color = isDev ? 'purple' : 'red'
  const weight = '1000'
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!idOrEmail || !password) {
      setError('아이디(또는 이메일)와 비밀번호를 입력하세요.')
      return
    }

    try {
      setLoading(true)
      await login({ id: idOrEmail, email: idOrEmail, password });
      navigate(nextPath, { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        '로그인에 실패했습니다. 입력 정보를 확인하세요.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h1>로그인</h1>
                    <p className="text-body-secondary">로그인 하세요</p>

                    {error && (
                      <CAlert color="danger" className="mb-3">
                        {error}
                      </CAlert>
                    )}

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="아이디 또는 이메일"
                        autoComplete="username"
                        value={idOrEmail}
                        onChange={(e) => setIdOrEmail(e.target.value)}
                        disabled={loading}
                      />
                    </CInputGroup>

                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="비밀번호"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSubmit()
                        }}
                        disabled={loading}
                      />
                    </CInputGroup>

                    <CRow>
                      <CCol xs={6}>
                        <CButton
                          color="primary"
                          className="px-4"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? '로그인 중…' : '로그인'}
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>

              <CCard className="text-white bg-primary py-5" style={{ width: '50%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h1 style={{color, fontWeight: weight}}>GALASHOW {isDev ? 'DEV' : 'LIVE'} ADMIN</h1>
                    <p>
                      여기는 갈라쇼 어드민입니다 낄낄
                      여기는 갈라쇼 어드민입니다 낄낄
                      여기는 갈라쇼 어드민입니다 낄낄
                      여기는 갈라쇼 어드민입니다 낄낄
                      여기는 갈라쇼 어드민입니다 낄낄
                    </p>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
