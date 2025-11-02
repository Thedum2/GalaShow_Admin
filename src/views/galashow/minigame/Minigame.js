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
  CFormTextarea,
  CFormLabel,
  CFormSelect,
  CBadge,
  CCol,
  CRow,
  CFormCheck,
} from '@coreui/react'
import {
  getMinigames,
  getMinigameById,
  createMinigame,
  updateMinigame,
  deleteMinigame,
} from 'src/api/modules/minigame'

// 태그 타입별 색상 매핑
const TAG_COLORS = {
  scale: 'info',
  difficulty: 'warning',
  round: 'success',
  type: 'primary',
  survivalRate: 'danger',
  winCondition: 'secondary',
}

const TAG_LABELS = {
  scale: '규모',
  difficulty: '난이도',
  round: '라운드',
  type: '타입',
  survivalRate: '생존률',
  winCondition: '승리조건',
}

const Minigame = () => {
  const [games, setGames] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedGame, setSelectedGame] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [gameToDelete, setGameToDelete] = useState(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    videoUrl: '',
    logoUrl: '',
    tags: {
      scale: ['medium'],
      difficulty: ['2'],
      round: ['1-2'],
      type: ['strategy'],
      survivalRate: ['medium'],
      winCondition: ['score'],
    },
    tutorial: [],
    controls: [],
    phaseData: {
      READY: 2000,
      SETUP: 1500,
      PRESENT: 800,
      INPUT: 8000,
      WAIT: 1500,
      EXECUTE: 800,
      REVEAL: 2500,
      CLEANUP: 1500,
    },
    gameData: '',
  })

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getMinigames()
      setGames(result.items || [])
      setTotal(result.total || 0)
    } catch (e) {
      setError('미니게임 목록을 불러오지 못했습니다.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleShowDetail = async (gameId) => {
    try {
      const detail = await getMinigameById(gameId)
      setSelectedGame(detail)
      setShowDetailModal(true)
    } catch (e) {
      setError('게임 상세 정보를 불러오지 못했습니다.')
      console.error(e)
    }
  }

  const handleCreateNew = () => {
    setFormData({
      name: '',
      description: '',
      videoUrl: '',
      logoUrl: '',
      tags: {
        scale: [''],
        difficulty: [''],
        round: [''],
        type: [''],
        survivalRate: [''],
        winCondition: [''],
      },
      tutorial: [],
      controls: [],
      phaseData: {
        READY: 1000,
        SETUP: 1000,
        PRESENT: 1000,
        INPUT: 1000,
        WAIT: 1000,
        EXECUTE: 1000,
        REVEAL: 1000,
        CLEANUP: 1000,
      },
      gameData: '',
    })
    setSelectedGame(null)
    setShowEditModal(true)
  }

  const handleEdit = async (gameId) => {
    try {
      const detail = await getMinigameById(gameId)
      setFormData({
        ...detail,
        tutorial: detail.tutorial || [],
        controls: detail.controls || [],
        phaseData: detail.phaseData || {
          READY: 2000,
          SETUP: 1500,
          PRESENT: 800,
          INPUT: 8000,
          WAIT: 1500,
          EXECUTE: 800,
          REVEAL: 2500,
          CLEANUP: 1500,
        },
        gameData: detail.gameData ? JSON.stringify(detail.gameData, null, 2) : '',
      })
      setSelectedGame(detail)
      setShowEditModal(true)
    } catch (e) {
      setError('게임 정보를 불러오지 못했습니다.')
      console.error(e)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // gameData JSON 검증
      let parsedGameData = null
      if (formData.gameData && formData.gameData.trim()) {
        try {
          parsedGameData = JSON.parse(formData.gameData)
        } catch (e) {
          setError('gameData가 올바른 JSON 형식이 아닙니다.')
          setSaving(false)
          return
        }
      }

      const dataToSave = {
        ...formData,
        gameData: parsedGameData,
      }

      if (selectedGame?.id) {
        await updateMinigame(selectedGame.id, dataToSave)
      } else {
        await createMinigame(dataToSave)
      }
      setShowEditModal(false)
      load()
    } catch (e) {
      setError('저장 중 오류가 발생했습니다.')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteConfirm = (game) => {
    setGameToDelete(game)
    setShowDeleteConfirm(true)
  }

  const handleDelete = async () => {
    if (!gameToDelete) return
    try {
      await deleteMinigame(gameToDelete.id)
      setShowDeleteConfirm(false)
      setGameToDelete(null)
      load()
    } catch (e) {
      setError('삭제 중 오류가 발생했습니다.')
      console.error(e)
    }
  }

  // Tutorial 관리
  const handleAddTutorial = () => {
    setFormData({
      ...formData,
      tutorial: [
        ...formData.tutorial,
        { step: formData.tutorial.length + 1, description: '' },
      ],
    })
  }

  const handleRemoveTutorial = (index) => {
    const newTutorial = formData.tutorial.filter((_, i) => i !== index)
    // step 번호 재정렬
    const reindexed = newTutorial.map((t, i) => ({ ...t, step: i + 1 }))
    setFormData({ ...formData, tutorial: reindexed })
  }

  const handleTutorialChange = (index, value) => {
    const newTutorial = [...formData.tutorial]
    newTutorial[index].description = value
    setFormData({ ...formData, tutorial: newTutorial })
  }

  // Controls 관리
  const handleAddControl = () => {
    setFormData({
      ...formData,
      controls: [...formData.controls, { keyName: '', key: [''] }],
    })
  }

  const handleRemoveControl = (index) => {
    const newControls = formData.controls.filter((_, i) => i !== index)
    setFormData({ ...formData, controls: newControls })
  }

  const handleControlChange = (index, field, value) => {
    const newControls = [...formData.controls]
    if (field === 'keyName') {
      newControls[index].keyName = value
    }
    setFormData({ ...formData, controls: newControls })
  }

  const handleAddKey = (controlIndex) => {
    const newControls = [...formData.controls]
    newControls[controlIndex].key.push('')
    setFormData({ ...formData, controls: newControls })
  }

  const handleRemoveKey = (controlIndex, keyIndex) => {
    const newControls = [...formData.controls]
    // 최소 1개의 key는 유지
    if (newControls[controlIndex].key.length <= 1) return
    newControls[controlIndex].key = newControls[controlIndex].key.filter((_, i) => i !== keyIndex)
    setFormData({ ...formData, controls: newControls })
  }

  const handleKeyChange = (controlIndex, keyIndex, value) => {
    const newControls = [...formData.controls]
    newControls[controlIndex].key[keyIndex] = value
    setFormData({ ...formData, controls: newControls })
  }

  // 태그 체크박스 처리
  const handleTagToggle = (tagType, value) => {
    const currentValues = formData.tags[tagType] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value]

    // 최소 1개는 선택되어야 함
    if (newValues.length === 0) return

    setFormData({
      ...formData,
      tags: { ...formData.tags, [tagType]: newValues },
    })
  }

  const renderTags = (tags) => {
    if (!tags) return null
    const result = []
    Object.entries(tags).forEach(([key, values]) => {
      if (Array.isArray(values)) {
        values.forEach((val) => {
          // 빈 값이나 공백만 있는 값은 표시하지 않음
          if (val && val.toString().trim()) {
            result.push(
              <CBadge key={`${key}-${val}`} color={TAG_COLORS[key] || 'secondary'} className="me-1">
                {TAG_LABELS[key]}: {val}
              </CBadge>,
            )
          }
        })
      }
    })
    return result
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

      {/* 상세 정보 모달 */}
      <CModal
        visible={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        backdrop="static"
        keyboard
        size="lg"
      >
        <CModalHeader>
          <CModalTitle>{selectedGame?.name}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedGame && (
            <>
              <p>
                <strong>설명:</strong> {selectedGame.description}
              </p>
              <p>
                <strong>동영상 URL:</strong>{' '}
                <a href={selectedGame.videoUrl} target="_blank" rel="noopener noreferrer">
                  {selectedGame.videoUrl}
                </a>
              </p>
              <p>
                <strong>로고 URL:</strong>{' '}
                <a href={selectedGame.logoUrl} target="_blank" rel="noopener noreferrer">
                  {selectedGame.logoUrl}
                </a>
              </p>
              <p>
                <strong>태그:</strong> {renderTags(selectedGame.tags)}
              </p>
              {selectedGame.tutorial && selectedGame.tutorial.length > 0 && (
                <>
                  <h5>튜토리얼</h5>
                  <ol>
                    {selectedGame.tutorial.map((t, idx) => (
                      <li key={idx}>{t.description}</li>
                    ))}
                  </ol>
                </>
              )}
              {selectedGame.controls && selectedGame.controls.length > 0 && (
                <>
                  <h5>조작법</h5>
                  <ul>
                    {selectedGame.controls.map((c, idx) => (
                      <li key={idx}>
                        <strong>{c.keyName}:</strong> {c.key.join(', ')}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {selectedGame.phaseData && (
                <>
                  <h5>PhaseData (페이즈 타이밍)</h5>
                  <ul>
                    {Object.entries(selectedGame.phaseData).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {value}ms
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {selectedGame.gameData && (
                <>
                  <h5>GameData</h5>
                  <pre
                    style={{
                      backgroundColor: '#f5f5f5',
                      padding: '10px',
                      borderRadius: '4px',
                      overflow: 'auto',
                      maxHeight: '300px',
                      fontSize: '0.9em',
                    }}
                  >
                    {JSON.stringify(selectedGame.gameData, null, 2)}
                  </pre>
                </>
              )}
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDetailModal(false)}>
            닫기
          </CButton>
        </CModalFooter>
      </CModal>

      {/* 생성/수정 모달 */}
      <CModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        backdrop="static"
        keyboard
        size="xl"
      >
        <CModalHeader>
          <CModalTitle>{selectedGame ? '미니게임 수정' : '미니게임 생성'}</CModalTitle>
        </CModalHeader>
        <CModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* 기본 정보 */}
          <h5 className="mb-3">기본 정보</h5>
          <CRow className="mb-3">
            <CFormLabel htmlFor="name" className="col-sm-3 col-form-label">
              게임 이름
            </CFormLabel>
            <CCol sm={9}>
              <CFormInput
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CFormLabel htmlFor="description" className="col-sm-3 col-form-label">
              설명
            </CFormLabel>
            <CCol sm={9}>
              <CFormTextarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CFormLabel htmlFor="videoUrl" className="col-sm-3 col-form-label">
              동영상 URL
            </CFormLabel>
            <CCol sm={9}>
              <CFormInput
                type="text"
                id="videoUrl"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              />
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CFormLabel htmlFor="logoUrl" className="col-sm-3 col-form-label">
              로고 URL
            </CFormLabel>
            <CCol sm={9}>
              <CFormInput
                type="text"
                id="logoUrl"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              />
            </CCol>
          </CRow>

          <hr className="my-4" />

          {/* 태그 설정 */}
          <h5 className="mb-3">태그 설정</h5>
          <CRow className="mb-3">
            <CFormLabel className="col-sm-3 col-form-label">규모 (Scale)</CFormLabel>
            <CCol sm={9}>
              <div>
                {['xs', 'small', 'medium', 'large', 'xl'].map((scale) => (
                  <CFormCheck
                    key={scale}
                    inline
                    id={`scale-${scale}`}
                    label={scale.toUpperCase()}
                    checked={formData.tags.scale.includes(scale)}
                    onChange={() => handleTagToggle('scale', scale)}
                  />
                ))}
              </div>
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CFormLabel className="col-sm-3 col-form-label">난이도 (Difficulty)</CFormLabel>
            <CCol sm={9}>
              <div>
                {['1', '2', '3', '4'].map((difficulty) => (
                  <CFormCheck
                    key={difficulty}
                    inline
                    id={`difficulty-${difficulty}`}
                    label={difficulty}
                    checked={formData.tags.difficulty.includes(difficulty)}
                    onChange={() => handleTagToggle('difficulty', difficulty)}
                  />
                ))}
              </div>
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CFormLabel className="col-sm-3 col-form-label">라운드 (Round)</CFormLabel>
            <CCol sm={9}>
              <div>
                {['1-2', '3-4', '5-6', '7-8', '9+'].map((round) => (
                  <CFormCheck
                    key={round}
                    inline
                    id={`round-${round}`}
                    label={round}
                    checked={formData.tags.round.includes(round)}
                    onChange={() => handleTagToggle('round', round)}
                  />
                ))}
              </div>
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CFormLabel className="col-sm-3 col-form-label">게임 타입 (Type)</CFormLabel>
            <CCol sm={9}>
              <div>
                {['simulation', 'strategy', 'choice', 'luck', 'coop', 'brain'].map((type) => (
                  <CFormCheck
                    key={type}
                    inline
                    id={`type-${type}`}
                    label={type}
                    checked={formData.tags.type.includes(type)}
                    onChange={() => handleTagToggle('type', type)}
                  />
                ))}
              </div>
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CFormLabel className="col-sm-3 col-form-label">생존률 (Survival Rate)</CFormLabel>
            <CCol sm={9}>
              <div>
                {['very_low', 'low', 'medium', 'high', 'very_high'].map((rate) => (
                  <CFormCheck
                    key={rate}
                    inline
                    id={`survivalRate-${rate}`}
                    label={rate.replace('_', ' ')}
                    checked={formData.tags.survivalRate.includes(rate)}
                    onChange={() => handleTagToggle('survivalRate', rate)}
                  />
                ))}
              </div>
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CFormLabel className="col-sm-3 col-form-label">승리 조건 (Win Condition)</CFormLabel>
            <CCol sm={9}>
              <div>
                {['first', 'score', 'rank', 'goal', 'accuracy'].map((condition) => (
                  <CFormCheck
                    key={condition}
                    inline
                    id={`winCondition-${condition}`}
                    label={condition}
                    checked={formData.tags.winCondition.includes(condition)}
                    onChange={() => handleTagToggle('winCondition', condition)}
                  />
                ))}
              </div>
            </CCol>
          </CRow>

          <hr className="my-4" />

          {/* 튜토리얼 */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">튜토리얼</h5>
            <CButton color="primary" size="sm" onClick={handleAddTutorial}>
              + 단계 추가
            </CButton>
          </div>
          {formData.tutorial.map((tutorial, index) => (
            <CRow key={index} className="mb-2">
              <CFormLabel className="col-sm-2 col-form-label">Step {tutorial.step}</CFormLabel>
              <CCol sm={8}>
                <CFormInput
                  type="text"
                  value={tutorial.description}
                  onChange={(e) => handleTutorialChange(index, e.target.value)}
                  placeholder="튜토리얼 설명을 입력하세요"
                />
              </CCol>
              <CCol sm={2}>
                <CButton
                  color="danger"
                  size="sm"
                  variant="outline"
                  onClick={() => handleRemoveTutorial(index)}
                >
                  삭제
                </CButton>
              </CCol>
            </CRow>
          ))}

          <hr className="my-4" />

          {/* 조작법 */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">조작법</h5>
            <CButton color="primary" size="sm" onClick={handleAddControl}>
              + 조작법 추가
            </CButton>
          </div>
          {formData.controls.map((control, controlIndex) => (
            <CCard key={controlIndex} className="mb-3">
              <CCardBody>
                <CRow className="mb-3">
                  <CCol sm={10}>
                    <CFormLabel>조작 이름</CFormLabel>
                    <CFormInput
                      type="text"
                      value={control.keyName}
                      onChange={(e) => handleControlChange(controlIndex, 'keyName', e.target.value)}
                      placeholder="예: 왼쪽 선택"
                    />
                  </CCol>
                  <CCol sm={2} className="d-flex align-items-end">
                    <CButton
                      color="danger"
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveControl(controlIndex)}
                      className="w-100"
                    >
                      조작법 삭제
                    </CButton>
                  </CCol>
                </CRow>
                <CFormLabel>키 입력</CFormLabel>
                {control.key.map((keyValue, keyIndex) => (
                  <CRow key={keyIndex} className="mb-2">
                    <CCol sm={10}>
                      <CFormInput
                        type="text"
                        value={keyValue}
                        onChange={(e) => handleKeyChange(controlIndex, keyIndex, e.target.value)}
                        placeholder={`키 ${keyIndex + 1}`}
                      />
                    </CCol>
                    <CCol sm={2}>
                      <CButton
                        color="danger"
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveKey(controlIndex, keyIndex)}
                        disabled={control.key.length <= 1}
                        className="w-100"
                      >
                        삭제
                      </CButton>
                    </CCol>
                  </CRow>
                ))}
                <CButton
                  color="secondary"
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddKey(controlIndex)}
                >
                  + 키 추가
                </CButton>
              </CCardBody>
            </CCard>
          ))}

          <hr className="my-4" />

          {/* PhaseData */}
          <h5 className="mb-3">PhaseData (페이즈 타이밍 - ms 단위)</h5>
          <CRow className="mb-2">
            <CFormLabel className="col-sm-3 col-form-label">READY</CFormLabel>
            <CCol sm={9}>
              <CFormInput
                type="number"
                value={formData.phaseData.READY}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phaseData: { ...formData.phaseData, READY: parseInt(e.target.value) || 0 },
                  })
                }
              />
            </CCol>
          </CRow>
          <CRow className="mb-2">
            <CFormLabel className="col-sm-3 col-form-label">SETUP</CFormLabel>
            <CCol sm={9}>
              <CFormInput
                type="number"
                value={formData.phaseData.SETUP}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phaseData: { ...formData.phaseData, SETUP: parseInt(e.target.value) || 0 },
                  })
                }
              />
            </CCol>
          </CRow>
          <CRow className="mb-2">
            <CFormLabel className="col-sm-3 col-form-label">PRESENT</CFormLabel>
            <CCol sm={9}>
              <CFormInput
                type="number"
                value={formData.phaseData.PRESENT}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phaseData: { ...formData.phaseData, PRESENT: parseInt(e.target.value) || 0 },
                  })
                }
              />
            </CCol>
          </CRow>
          <CRow className="mb-2">
            <CFormLabel className="col-sm-3 col-form-label">INPUT</CFormLabel>
            <CCol sm={9}>
              <CFormInput
                type="number"
                value={formData.phaseData.INPUT}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phaseData: { ...formData.phaseData, INPUT: parseInt(e.target.value) || 0 },
                  })
                }
              />
            </CCol>
          </CRow>
          <CRow className="mb-2">
            <CFormLabel className="col-sm-3 col-form-label">WAIT</CFormLabel>
            <CCol sm={9}>
              <CFormInput
                type="number"
                value={formData.phaseData.WAIT}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phaseData: { ...formData.phaseData, WAIT: parseInt(e.target.value) || 0 },
                  })
                }
              />
            </CCol>
          </CRow>
          <CRow className="mb-2">
            <CFormLabel className="col-sm-3 col-form-label">EXECUTE</CFormLabel>
            <CCol sm={9}>
              <CFormInput
                type="number"
                value={formData.phaseData.EXECUTE}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phaseData: { ...formData.phaseData, EXECUTE: parseInt(e.target.value) || 0 },
                  })
                }
              />
            </CCol>
          </CRow>
          <CRow className="mb-2">
            <CFormLabel className="col-sm-3 col-form-label">REVEAL</CFormLabel>
            <CCol sm={9}>
              <CFormInput
                type="number"
                value={formData.phaseData.REVEAL}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phaseData: { ...formData.phaseData, REVEAL: parseInt(e.target.value) || 0 },
                  })
                }
              />
            </CCol>
          </CRow>
          <CRow className="mb-2">
            <CFormLabel className="col-sm-3 col-form-label">CLEANUP</CFormLabel>
            <CCol sm={9}>
              <CFormInput
                type="number"
                value={formData.phaseData.CLEANUP}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phaseData: { ...formData.phaseData, CLEANUP: parseInt(e.target.value) || 0 },
                  })
                }
              />
            </CCol>
          </CRow>

          <hr className="my-4" />

          {/* GameData */}
          <h5 className="mb-3">GameData (게임별 커스텀 데이터 - JSON 형식)</h5>
          <CRow className="mb-3">
            <CCol sm={12}>
              <CFormTextarea
                rows={10}
                value={formData.gameData}
                onChange={(e) => setFormData({ ...formData, gameData: e.target.value })}
                placeholder='{"type": "quiz", "timeLimit": 8, ...}'
                style={{ fontFamily: 'monospace', fontSize: '0.9em' }}
              />
              <small className="text-muted">
                각 게임마다 다른 JSON 형식의 데이터를 입력하세요. 비워두면 null로 저장됩니다.
              </small>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowEditModal(false)}>
            취소
          </CButton>
          <CButton color="primary" onClick={handleSave} disabled={saving}>
            {saving ? <CSpinner size="sm" className="me-2" /> : null}
            {selectedGame ? '수정' : '생성'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* 삭제 확인 모달 */}
      <CModal
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        backdrop="static"
        keyboard
      >
        <CModalHeader>
          <CModalTitle>미니게임 삭제</CModalTitle>
        </CModalHeader>
        <CModalBody>
          정말 &quot;{gameToDelete?.name}&quot; 게임을 삭제하시겠습니까?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDeleteConfirm(false)}>
            취소
          </CButton>
          <CButton color="danger" onClick={handleDelete}>
            삭제
          </CButton>
        </CModalFooter>
      </CModal>

      <CContainer className="mt-4">
        <CCard>
          <CCardHeader>
            <div className="d-flex align-items-center justify-content-between" style={{ gap: 12 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                미니게임 관리 (총 {total}개)
              </h2>
              <div className="d-flex" style={{ gap: 8 }}>
                <CButton color="secondary" variant="outline" size="sm" onClick={load} disabled={loading}>
                  새로고침
                </CButton>
                <CButton color="primary" size="sm" onClick={handleCreateNew}>
                  + 새 게임 추가
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
                  <CTableHeaderCell scope="col">설명</CTableHeaderCell>
                  <CTableHeaderCell scope="col">태그</CTableHeaderCell>
                  <CTableHeaderCell scope="col" style={{ width: 250 }}>
                    Action
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {loading ? (
                  <CTableRow>
                    <CTableDataCell colSpan={5} className="text-center">
                      <CSpinner />
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  games.map((game) => (
                    <CTableRow key={game.id}>
                      <CTableDataCell>{game.id}</CTableDataCell>
                      <CTableDataCell>{game.name}</CTableDataCell>
                      <CTableDataCell>
                        {game.description?.length > 50
                          ? `${game.description.substring(0, 50)}...`
                          : game.description}
                      </CTableDataCell>
                      <CTableDataCell>{renderTags(game.tags)}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="info"
                          size="sm"
                          variant="outline"
                          className="me-2"
                          onClick={() => handleShowDetail(game.id)}
                        >
                          상세
                        </CButton>
                        <CButton
                          color="primary"
                          size="sm"
                          variant="outline"
                          className="me-2"
                          onClick={() => handleEdit(game.id)}
                        >
                          수정
                        </CButton>
                        <CButton
                          color="danger"
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteConfirm(game)}
                        >
                          삭제
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

export default React.memo(Minigame)
