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
  CButton,
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CFormLabel,
  CCol,
  CRow,
  CProgress,
} from '@coreui/react'
import {
  getMinigames,
  getMinigameSurvivalRate,
  addMinigameSurvivalRate,
  updateMinigameSurvivalRate,
} from 'src/api/modules/minigame'

const SurvivalRate = () => {
  const [games, setGames] = useState([])
  const [survivalRates, setSurvivalRates] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedGame, setSelectedGame] = useState(null)
  const [saving, setSaving] = useState(false)

  const [addFormData, setAddFormData] = useState({
    totalPlayers: '',
    survivors: '',
  })

  const [updateFormData, setUpdateFormData] = useState({
    survivalRate: '',
    totalGames: '',
    totalPlayers: '',
    survivors: '',
  })

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getMinigames()
      const gameList = result.items || []
      setGames(gameList)

      // 각 게임의 생존률 조회
      const rates = {}
      for (const game of gameList) {
        try {
          const rate = await getMinigameSurvivalRate(game.id)
          rates[game.id] = rate
        } catch (e) {
          console.error(`Failed to load survival rate for game ${game.id}`, e)
        }
      }
      setSurvivalRates(rates)
    } catch (e) {
      setError('데이터를 불러오지 못했습니다.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleAddData = (game) => {
    setSelectedGame(game)
    setAddFormData({ totalPlayers: '', survivors: '' })
    setShowAddModal(true)
  }

  const handleUpdate = (game) => {
    setSelectedGame(game)
    const rate = survivalRates[game.id]
    setUpdateFormData({
      survivalRate: rate?.survivalRate?.toString() || '',
      totalGames: rate?.totalGames?.toString() || '',
      totalPlayers: rate?.totalPlayers?.toString() || '',
      survivors: rate?.survivors?.toString() || '',
    })
    setShowUpdateModal(true)
  }

  const handleSaveAdd = async () => {
    if (!selectedGame) return
    try {
      setSaving(true)
      await addMinigameSurvivalRate(selectedGame.id, {
        totalPlayers: parseInt(addFormData.totalPlayers),
        survivors: parseInt(addFormData.survivors),
      })
      setShowAddModal(false)
      load()
    } catch (e) {
      setError('데이터 추가 중 오류가 발생했습니다.')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveUpdate = async () => {
    if (!selectedGame) return
    try {
      setSaving(true)
      await updateMinigameSurvivalRate(selectedGame.id, {
        survivalRate: parseFloat(updateFormData.survivalRate),
        totalGames: parseInt(updateFormData.totalGames),
        totalPlayers: parseInt(updateFormData.totalPlayers),
        survivors: parseInt(updateFormData.survivors),
      })
      setShowUpdateModal(false)
      load()
    } catch (e) {
      setError('데이터 수정 중 오류가 발생했습니다.')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('ko-KR')
  }

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

      {/* 데이터 추가 모달 */}
      <CModal visible={showAddModal} onClose={() => setShowAddModal(false)} backdrop="static" keyboard>
        <CModalHeader>
          <CModalTitle>생존률 데이터 추가 - {selectedGame?.name}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow className="mb-3">
            <CFormLabel htmlFor="totalPlayers" className="col-sm-4 col-form-label">
              총 플레이어 수
            </CFormLabel>
            <CCol sm={8}>
              <CFormInput
                type="number"
                id="totalPlayers"
                value={addFormData.totalPlayers}
                onChange={(e) => setAddFormData({ ...addFormData, totalPlayers: e.target.value })}
              />
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CFormLabel htmlFor="survivors" className="col-sm-4 col-form-label">
              생존자 수
            </CFormLabel>
            <CCol sm={8}>
              <CFormInput
                type="number"
                id="survivors"
                value={addFormData.survivors}
                onChange={(e) => setAddFormData({ ...addFormData, survivors: e.target.value })}
              />
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowAddModal(false)}>
            취소
          </CButton>
          <CButton color="primary" onClick={handleSaveAdd} disabled={saving}>
            {saving ? <CSpinner size="sm" className="me-2" /> : null}
            추가
          </CButton>
        </CModalFooter>
      </CModal>

      {/* 데이터 수정 모달 */}
      <CModal
        visible={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        backdrop="static"
        keyboard
      >
        <CModalHeader>
          <CModalTitle>생존률 데이터 수정 - {selectedGame?.name}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow className="mb-3">
            <CFormLabel htmlFor="survivalRate" className="col-sm-4 col-form-label">
              생존률 (%)
            </CFormLabel>
            <CCol sm={8}>
              <CFormInput
                type="number"
                step="0.1"
                id="survivalRate"
                value={updateFormData.survivalRate}
                onChange={(e) =>
                  setUpdateFormData({ ...updateFormData, survivalRate: e.target.value })
                }
              />
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CFormLabel htmlFor="totalGames" className="col-sm-4 col-form-label">
              총 게임 수
            </CFormLabel>
            <CCol sm={8}>
              <CFormInput
                type="number"
                id="totalGames"
                value={updateFormData.totalGames}
                onChange={(e) => setUpdateFormData({ ...updateFormData, totalGames: e.target.value })}
              />
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CFormLabel htmlFor="updateTotalPlayers" className="col-sm-4 col-form-label">
              총 플레이어 수
            </CFormLabel>
            <CCol sm={8}>
              <CFormInput
                type="number"
                id="updateTotalPlayers"
                value={updateFormData.totalPlayers}
                onChange={(e) =>
                  setUpdateFormData({ ...updateFormData, totalPlayers: e.target.value })
                }
              />
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CFormLabel htmlFor="updateSurvivors" className="col-sm-4 col-form-label">
              생존자 수
            </CFormLabel>
            <CCol sm={8}>
              <CFormInput
                type="number"
                id="updateSurvivors"
                value={updateFormData.survivors}
                onChange={(e) => setUpdateFormData({ ...updateFormData, survivors: e.target.value })}
              />
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowUpdateModal(false)}>
            취소
          </CButton>
          <CButton color="primary" onClick={handleSaveUpdate} disabled={saving}>
            {saving ? <CSpinner size="sm" className="me-2" /> : null}
            수정
          </CButton>
        </CModalFooter>
      </CModal>

      <CContainer className="mt-4">
        <CCard>
          <CCardHeader>
            <div className="d-flex align-items-center justify-content-between" style={{ gap: 12 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>생존률 관리</h2>
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
                  <CTableHeaderCell scope="col">게임 이름</CTableHeaderCell>
                  <CTableHeaderCell scope="col">생존률</CTableHeaderCell>
                  <CTableHeaderCell scope="col">게임 수</CTableHeaderCell>
                  <CTableHeaderCell scope="col">플레이어/생존자</CTableHeaderCell>
                  <CTableHeaderCell scope="col">마지막 업데이트</CTableHeaderCell>
                  <CTableHeaderCell scope="col" style={{ width: 200 }}>
                    Action
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {loading ? (
                  <CTableRow>
                    <CTableDataCell colSpan={7} className="text-center">
                      <CSpinner />
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  games.map((game) => {
                    const rate = survivalRates[game.id]
                    const survivalPercent = rate?.survivalRate || 0

                    return (
                      <CTableRow key={game.id}>
                        <CTableDataCell>{game.id}</CTableDataCell>
                        <CTableDataCell>{game.name}</CTableDataCell>
                        <CTableDataCell>
                          {rate ? (
                            <div>
                              <div className="mb-1">{survivalPercent.toFixed(1)}%</div>
                              <CProgress
                                value={survivalPercent}
                                color={
                                  survivalPercent >= 70
                                    ? 'success'
                                    : survivalPercent >= 40
                                      ? 'warning'
                                      : 'danger'
                                }
                              />
                            </div>
                          ) : (
                            '-'
                          )}
                        </CTableDataCell>
                        <CTableDataCell>{rate?.totalGames || '-'}</CTableDataCell>
                        <CTableDataCell>
                          {rate ? `${rate.totalPlayers} / ${rate.survivors}` : '-'}
                        </CTableDataCell>
                        <CTableDataCell>{formatDate(rate?.lastUpdated)}</CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="primary"
                            size="sm"
                            variant="outline"
                            className="me-2"
                            onClick={() => handleAddData(game)}
                          >
                            데이터 추가
                          </CButton>
                          <CButton
                            color="info"
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdate(game)}
                            disabled={!rate}
                          >
                            수정
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

export default React.memo(SurvivalRate)
