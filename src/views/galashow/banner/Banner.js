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
import { getBanners, updateBanner } from 'src/api/modules/banners'

const Banner = () => {
  const [banners, setBanners] = useState([])                 // [{ id, message, order }]
  const [originals, setOriginals] = useState({})             // { [id]: originalMessage }
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState({})                   // { [id]: boolean }
  const [error, setError] = useState(null)                   // string | null
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const rows = await getBanners()                        // 최대 10개
      setBanners(rows)
      const ori = {}
      rows.forEach(r => { ori[r.id] = r.message })
      setOriginals(ori)
    } catch (e) {
      setError('배너 목록을 불러오지 못했습니다.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const onChangeMsg = (id, value) => {
    setBanners(prev => prev.map(b => (b.id === id ? { ...b, message: value } : b)))
  }

  const isDirty = (b) => b.message !== originals[b.id]
  const isSaving = (id) => !!saving[id]
  const hasDirty = banners.some(isDirty)

  const saveBanner = async (id) => {
    const row = banners.find(b => b.id === id)
    if (!row) return
    if (!row.message?.trim()) return

    try {
      setSaving(prev => ({ ...prev, [id]: true }))
      const ok = await updateBanner({ bannerId: id, message: row.message })
      if (ok) {
        setOriginals(prev => ({ ...prev, [id]: row.message }))
      } else {
        setError('저장에 실패했습니다.')
      }
    } catch (e) {
      setError('저장 중 오류가 발생했습니다.')
      console.error(e)
    } finally {
      setSaving(prev => ({ ...prev, [id]: false }))
    }
  }

  const resetAll = () => {
    setBanners(prev => prev.map(b => ({ ...b, message: originals[b.id] })))
    setShowResetConfirm(false)
  }

  return (
    <>
      <CModal
        visible={!!error}
        onClose={() => setError(null)}
        backdrop="static"
        keyboard
      >
        <CModalHeader>
          <CModalTitle>오류</CModalTitle>
        </CModalHeader>
        <CModalBody>{error}</CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={() => setError(null)}>확인</CButton>
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
        <CModalBody>
          변경한 배너 문구를 모두 원래대로 되돌릴까요?
        </CModalBody>
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
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>배너 관리</h2>
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
              </div>
            </div>
          </CCardHeader>

          <CCardBody>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col" style={{ width: 80 }}>ID</CTableHeaderCell>
                  <CTableHeaderCell scope="col">배너 문구</CTableHeaderCell>
                  <CTableHeaderCell scope="col" style={{ width: 140 }}>Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {loading ? (
                  Array.from({ length: 10 }, (_, i) => (
                    <CTableRow key={`skeleton-${i}`}>
                      <CTableDataCell className="text-muted">—</CTableDataCell>
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
                  banners.map((b) => {
                    const dirty = isDirty(b)
                    const disabled = !dirty || isSaving(b.id) || !b.message?.trim()

                    return (
                      <CTableRow key={b.id}>
                        <CTableDataCell>{b.id}</CTableDataCell>
                        <CTableDataCell>
                          <CFormInput
                            value={b.message}
                            onChange={(e) => onChangeMsg(b.id, e.target.value)}
                            disabled={isSaving(b.id)}
                          />
                        </CTableDataCell>
                        <CTableDataCell>
                          {/* 저장 버튼 배경 안 보이는 문제 해결:
                              더티일 때는 variant를 주지 않고 color만 지정 (기본 solid)
                              더티가 아닐 때만 outline 사용 */}
                          <CButton
                            color={dirty ? 'primary' : 'secondary'}
                            {...(!dirty ? { variant: 'outline' } : {})}
                            size="sm"
                            disabled={disabled}
                            onClick={() => saveBanner(b.id)}
                          >
                            {isSaving(b.id) ? (
                              <>
                                <CSpinner size="sm" className="me-2" /> 저장중
                              </>
                            ) : dirty ? '저장' : '저장됨'}
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    )
                  })
                )}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CContainer>
    </>
  )
}

export default React.memo(Banner)
