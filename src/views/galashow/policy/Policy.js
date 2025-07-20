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

const Policy = () => {
  const [policies, setPolicies] = useState([])
  const [edits, setEdits] = useState({})

  useEffect(() => {
    // 이용약관, 개인정보 처리방침 두 가지 정책 초기화
    const initial = [
      { id: 1, name: '이용약관' },
      { id: 2, name: '개인정보 처리방침' },
    ]
    setPolicies(initial)
    const initEdits = {}
    initial.forEach(p => {
      initEdits[p.id] = { file: null }
    })
    setEdits(initEdits)
  }, [])

  const handleFileChange = (id, file) => {
    setEdits(prev => ({
      ...prev,
      [id]: { file },
    }))
  }

  const savePolicy = (id) => {
    const { file } = edits[id] || {}
    if (!file) return
    // TODO: API로 업로드 처리
    console.log(`정책 저장 요청 → id:${id}`, file)
    alert(`정책 "${policies.find(p => p.id === id).name}" 저장: ${file.name}`)
  }

  return (
    <CContainer className="mt-4">
      <CCard>
        <CCardHeader>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
            정책 관리
          </h2>
        </CCardHeader>
        <CCardBody>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>정책 종류</CTableHeaderCell>
                <CTableHeaderCell>파일 선택</CTableHeaderCell>
                <CTableHeaderCell>액션</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {policies.map(({ id, name }) => {
                const { file } = edits[id] || {}
                return (
                  <CTableRow key={id}>
                    <CTableDataCell>{id}</CTableDataCell>
                    <CTableDataCell>{name}</CTableDataCell>
                    <CTableDataCell>
                      <CFormInput
                        type="file"
                        accept=".pdf"
                        onChange={e =>
                          handleFileChange(id, e.target.files[0] || null)
                        }
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        color="primary"
                        size="sm"
                        onClick={() => savePolicy(id)}
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

export default React.memo(Policy)
