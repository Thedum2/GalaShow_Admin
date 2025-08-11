// src/views/BackGround.js
import React, { useEffect, useMemo, useState, useCallback } from 'react'
import {
  CContainer, CCard, CCardHeader, CCardBody, CTable, CTableHead, CTableRow,
  CTableHeaderCell, CTableBody, CTableDataCell, CFormInput, CFormSelect,
  CButton, CSpinner, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
} from '@coreui/react'
import { getBackgrounds, updateBackground } from 'src/api/modules/background'

const MAX_ROWS = 3

/**
 * 미리보기 모달 (이미지/비디오 로딩 성공 여부를 내부에서만 관리하고,
 * '확인' 버튼을 눌렀을 때에만 부모에 성공(true) 신호를 올려 저장 가능하게 함)
 */
function PreviewModal({ visible, target, onClose, onConfirm }) {
  // target: { id, title, type: 'image'|'video', url }
  const [ok, setOk] = useState(null) // null|true|false

  useEffect(() => {
    setOk(null) // 대상이 바뀌면 상태 초기화
  }, [target?.type, target?.url])

  if (!visible || !target) return null
  const { id, title, type, url } = target

  const mediaKey = `${type}:${url}` // URL 변경 시 remount 보장
  const commonStyle = { maxWidth: '100%', maxHeight: 420, borderRadius: 8 }

  return (
    <CModal visible onClose={onClose} size="lg" backdrop="static" keyboard>
      <CModalHeader><CModalTitle>미리보기</CModalTitle></CModalHeader>
      <CModalBody>
        <div className="mb-3">
          <div className="text-secondary" style={{ fontSize: 14 }}>
            제목: <strong>{title || '-'}</strong>
          </div>
          <div className="text-secondary" style={{ fontSize: 14 }}>
            타입: <strong>{type}</strong> · URL:{' '}
            <code style={{ wordBreak: 'break-all' }}>{url}</code>
          </div>
        </div>

        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 180 }}>
          {type === 'image' ? (
            <img
              key={mediaKey}
              src={url}
              alt="preview"
              style={commonStyle}
              crossOrigin="anonymous"
              onLoad={() => setOk(true)}
              onError={() => setOk(false)}
            />
          ) : (
            <video
              key={mediaKey}
              src={url}
              style={commonStyle}
              crossOrigin="anonymous"
              controls
              preload="metadata"
              onCanPlay={() => setOk(true)}
              onError={() => setOk(false)}
            />
          )}
        </div>

        <div className="mt-3">
          {ok === null && <span className="text-secondary">로딩 중...</span>}
          {ok === true && <span className="text-success">미리보기 성공</span>}
          {ok === false && <span className="text-danger">미리보기 실패 (URL/타입 확인)</span>}
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" variant="outline" onClick={onClose}>닫기</CButton>
        <CButton
          color="primary"
          disabled={ok !== true}
          onClick={() => {
            onConfirm?.(id, true) // 성공(true)만 부모에 통지
            onClose()
          }}
        >
          확인
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

