import React, { useState, useEffect } from 'react'
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
} from '@coreui/react'

const SNS = () => {
  const [items, setItems] = useState([])
  const [edits, setEdits] = useState({})

  useEffect(() => {
    // 초기에는 빈 배열
    setItems([])
    setEdits({})
  }, [])

  const handleAdd = () => {
    if (items.length >= 10) return
    const maxId = items.reduce((max, item) => Math.max(max, item.id), 0)
    const id = maxId + 1
    setItems([...items, { id }])
    setEdits({
      ...edits,
      [id]: { icon: null, url: '' },
    })
  }

  const handleFileChange = (id, file) => {
    setEdits({
      ...edits,
      [id]: { ...(edits[id] || {}), icon: file },
    })
  }

  const handleUrlChange = (id, value) => {
    setEdits({
      ...edits,
      [id]: { ...(edits[id] || {}), url: value },
    })
  }

  const saveItem = (id) => {
    const { icon, url } = edits[id] || {}
    if (!icon || !url.trim()) return
    // TODO: API로 업로드/저장 처리
    console.log(`저장 요청 → id:${id}`, { icon, url })
    alert(`SNS ${id} 저장:\n아이콘: ${icon.name}\nURL: ${url}`)
  }

  const handleDelete = (id) => {
    setItems(items.filter(item => item.id !== id))
    const { [id]: _, ...rest } = edits
    setEdits(rest)
  }

  return (
    <CContainer className="mt-4">
      <CCard>
        <CCardHeader>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
            SNS 설정 (최대 10개)
          </h2>
        </CCardHeader>
        <CCardBody>
          <div className="d-flex justify-content-end mb-3">
            <CButton
              color="success"
              size="sm"
              onClick={handleAdd}
              disabled={items.length >= 10}
            >
              항목 추가
            </CButton>
          </div>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>아이콘 (SVG)</CTableHeaderCell>
                <CTableHeaderCell>URL</CTableHeaderCell>
                <CTableHeaderCell>액션</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {items.map(({ id }) => {
                const { icon = null, url = '' } = edits[id] || {}
                const isDisabled = !icon || url.trim() === ''
                return (
                  <CTableRow key={id}>
                    <CTableDataCell>{id}</CTableDataCell>
                    <CTableDataCell>
                      <CFormInput
                        type="file"
                        accept=".svg"
                        onChange={(e) =>
                          handleFileChange(id, e.target.files[0] || null)
                        }
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <CFormInput
                        type="text"
                        placeholder="https://..."
                        value={url}
                        onChange={(e) => handleUrlChange(id, e.target.value)}
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        color="primary"
                        size="sm"
                        className="me-2"
                        onClick={() => saveItem(id)}
                        disabled={isDisabled}
                      >
                        저장
                      </CButton>
                      <CButton
                        color="danger"
                        size="sm"
                        onClick={() => handleDelete(id)}
                      >
                        삭제
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                )
              })}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default React.memo(SNS)
