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
  CFormSelect,
  CButton,
} from '@coreui/react'

const BackGround = () => {
  const [items, setItems] = useState([])
  const [edits, setEdits] = useState({})

  /*
  API 준비 전 임시 더미 3개 생성
  */
  useEffect(() => {
    const initial = [
      { id: 1, type: 'image' },
      { id: 2, type: 'video' },
      { id: 3, type: 'image' },
    ]
    setItems(initial)
    const initEdits = {}
    initial.forEach(item => {
      initEdits[item.id] = { type: item.type, file: null }
    })
    setEdits(initEdits)
  }, [])

  const handleTypeChange = (id, newType) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, type: newType } : item
    ))
    setEdits({
      ...edits,
      [id]: { type: newType, file: null },
    })
  }

  const handleFileChange = (id, file) => {
    setEdits({
      ...edits,
      [id]: { ...(edits[id] || {}), file },
    })
  }

  const saveItem = (id) => {
    const { type, file } = edits[id] || {}
    if (!file) return
    // TODO: API로 업로드 처리
    console.log(`저장 요청 → id:${id}, type:${type}`, file)
    alert(`${type === 'image' ? '이미지' : '동영상'} ${id} 저장: ${file.name}`)
  }

  // 현재 동영상 파일 설정된 개수
  const videoCount = Object.values(edits).filter(
    e => e.type === 'video' && e.file
  ).length

  return (
    <CContainer className="mt-4">
      <CCard>
        <CCardHeader>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
            배경 설정
          </h2>
        </CCardHeader>
        <CCardBody>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>종류</CTableHeaderCell>
                <CTableHeaderCell>파일 선택</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {items.map(({ id, type }) => {
                const edit = edits[id] || { type, file: null }
                return (
                  <CTableRow key={id}>
                    <CTableDataCell>{id}</CTableDataCell>
                    <CTableDataCell>
                      <CFormSelect
                        value={edit.type}
                        onChange={e => handleTypeChange(id, e.target.value)}
                      >
                        <option value="image">이미지</option>
                        <option
                          value="video"
                          disabled={videoCount >= 3 && edit.type !== 'video'}
                        >
                          동영상 {videoCount >= 3 ? '(3개 제한)' : ''}
                        </option>
                      </CFormSelect>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CFormInput
                        type="file"
                        accept={edit.type === 'image' ? 'image/*' : 'video/*'}
                        onChange={e =>
                          handleFileChange(id, e.target.files[0] || null)
                        }
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        color="primary"
                        size="sm"
                        onClick={() => saveItem(id)}
                      >
                        저장
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

export default React.memo(BackGround)