const BackGround = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [rows, setRows] = useState([])           // [{id,title,type,url}]
  const [originals, setOriginals] = useState({}) // {id: {title,type,url}}
  const [edits, setEdits] = useState({})         // {id: {title,type,url}}
  const [saving, setSaving] = useState({})       // {id: boolean}
  const [previewOk, setPreviewOk] = useState({}) // {id: boolean} - 마지막 프리뷰 성공 여부

  // 모달 상태
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [previewTarget, setPreviewTarget] = useState(null) // {id,title,type,url} | null
  const [saveTarget, setSaveTarget] = useState(null)       // {id,title,type,url} | null

  // 초기 로드
  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await getBackgrounds() // [{ id, title, type, url|file_url }]
      const normalized = (Array.isArray(list) ? list : [])
        .slice(0, MAX_ROWS)
        .map(r => ({
          id: r.id,
          title: r.title ?? '',
          type: r.type ?? 'image', // DB는 image|video
          url: r.file_url ?? r.url ?? '',
        }))

      setRows(normalized)

      const ori = {}
      const ed = {}
      normalized.forEach(x => {
        ori[x.id] = { title: x.title, type: x.type, url: x.url }
        ed[x.id] = { title: x.title, type: x.type, url: x.url }
      })
      setOriginals(ori)
      setEdits(ed)
      setPreviewOk({}) // 프리뷰 상태 초기화
    } catch (e) {
      console.error(e)
      setError('배경 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const dirtyMap = useMemo(() => {
    const m = {}
    for (const r of rows) {
      const o = originals[r.id]
      const e = edits[r.id]
      m[r.id] = !!o && !!e && (o.title !== e.title || o.type !== e.type || o.url !== e.url)
    }
    return m
  }, [rows, originals, edits])

  const hasDirty = useMemo(() => Object.values(dirtyMap).some(Boolean), [dirtyMap])

  // 변경 핸들러
  const onChangeTitle = useCallback((id, v) => {
    setEdits(prev => ({ ...prev, [id]: { ...(prev[id] || {}), title: v } }))
  }, [])
  const onChangeType = useCallback((id, v) => {
    setEdits(prev => ({ ...prev, [id]: { ...(prev[id] || {}), type: v } }))
  }, [])
  const onChangeUrl = useCallback((id, v) => {
    setEdits(prev => ({ ...prev, [id]: { ...(prev[id] || {}), url: v } }))
  }, [])

  // 미리보기(모달 오픈)
  const openPreview = useCallback((id) => {
    const e = edits[id]; if (!e) return
    setPreviewTarget({ id, ...e })
  }, [edits])

  // 미리보기 확인 시(성공 true일 때만) 부모에 반영
  const handlePreviewConfirm = useCallback((id, ok) => {
    if (!ok) return
    setPreviewOk(prev => ({ ...prev, [id]: true }))
  }, [])

  // 저장 모달(확인용)
  const openSaveConfirm = useCallback((id) => {
    const e = edits[id]; if (!e) return
    setSaveTarget({ id, ...e })
  }, [edits])

  // 저장 실행
  const doSave = useCallback(async () => {
    if (!saveTarget) return
    const { id, title, type, url } = saveTarget
    try {
      setSaving(s => ({ ...s, [id]: true }))
      const ok = await updateBackground({
        backId: id,
        title: title.trim(),
        type,
        url: url.trim(),
      })
      if (!ok) throw new Error('save failed')

      // 원본/편집 동기화
      setOriginals(prev => ({ ...prev, [id]: { title, type, url } }))
      setEdits(prev => ({ ...prev, [id]: { title, type, url } }))
      setPreviewOk(prev => ({ ...prev, [id]: true })) // 방금 저장된 건 프리뷰 통과로 표시
      setSaveTarget(null)
    } catch (e) {
      console.error(e)
      setError('저장에 실패했습니다.')
    } finally {
      setSaving(s => ({ ...s, [id]: false }))
    }
  }, [saveTarget])

  // 전부 초기화
  const resetAll = useCallback(() => {
    setEdits(prev => {
      const copy = { ...prev }
      for (const r of rows) {
        if (originals[r.id]) copy[r.id] = { ...originals[r.id] }
      }
      return copy
    })
    setPreviewOk({})
    setShowResetConfirm(false)
  }, [rows, originals])

  // 저장 가능 조건: 변경됨 + 필수값 + (최근 프리뷰 성공)
  const canSave = useCallback((id) => {
    const e = edits[id]; if (!e) return false
    if (!dirtyMap[id]) return false
    if (!e.title?.trim() || !e.url?.trim()) return false
    if (!['image', 'video'].includes(e.type)) return false
    return previewOk[id] === true
  }, [edits, dirtyMap, previewOk])

  return (
    <>
      {/* 에러 모달 */}
      <CModal visible={!!error} onClose={() => setError(null)} backdrop="static" keyboard>
        <CModalHeader><CModalTitle>오류</CModalTitle></CModalHeader>
        <CModalBody>{error}</CModalBody>
        <CModalFooter><CButton color="primary" onClick={() => setError(null)}>확인</CButton></CModalFooter>
      </CModal>

      {/* 전부 초기화 확인 */}
      <CModal visible={showResetConfirm} onClose={() => setShowResetConfirm(false)} backdrop="static" keyboard>
        <CModalHeader><CModalTitle>전부 초기화</CModalTitle></CModalHeader>
        <CModalBody>변경한 내용을 모두 원래대로 되돌릴까요?</CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setShowResetConfirm(false)}>취소</CButton>
          <CButton color="primary" onClick={resetAll}>초기화</CButton>
        </CModalFooter>
      </CModal>

      {/* 미리보기 모달 */}
      <PreviewModal
        visible={!!previewTarget}
        target={previewTarget}
        onClose={() => setPreviewTarget(null)}
        onConfirm={handlePreviewConfirm}
      />

      {/* 저장 확인 모달 */}
      <CModal
        visible={!!saveTarget}
        onClose={() => setSaveTarget(null)}
        backdrop="static"
        keyboard
      >
        <CModalHeader><CModalTitle>저장 확인</CModalTitle></CModalHeader>
        <CModalBody>
          {saveTarget && (
            <div className="small">
              <div className="mb-2">ID: <strong>{saveTarget.id}</strong></div>
              <div className="mb-2">제목: <strong>{saveTarget.title || '-'}</strong></div>
              <div className="mb-2">타입: <strong>{saveTarget.type}</strong></div>
              <div className="mb-2">URL: <code style={{ wordBreak: 'break-all' }}>{saveTarget.url}</code></div>
              <div className="text-secondary">
                ※ 저장은 <strong>마지막 미리보기 성공</strong> 상태일 때만 가능합니다.
              </div>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setSaveTarget(null)}>취소</CButton>
          <CButton
            color="primary"
            disabled={!(saveTarget && previewOk[saveTarget.id] === true)}
            onClick={doSave}
          >
            저장
          </CButton>
        </CModalFooter>
      </CModal>

      <CContainer className="mt-4">
        <CCard>
          <CCardHeader>
            <div className="d-flex align-items-center justify-content-between" style={{ gap: 12 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>배경 관리 (3개 고정)</h2>
              <div className="d-flex" style={{ gap: 8 }}>
                <CButton color="secondary" variant="outline" size="sm" onClick={load} disabled={loading}>
                  새로고침
                </CButton>
                <CButton
                  color={hasDirty ? 'warning' : 'secondary'}
                  {...(!hasDirty ? { variant: 'outline' } : {})}
                  size="sm"
                  onClick={() => setShowResetConfirm(true)}
                  disabled={!hasDirty || loading}
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
                  <CTableHeaderCell style={{ width: 60 }}>ID</CTableHeaderCell>
                  <CTableHeaderCell>제목</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 140 }}>종류</CTableHeaderCell>
                  <CTableHeaderCell>URL</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 220 }}>Preview / Save</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {loading ? (
                  Array.from({ length: MAX_ROWS }).map((_, i) => (
                    <CTableRow key={`sk-${i}`}>
                      <CTableDataCell className="text-muted">—</CTableDataCell>
                      <CTableDataCell><div className="placeholder col-12" style={{ height: 38 }} /></CTableDataCell>
                      <CTableDataCell><div className="placeholder col-12" style={{ height: 38 }} /></CTableDataCell>
                      <CTableDataCell><div className="placeholder col-12" style={{ height: 38 }} /></CTableDataCell>
                      <CTableDataCell className="text-center"><CSpinner size="sm" /></CTableDataCell>
                    </CTableRow>
                  ))
                ) : (
                  rows.map((r) => {
                    const e = edits[r.id] || { title: '', type: 'image', url: '' }
                    const dirty = !!dirtyMap[r.id]
                    const disableSave = !canSave(r.id) || saving[r.id]

                    return (
                      <CTableRow key={r.id}>
                        <CTableDataCell>{r.id}</CTableDataCell>

                        <CTableDataCell>
                          <CFormInput
                            value={e.title}
                            placeholder="제목"
                            onChange={(ev) => onChangeTitle(r.id, ev.target.value)}
                            disabled={!!saving[r.id]}
                          />
                        </CTableDataCell>

                        <CTableDataCell>
                          <CFormSelect
                            value={e.type}
                            onChange={(ev) => onChangeType(r.id, ev.target.value)}
                            disabled={!!saving[r.id]}
                          >
                            <option value="image">이미지</option>
                            <option value="video">동영상</option>
                          </CFormSelect>
                        </CTableDataCell>

                        <CTableDataCell>
                          <CFormInput
                            type="url"
                            placeholder={e.type === 'image' ? '이미지 URL' : '동영상 URL'}
                            value={e.url}
                            onChange={(ev) => onChangeUrl(r.id, ev.target.value)}
                            disabled={!!saving[r.id]}
                          />
                        </CTableDataCell>

                        <CTableDataCell className="d-flex align-items-center" style={{ gap: 8 }}>
                          <CButton
                            color="secondary"
                            variant="outline"
                            size="sm"
                            onClick={() => openPreview(r.id)}
                            disabled={!e.url?.trim()}
                          >
                            미리보기
                          </CButton>

                          <CButton
                            color={dirty ? 'primary' : 'secondary'}
                            {...(!dirty ? { variant: 'outline' } : {})}
                            size="sm"
                            disabled={disableSave}
                            onClick={() => openSaveConfirm(r.id)}
                            title={previewOk[r.id] !== true ? '미리보기 성공 후 저장 가능' : undefined}
                          >
                            {saving[r.id] ? (
                              <>
                                <CSpinner size="sm" className="me-2" /> 저장중
                              </>
                            ) : (dirty ? '저장' : '저장됨')}
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

export default React.memo(BackGround)
