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
import { getSnsLinks, putSnsLinks } from 'src/api/modules/sns'

const MAX = 10

function isValidUrl(str) {
  try {
    const u = new URL(str)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

function PreviewContent({ target, onResult }) {
  const [ok, setOk] = useState(null)
  useEffect(() => {
    setOk(null)
  }, [target?.iconUrl])
  useEffect(() => {
    if (!target?.id) return
    if (ok === null) return
    onResult(target.id, ok)
  }, [ok, target, onResult])
  if (!target) return null
  const validIconUrl = isValidUrl(target.iconUrl)
  return (
    <div>
      <div className="mb-2">
        <div className="text-secondary" style={{ fontSize: 14 }}>
          제목: <strong>{target.title || '-'}</strong>
        </div>
        <div className="text-secondary" style={{ fontSize: 14 }}>
          링크:{' '}
          <a href={target.url || '#'} target="_blank" rel="noreferrer">
            {target.url || '-'}
          </a>
        </div>
        <div className="text-secondary" style={{ fontSize: 14 }}>
          아이콘 URL: <code style={{ wordBreak: 'break-all' }}>{target.iconUrl || '-'}</code>
        </div>
      </div>
      {!validIconUrl ? (
        <div className="text-danger">올바른 아이콘 URL을 입력하세요.</div>
      ) : (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: 160 }}
        >
          <img
            src={target.iconUrl}
            alt="icon preview"
            style={{ maxWidth: 240, maxHeight: 240 }}
            onLoad={() => setOk(true)}
            onError={() => setOk(false)}
          />
        </div>
      )}
      <div className="mt-3">
        {ok === null && validIconUrl && <span className="text-secondary">로딩 중...</span>}
        {ok === true && <span className="text-success">미리보기 성공 (저장 가능)</span>}
        {ok === false && <span className="text-danger">미리보기 실패 (URL 확인)</span>}
      </div>
    </div>
  )
}

