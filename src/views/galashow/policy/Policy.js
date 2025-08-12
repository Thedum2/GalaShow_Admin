import React, { useCallback, useEffect, useMemo, useState } from 'react'
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
import { getPolicies, updatePolicies } from 'src/api/modules/policy'

const ROWS = [
  { key: 'tos', name: '이용약관 (Terms of Service)' },
  { key: 'pp',  name: '개인정보 처리방침 (Privacy Policy)' },
]

function isValidUrl(str) {
  try {
    const u = new URL(str)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch { return false }
}

const Policy = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState(null)

  const [orig, setOrig]   = useState({ tos: '', pp: '' })
  const [edits, setEdits] = useState({ tos: '', pp: '' })

  const [showReset, setShowReset] = useState(false)
  const [showSave, setShowSave]   = useState(false)
  const [preview, setPreview]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const p = await getPolicies()
      const tos = p.termsOfService ?? ''
      const pp  = p.privacyPolicy ?? ''
      setOrig({ tos, pp })
      setEdits({ tos, pp })
    } catch (e) {
      console.error(e)
      setError('정책 정보를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const dirty = useMemo(() =>
      (orig.tos !== edits.tos) || (orig.pp !== edits.pp)
    , [orig, edits])

  const bothValid = useMemo(() =>
      isValidUrl(edits.tos.trim()) && isValidUrl(edits.pp.trim())
    , [edits])

  const canSave = dirty && bothValid && !saving && !loading

  const onChange = useCallback((key, v) => {
    setEdits(prev => ({ ...prev, [key]: v }))
  }, [])

  const openPreview = useCallback((key) => {
    const row = ROWS.find(r => r.key === key)
    if (!row) return
    const url = edits[key]?.trim() || ''
    setPreview({ key, url, name: row.name })
  }, [edits])

  const confirmSave = useCallback(() => {
    setShowSave(true)
  }, [])

  const doSave = useCallback(async () => {
    try {
      setSaving(true)
      setShowSave(false)
      const ok = await updatePolicies({
        termsOfService: edits.tos.trim(),
        privacyPolicy:  edits.pp.trim(),
      })
      if (!ok) throw new Error('save failed')
      setOrig({ ...edits }) // 동기화
    } catch (e) {
      console.error(e)
      setError('저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }, [edits])

  const resetAll = useCallback(() => {
    setEdits({ ...orig })
    setShowReset(false)
  }, [orig])

  return (
    <>
        <CModal visible={!!error} onClose={() => setError(null)} backdrop="static" keyboard>
        <CModalHeader><CModalTitle>오류</CModalTitle></CModalHeader>
        <CModalBody>{error}</CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={() => setError(null)}>확인</CButton>
        </CModalFooter>
      </CModal>

      {/* Reset Confirm */}
      <CModal visible={showReset} onClose={() => setShowReset(false)} backdrop="static" keyboard>
        <CModalHeader><CModalTitle>전부 초기화</CModalTitle></CModalHeader>
        <CModalBody>두 링크를 모두 원래대로 되돌릴까요?</CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setShowReset(false)}>취소</CButton>
          <CButton color="primary" onClick={resetAll}>초기화</CButton>
        </CModalFooter>
      </CModal>

      {/* Save Confirm */}
      <CModal visible={showSave} onClose={() => setShowSave(false)} backdrop="static" keyboard>
        <CModalHeader><CModalTitle>저장 확인</CModalTitle></CModalHeader>
        <CModalBody>
          <div className="small">
            <div className="mb-2"><strong>이용약관</strong><br /><code style={{wordBreak:'break-all'}}>{edits.tos}</code></div>
            <div><strong>개인정보 처리방침</strong><br /><code style={{wordBreak:'break-all'}}>{edits.pp}</code></div>
          </div>
          <div className="text-secondary mt-3">※ 두 링크는 함께 저장됩니다.</div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setShowSave(false)}>취소</CButton>
          <CButton color="primary" disabled={!bothValid || saving} onClick={doSave}>
            {saving ? <><CSpinner size="sm" className="me-2" /> 저장중</> : '저장'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Preview Modal */}
      <CModal
        visible={!!preview}
        onClose={() => setPreview(null)}
        size="lg"
        backdrop="static"
        keyboard
      >
        <CModalHeader>
          <CModalTitle>PDF 미리보기</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {preview && (
            <div>
              <div className="mb-2">
                <div className="text-secondary" style={{ fontSize: 14 }}>
                  {preview.name}
                </div>
                <code style={{ wordBreak: 'break-all' }}>{preview.url}</code>
              </div>
              {!isValidUrl(preview.url) ? (
                <div className="text-danger">올바른 URL을 입력해주세요.</div>
              ) : (
                <div style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
                  {/* 주: 교차 출처 정책으로 로딩 에러를 감지하지 못할 수 있습니다 */}
                  <iframe
                    title="policy-pdf-preview"
                    src={preview.url}
                    style={{ width: '100%', height: 520, border: 0 }}
                  />
                </div>
              )}
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={() => setPreview(null)}>닫기</CButton>
        </CModalFooter>
      </CModal>

      <CContainer className="mt-4">
        <CCard>
          <CCardHeader>
            <div className="d-flex align-items-center justify-content-between" style={{ gap: 12 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>정책 관리</h2>
              <div className="d-flex" style={{ gap: 8 }}>
                <CButton color="secondary" variant="outline" size="sm" onClick={load} disabled={loading || saving}>
                  새로고침
                </CButton>
                <CButton
                  color={dirty ? 'warning' : 'secondary'}
                  {...(!dirty ? { variant: 'outline' } : {})}
                  size="sm"
                  onClick={() => setShowReset(true)}
                  disabled={!dirty || loading || saving}
                >
                  전부 초기화
                </CButton>
                <CButton
                  color="primary"
                  size="sm"
                  disabled={!canSave}
                  onClick={confirmSave}
                  title={!bothValid ? '두 링크 모두 올바른 URL이어야 합니다.' : undefined}
                >
                  {saving ? <><CSpinner size="sm" className="me-2" /> 저장중</> : '저장'}
                </CButton>
              </div>
            </div>
          </CCardHeader>

          <CCardBody>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style={{ width: 60 }}>#</CTableHeaderCell>
                  <CTableHeaderCell>정책</CTableHeaderCell>
                  <CTableHeaderCell>PDF 링크(URL)</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 150 }}>미리보기</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {loading ? (
                  ROWS.map((r, i) => (
                    <CTableRow key={`sk-${r.key}`}>
                      <CTableDataCell className="text-muted">{i+1}</CTableDataCell>
                      <CTableDataCell>{r.name}</CTableDataCell>
                      <CTableDataCell><div className="placeholder col-12" style={{ height: 38 }} /></CTableDataCell>
                      <CTableDataCell className="text-center"><CSpinner size="sm" /></CTableDataCell>
                    </CTableRow>
                  ))
                ) : (
                  ROWS.map((r, i) => (
                    <CTableRow key={r.key}>
                      <CTableDataCell>{i+1}</CTableDataCell>
                      <CTableDataCell>{r.name}</CTableDataCell>
                      <CTableDataCell>
                        <CFormInput
                          type="url"
                          placeholder="https://example.com/policy.pdf"
                          value={edits[r.key] || ''}
                          onChange={(e) => onChange(r.key, e.target.value)}
                          disabled={saving}
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="secondary"
                          variant="outline"
                          size="sm"
                          onClick={() => openPreview(r.key)}
                          disabled={!isValidUrl((edits[r.key] || '').trim())}
                        >
                          미리보기
                        </CButton>
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

export default React.memo(Policy)
