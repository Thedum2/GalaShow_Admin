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
      [id]: {
        title: '',
        icon: null,
        url: '',
        order: items.length + 1,
      },
    })
  }

  const handleTitleChange = (id, value) => {
    setEdits({
      ...edits,
      [id]: { ...(edits[id] || {}), title: value },
    })
  }

  const handleOrderChange = (id, value) => {
    setEdits({
      ...edits,
      [id]: { ...(edits[id] || {}), order: parseInt(value, 10) || 0 },
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

  const handleDelete = (id) => {
    setItems(items.filter(item => item.id !== id))
    const { [id]: _, ...rest } = edits
    setEdits(rest)
  }

  // 모든 항목이 유효한지 검사
  const isAllValid =
    items.length > 0 &&
    items.every(({ id }) => {
      const e = edits[id] || {}
      return (
        e.title?.trim() &&
        e.icon instanceof File &&
        e.url?.trim() &&
        Number.isInteger(e.order) &&
        e.order > 0
      )
    })

  const saveAll = () => {
    const payload = items.map(({ id }) => {
      const { title, icon, url, order } = edits[id]
      return { title, icon, url, order }
    })
    // TODO: API에 한번에 보내기 (예: axios.put('/api/sns', payload))
    console.log('일괄 저장 요청 →', payload)
    alert('모든 SNS 설정이 저장되었습니다.')
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
              className="me-2"
            >
              항목 추가
            </CButton>
            <CButton
              color="primary"
              size="sm"
              onClick={saveAll}
            >
              전체 저장
            </CButton>
          </div>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Title</CTableHeaderCell>
                <CTableHeaderCell>순서</CTableHeaderCell>
                <CTableHeaderCell>아이콘 (SVG)</CTableHeaderCell>
                <CTableHeaderCell>URL</CTableHeaderCell>
                <CTableHeaderCell>삭제</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {items.map(({ id }) => {
                const {
                  title = '',
                  icon = null,
                  url = '',
                  order = id,
                } = edits[id] || {}
                return (
                  <CTableRow key={id}>
                    <CTableDataCell>{id}</CTableDataCell>
                    <CTableDataCell>
                      <CFormInput
                        type="text"
                        placeholder="SNS 이름"
                        value={title}
                        onChange={e =>
                          handleTitleChange(id, e.target.value)
                        }
                      />
                    </CTableDataCell>
                    <CTableDataCell style={{ width: '80px' }}>
                      <CFormInput
                        type="number"
                        min="1"
                        value={order}
                        onChange={e =>
                          handleOrderChange(id, e.target.value)
                        }
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <CFormInput
                        type="file"
                        accept=".svg"
                        onChange={e =>
                          handleFileChange(id, e.target.files[0] || null)
                        }
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <CFormInput
                        type="text"
                        placeholder="https://..."
                        value={url}
                        onChange={e => handleUrlChange(id, e.target.value)}
                      />
                    </CTableDataCell>
                    <CTableDataCell>
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
