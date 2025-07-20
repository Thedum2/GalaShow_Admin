import React, {useState, useEffect} from 'react'
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

const Banner = () => {
  const [banners, setBanners] = useState([])

  /*
  API 준비 전 임시 더미 10개 생성
  */
  useEffect(() => {
    const dummy = Array.from({length: 10}, (_, i) => ({
      id: i + 1,
      message: `${i + 1}번 테스트 배너 텍스트 데이터입니다. 배너 텍스트 데이터입니다. 배너 텍스트 데이터입니다. 배너 텍스트 데이터입니다.`,
    }))
    setBanners(dummy)
  }, [])

  const saveBanner = (id) => {

  }

  return (
    <CContainer className="mt-4">
      <CCard>
        <CCardHeader>
          <h2 style={{fontSize: '1.5rem', fontWeight: "bold", margin: 0}}>배너 관리</h2>
        </CCardHeader>
        <CCardBody>
          <div className="d-flex justify-content-end mb-3">
          </div>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell scope="col">ID</CTableHeaderCell>
                <CTableHeaderCell scope="col">배너 문구</CTableHeaderCell>
                <CTableHeaderCell scope="col">Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {banners.map((b) => {
                return (
                  <CTableRow key={b.id}>
                    <CTableDataCell>{b.id}</CTableDataCell>
                    <CTableDataCell>
                      <CFormInput
                        value={b.message}
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        color="primary"
                        size="sm"
                        onClick={() => saveBanner(b.id)}
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

export default React.memo(Banner)