const SNS = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [items, setItems] = useState([])
  const [originals, setOriginals] = useState({})
  const [edits, setEdits] = useState({})
  const [previewOk, setPreviewOk] = useState({})

  const [showReset, setShowReset] = useState(false)
  const [showSave, setShowSave] = useState(false)
  const [preview, setPreview] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await getSnsLinks()
      const norm = (Array.isArray(list) ? list : []).slice(0, MAX).map((x, i) => ({
        id: i + 1,
        title: x.title ?? '',
        iconUrl: x.iconUrl ?? '',
        url: x.url ?? '',
        order: Number.isInteger(x.order) ? x.order : i + 1,
      }))
      setItems(norm.map((r) => ({ id: r.id })))
      const ori = {}
      const ed = {}
      const pv = {}
      norm.forEach((r) => {
        ori[r.id] = { title: r.title, iconUrl: r.iconUrl, url: r.url, order: r.order }
        ed[r.id] = { title: r.title, iconUrl: r.iconUrl, url: r.url, order: r.order }
        pv[r.id] = false
      })
      setOriginals(ori)
      setEdits(ed)
      setPreviewOk(pv)
    } catch (e) {
      setError('SNS 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const rows = useMemo(
    () =>
      [...items].sort((a, b) => {
        const oa = edits[a.id]?.order ?? a.id
        const ob = edits[b.id]?.order ?? b.id
        return (oa || 0) - (ob || 0)
      }),
    [items, edits],
  )

  const dirty = useMemo(() => {
    const currentIds = new Set(items.map((it) => it.id))
    const originalIds = new Set(Object.keys(originals).map(Number))
    for (const id of currentIds) if (!originalIds.has(id)) return true
    for (const id of originalIds) if (!currentIds.has(id)) return true
    for (const { id } of items) {
      const o = originals[id] || {}
      const e = edits[id] || {}
      if (
        o.title !== e.title ||
        o.iconUrl !== e.iconUrl ||
        o.url !== e.url ||
        (o.order ?? 0) !== (e.order ?? 0)
      )
        return true
    }
    return false
  }, [items, originals, edits])

  const allValid = useMemo(() => {
    if (items.length === 0) return false
    return items.every(({ id }) => {
      const e = edits[id] || {}
      const validTitle = !!e.title?.trim()
      const validIcon = isValidUrl(e.iconUrl)
      const validUrl = isValidUrl(e.url)
      const validOrder = Number.isInteger(e.order) && e.order > 0
      const previewOK = previewOk[id] === true
      return validTitle && validIcon && validUrl && validOrder && previewOK
    })
  }, [items, edits, previewOk])

  const canSaveAll = dirty && allValid && !saving && !loading

  const handleAdd = useCallback(() => {
    if (items.length >= MAX) return
    const maxId = items.reduce((m, it) => Math.max(m, it.id), 0)
    const id = maxId + 1
    const nextOrder = items.length + 1
    setItems((prev) => [...prev, { id }])
    const init = { title: '', iconUrl: '', url: '', order: nextOrder }
    setEdits((prev) => ({ ...prev, [id]: init }))
    setPreviewOk((prev) => ({ ...prev, [id]: false }))
  }, [items])

  const handleDelete = useCallback((id) => {
    setItems((prev) => prev.filter((it) => it.id !== id))
    setEdits((prev) => {
      const cp = { ...prev }
      delete cp[id]
      return cp
    })
    setPreviewOk((prev) => {
      const cp = { ...prev }
      delete cp[id]
      return cp
    })
  }, [])

  const onChange = useCallback((id, key, value) => {
    setEdits((prev) => {
      const v = key === 'order' ? parseInt(value, 10) || 0 : value
      const next = { ...(prev[id] || {}), [key]: v }
      return { ...prev, [id]: next }
    })
    if (key === 'iconUrl' || key === 'title' || key === 'url' || key === 'order') {
      setPreviewOk((prev) => ({ ...prev, [id]: false }))
    }
  }, [])

  const openPreview = useCallback(
    (id) => {
      const e = edits[id]
      if (!e) return
      setPreview({ id, title: e.title, iconUrl: e.iconUrl, url: e.url })
    },
    [edits],
  )

  const resetAll = useCallback(() => {
    setEdits((prev) => {
      const cp = { ...prev }
      items.forEach(({ id }) => {
        if (originals[id]) cp[id] = { ...originals[id] }
      })
      return cp
    })
    setPreviewOk((prev) => {
      const np = { ...prev }
      items.forEach(({ id }) => {
        np[id] = false
      })
      return np
    })
    setShowReset(false)
  }, [items, originals])

  const doSave = useCallback(async () => {
    try {
      setSaving(true)
      setShowSave(false)
      const payload = rows.map(({ id }) => ({
        id: id,
        title: (edits[id]?.title || '').trim(),
        iconUrl: (edits[id]?.iconUrl || '').trim(),
        url: (edits[id]?.url || '').trim(),
        order: edits[id]?.order ?? 1,
      }))
      const ok = await putSnsLinks(payload)
      if (!ok) throw new Error('save failed')
      setOriginals(() => {
        const next = {}
        rows.forEach(({ id }) => {
          next[id] = {
            title: (edits[id]?.title || '').trim(),
            iconUrl: (edits[id]?.iconUrl || '').trim(),
            url: (edits[id]?.url || '').trim(),
            order: edits[id]?.order ?? 1,
          }
        })
        return next
      })
    } catch (e) {
      setError('저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }, [rows, edits])

  return (
    <>
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

      <CModal visible={showReset} onClose={() => setShowReset(false)} backdrop="static" keyboard>
        <CModalHeader>
          <CModalTitle>전부 초기화</CModalTitle>
        </CModalHeader>
        <CModalBody>모든 SNS 항목을 원래 값으로 되돌릴까요?</CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setShowReset(false)}>
            취소
          </CButton>
          <CButton color="primary" onClick={resetAll}>
            초기화
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={showSave} onClose={() => setShowSave(false)} backdrop="static" keyboard>
        <CModalHeader>
          <CModalTitle>전체 저장 확인</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="small">
            {rows.map(({ id }) => (
              <div key={`sv-${id}`} className="mb-2">
                <strong>#{id}</strong> — {edits[id]?.title || '(제목없음)'}
                <br />
                아이콘: <code style={{ wordBreak: 'break-all' }}>{edits[id]?.iconUrl || '-'}</code>
                {previewOk[id] === true ? (
                  <span className="text-success ms-2">[미리보기 OK]</span>
                ) : (
                  <span className="text-danger ms-2">[미리보기 필요]</span>
                )}
                <br />
                링크: <code style={{ wordBreak: 'break-all' }}>{edits[id]?.url || '-'}</code> ·
                순서: {edits[id]?.order ?? 1}
              </div>
            ))}
            <div className="text-secondary mt-2">모든 항목은 “미리보기 성공”이어야 저장됩니다.</div>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setShowSave(false)}>
            취소
          </CButton>
          <CButton color="primary" disabled={!canSaveAll} onClick={doSave}>
            {saving ? (
              <>
                <CSpinner size="sm" className="me-2" /> 저장중
              </>
            ) : (
              '저장'
            )}
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal
        visible={!!preview}
        onClose={() => setPreview(null)}
        size="lg"
        backdrop="static"
        keyboard
      >
        <CModalHeader>
          <CModalTitle>아이콘 미리보기</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <PreviewContent
            target={preview}
            onResult={(id, ok) => setPreviewOk((prev) => ({ ...prev, [id]: ok }))}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={() => setPreview(null)}>
            닫기
          </CButton>
        </CModalFooter>
      </CModal>

      <CContainer className="mt-4">
        <CCard>
          <CCardHeader>
            <div className="d-flex align-items-center justify-content-between" style={{ gap: 12 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                SNS 설정 (최대 {MAX}개)
              </h2>
              <div className="d-flex" style={{ gap: 8 }}>
                <CButton
                  color="secondary"
                  variant="outline"
                  size="sm"
                  onClick={load}
                  disabled={loading || saving}
                >
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
                  disabled={!canSaveAll}
                  onClick={() => setShowSave(true)}
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
            <div className="mb-3 d-flex justify-content-end">
              <CButton
                color="success"
                size="sm"
                onClick={handleAdd}
                disabled={items.length >= MAX || loading || saving}
              >
                항목 추가
              </CButton>
            </div>

            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style={{ width: 60 }}>ID</CTableHeaderCell>
                  <CTableHeaderCell>Title</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 90 }}>순서</CTableHeaderCell>
                  <CTableHeaderCell>아이콘(URL)</CTableHeaderCell>
                  <CTableHeaderCell>URL</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 230 }}>미리보기/삭제</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <CTableRow key={`sk-${i}`}>
                        <CTableDataCell className="text-muted">—</CTableDataCell>
                        <CTableDataCell>
                          <div className="placeholder col-12" style={{ height: 38 }} />
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="placeholder col-12" style={{ height: 38 }} />
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="placeholder col-12" style={{ height: 38 }} />
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="placeholder col-12" style={{ height: 38 }} />
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CSpinner size="sm" />
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  : rows.map(({ id }) => {
                      const e = edits[id] || { title: '', iconUrl: '', url: '', order: 1 }
                      const validTitle = !!e.title?.trim()
                      const validIcon = isValidUrl(e.iconUrl)
                      const validUrl = isValidUrl(e.url)
                      const validOrder = Number.isInteger(e.order) && e.order > 0
                      const previewOK = previewOk[id] === true
                      const rowValid =
                        validTitle && validIcon && validUrl && validOrder && previewOK
                      return (
                        <CTableRow key={id}>
                          <CTableDataCell>{id}</CTableDataCell>
                          <CTableDataCell>
                            <CFormInput
                              type="text"
                              placeholder="SNS 이름"
                              value={e.title}
                              onChange={(ev) => onChange(id, 'title', ev.target.value)}
                              disabled={saving}
                            />
                          </CTableDataCell>
                          <CTableDataCell>
                            <CFormInput
                              type="number"
                              min="1"
                              value={e.order}
                              onChange={(ev) => onChange(id, 'order', ev.target.value)}
                              disabled={saving}
                            />
                          </CTableDataCell>
                          <CTableDataCell>
                            <CFormInput
                              type="url"
                              placeholder="https://... (SVG/CDN 링크 등)"
                              value={e.iconUrl}
                              onChange={(ev) => onChange(id, 'iconUrl', ev.target.value)}
                              disabled={saving}
                            />
                          </CTableDataCell>
                          <CTableDataCell>
                            <CFormInput
                              type="url"
                              placeholder="https://..."
                              value={e.url}
                              onChange={(ev) => onChange(id, 'url', ev.target.value)}
                              disabled={saving}
                            />
                          </CTableDataCell>
                          <CTableDataCell className="d-flex align-items-center" style={{ gap: 8 }}>
                            <CButton
                              color={previewOK ? 'success' : 'secondary'}
                              {...(!previewOK ? { variant: 'outline' } : {})}
                              size="sm"
                              onClick={() => openPreview(id)}
                              disabled={!validIcon}
                            >
                              {previewOK ? '미리보기 OK' : '아이콘 미리보기'}
                            </CButton>
                            <CButton
                              color="danger"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(id)}
                              disabled={saving}
                            >
                              삭제
                            </CButton>
                            {!rowValid && (
                              <span className="text-danger small ms-2">
                                유효하지 않은 값/미리보기 필요
                              </span>
                            )}
                          </CTableDataCell>
                        </CTableRow>
                      )
                    })}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CContainer>
    </>
  )
}

export default React.memo(SNS)
