import React, { useState, useEffect, useCallback } from 'react'
import {
  CContainer,
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormInput,
  CButton,
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import { getViewerAvatars, updateViewerAvatars } from 'src/api/modules/avatar'

const Avatar = () => {
  const [avatars, setAvatars] = useState([])
  const [originals, setOriginals] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const rows = await getViewerAvatars()
      // order로 정렬
      const sorted = rows.sort((a, b) => a.order - b.order)
      setAvatars(sorted)
      setOriginals(JSON.parse(JSON.stringify(sorted)))
    } catch (e) {
      setError('아바타 목록을 불러오지 못했습니다.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const onChange = (id, field, value) => {
    setAvatars((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
    )
  }

  const isDirty = () => {
    return JSON.stringify(avatars) !== JSON.stringify(originals)
  }

  const saveAll = async () => {
    try {
      setSaving(true)
      const ok = await updateViewerAvatars(avatars)
      if (ok) {
        setOriginals(JSON.parse(JSON.stringify(avatars)))
      } else {
        setError('저장에 실패했습니다.')
      }
    } catch (e) {
      setError('저장 중 오류가 발생했습니다.')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const resetAll = () => {
    setAvatars(JSON.parse(JSON.stringify(originals)))
    setShowResetConfirm(false)
  }

  const hasDirty = isDirty()

  return (
    <>
      {/* 오류 모달 */}
      <CModal visible={!!error} onClose={() => setError(null)} backdrop="static" keyboard>
        <CModalHeader>
          <CModalTitle>오류</CModalTitle>
        </CModalHeader>
        <CModalBody>{error}</CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={() => setError(null)}>
            확인
          </CButton>
        </CModalFooter>
      </CModal>

      {/* 전부 초기화 확인 모달 */}
      <CModal
        visible={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        backdrop="static"
        keyboard
      >
        <CModalHeader>
          <CModalTitle>전부 초기화</CModalTitle>
        </CModalHeader>
        <CModalBody>변경한 아바타 정보를 모두 원래대로 되돌릴까요?</CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setShowResetConfirm(false)}>
            취소
          </CButton>
          <CButton color="primary" onClick={resetAll}>
            초기화
          </CButton>
        </CModalFooter>
      </CModal>

      <CContainer className="mt-4">
        <CCard>
          <CCardHeader>
            <div className="d-flex align-items-center justify-content-between" style={{ gap: 12 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                시청자 아바타 관리
              </h2>
              <div className="d-flex" style={{ gap: 8 }}>
                <CButton
                  color="secondary"
                  variant="outline"
                  size="sm"
                  onClick={load}
                  disabled={loading}
                >
                  새로고침
                </CButton>
                <CButton
                  color={hasDirty ? 'warning' : 'secondary'}
                  {...(!hasDirty ? { variant: 'outline' } : {})}
                  size="sm"
                  onClick={() => setShowResetConfirm(true)}
                  disabled={!hasDirty || loading}
                  title={!hasDirty ? '변경된 내용이 없습니다' : '변경분 모두 원복'}
                >
                  전부 초기화
                </CButton>
                <CButton
                  color={hasDirty ? 'primary' : 'secondary'}
                  {...(!hasDirty ? { variant: 'outline' } : {})}
                  size="sm"
                  onClick={saveAll}
                  disabled={!hasDirty || saving}
                  title={!hasDirty ? '변경된 내용이 없습니다' : '전체 저장'}
                >
                  {saving ? (
                    <>
                      <CSpinner size="sm" className="me-2" /> 저장중
                    </>
                  ) : (
                    '전체 저장'
                  )}
                </CButton>
              </div>
            </div>
          </CCardHeader>

          <CCardBody>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col" style={{ width: 80 }}>
                    ID
                  </CTableHeaderCell>
                  <CTableHeaderCell scope="col" style={{ width: 100 }}>
                    순서
                  </CTableHeaderCell>
                  <CTableHeaderCell scope="col">이름</CTableHeaderCell>
                  <CTableHeaderCell scope="col">GIF URL</CTableHeaderCell>
                  <CTableHeaderCell scope="col" style={{ width: 150 }}>
                    미리보기
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {loading ? (
                  Array.from({ length: 3 }, (_, i) => (
                    <CTableRow key={`skeleton-${i}`}>
                      <CTableDataCell className="text-muted">—</CTableDataCell>
                      <CTableDataCell>
                        <div className="placeholder-glow">
                          <span className="placeholder col-12" style={{ height: 38, display: 'block' }} />
                        </div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="placeholder-glow">
                          <span className="placeholder col-12" style={{ height: 38, display: 'block' }} />
                        </div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="placeholder-glow">
                          <span className="placeholder col-12" style={{ height: 38, display: 'block' }} />
                        </div>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CSpinner size="sm" />
                      </CTableDataCell>
                    </CTableRow>
                  ))
                ) : (
                  avatars.map((avatar) => (
                    <CTableRow key={avatar.id}>
                      <CTableDataCell>{avatar.id}</CTableDataCell>
                      <CTableDataCell>
                        <CFormInput
                          type="number"
                          value={avatar.order}
                          onChange={(e) => onChange(avatar.id, 'order', parseInt(e.target.value) || 0)}
                          disabled={saving}
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormInput
                          value={avatar.name}
                          onChange={(e) => onChange(avatar.id, 'name', e.target.value)}
                          disabled={saving}
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormInput
                          value={avatar.gifUrl}
                          onChange={(e) => onChange(avatar.id, 'gifUrl', e.target.value)}
                          disabled={saving}
                        />
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        {avatar.gifUrl ? (
                          <img
                            src={avatar.gifUrl}
                            alt={avatar.name}
                            style={{
                              maxWidth: '100px',
                              maxHeight: '100px',
                              objectFit: 'contain',
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                        ) : (
                          <span className="text-muted">미리보기 없음</span>
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CContainer>
    </>
  )
}

export default React.memo(Avatar)
