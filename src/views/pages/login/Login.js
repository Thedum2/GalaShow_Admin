import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAlert, // (사용 안하면 지워도 됨)
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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { isDev } from 'src/lib/env'

import { login as loginApi } from 'src/api/modules/auth'
import { useAuth } from 'src/auth/AuthContext'
import { getAccessToken } from 'src/api/tokenStorage'

const Login = () => {
  const { login: setAuthed } = useAuth()
  const [idOrEmail, setIdOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)   // 문자열 or null
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

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
      await loginApi({ id: idOrEmail, email: idOrEmail, password })
      setAuthed(getAccessToken())
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        '로그인에 실패했습니다. 입력 정보를 확인하세요.'
      setError(msg) // ← 모달 표시 트리거
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <CModal
        visible={!!error}
        onClose={() => setError(null)}
        backdrop="static"
        keyboard={true}
      >
        <CModalHeader>
          <CModalTitle>로그인 오류</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {error}
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={() => setError(null)}>
            확인
          </CButton>
        </CModalFooter>
      </CModal>

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
                      <h1 style={{ color, fontWeight: weight }}>
                        GALASHOW {isDev ? 'DEV' : 'LIVE'} ADMIN
                      </h1>
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
    </>
  )
}

export default Login
