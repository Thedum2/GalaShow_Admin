import React, { useEffect, useState, useCallback } from 'react'
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
} from '@coreui/react'
import { questionCategories, questions } from 'src/api/modules/question'

const Question = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [questionsList, setQuestionsList] = useState([])

  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryName, setCategoryName] = useState('')
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState(null)

  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [questionTitle, setQuestionTitle] = useState('')
  const [questionChoices, setQuestionChoices] = useState([{ text: '', imageUrl: '' }])
  const [confirmDeleteQuestion, setConfirmDeleteQuestion] = useState(null)

  const [showQuestionViewModal, setShowQuestionViewModal] = useState(false)
  const [viewingQuestion, setViewingQuestion] = useState(null)

  const loadCategories = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await questionCategories.getAll()
      setCategories(data || [])
    } catch (e) {
      console.error(e)
      setError('카테고리 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadQuestions = useCallback(async (categoryId) => {
    if (!categoryId) {
      setQuestionsList([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await questionCategories.getQuestionsByCategoryId(categoryId)
      setQuestionsList(data || [])
    } catch (e) {
      console.error(e)
      setError('질문 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  useEffect(() => {
    if (selectedCategoryId) {
      loadQuestions(selectedCategoryId)
    }
  }, [selectedCategoryId, loadQuestions])

  const handleCategoryCreateClick = () => {
    setEditingCategory(null)
    setCategoryName('')
    setShowCategoryModal(true)
  }

  const handleCategoryEditClick = (category) => {
    setEditingCategory(category)
    setCategoryName(category.name)
    setShowCategoryModal(true)
  }

  const handleCategorySave = async () => {
    if (!categoryName.trim()) {
      alert('카테고리 이름을 입력해주세요.')
      return
    }
    setLoading(true)
    try {
      if (editingCategory) {
        await questionCategories.update(editingCategory.id, categoryName)
      } else {
        await questionCategories.create(categoryName)
      }
      setShowCategoryModal(false)
      loadCategories()
    } catch (e) {
      console.error(e)
      setError('카테고리 저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryDelete = async () => {
    if (!confirmDeleteCategory) return
    setLoading(true)
    try {
      await questionCategories.remove(confirmDeleteCategory.id)
      setConfirmDeleteCategory(null)
      setSelectedCategoryId(null) // Deselect category if deleted
      loadCategories()
    } catch (e) {
      console.error(e)
      setError('카테고리 삭제에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuestionCreateClick = () => {
    setEditingQuestion(null)
    setQuestionTitle('')
    setQuestionChoices([
      { text: '', imageUrl: '' },
      { text: '', imageUrl: '' },
    ])
    setShowQuestionModal(true)
  }

  const handleQuestionEditClick = async (questionId) => {
    setLoading(true)
    try {
      const data = await questions.getById(questionId)
      setEditingQuestion(data)
      setQuestionTitle(data.title)
      const choices = data.choices.length > 0 ? data.choices : [{ text: '', imageUrl: '' }]
      while (choices.length < 2) {
        choices.push({ text: '', imageUrl: '' })
      }
      setQuestionChoices(choices)
      setShowQuestionModal(true)
    } catch (e) {
      console.error(e)
      setError('질문 상세 정보를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuestionSave = async () => {
    if (!selectedCategoryId) {
      alert('카테고리를 선택해주세요.')
      return
    }
    if (!questionTitle.trim()) {
      alert('질문 제목을 입력해주세요.')
      return
    }
    const filteredChoices = questionChoices.filter(
      (choice) => choice.text.trim() !== '' || choice.imageUrl.trim() !== '',
    )
    if (filteredChoices.length < 2 || filteredChoices.length > 4) {
      alert('선택지는 2개 이상, 4개 이하로 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const choicesPayload = filteredChoices.map((choice) => ({
        text: choice.text.trim() === '' ? null : choice.text.trim(),
        imageUrl: choice.imageUrl.trim() === '' ? null : choice.imageUrl.trim(),
      }))

      if (editingQuestion) {
        await questions.update(editingQuestion.id, questionTitle, choicesPayload)
      } else {
        await questions.create(selectedCategoryId, questionTitle, choicesPayload)
      }
      setShowQuestionModal(false)
      loadQuestions(selectedCategoryId)
    } catch (e) {
      console.error(e)
      setError('질문 저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuestionDelete = async () => {
    if (!confirmDeleteQuestion) return
    setLoading(true)
    try {
      await questions.remove(confirmDeleteQuestion.id)
      setConfirmDeleteQuestion(null)
      loadQuestions(selectedCategoryId)
    } catch (e) {
      console.error(e)
      setError('질문 삭제에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleChoiceChange = (index, field, value) => {
    const newChoices = [...questionChoices]
    newChoices[index][field] = value
    setQuestionChoices(newChoices)
  }

  const handleAddChoice = () => {
    if (questionChoices.length >= 4) {
      alert('선택지는 최대 4개까지 추가할 수 있습니다.')
      return
    }
    setQuestionChoices([...questionChoices, { text: '', imageUrl: '' }])
  }

  const handleRemoveChoice = (index) => {
    if (questionChoices.length <= 2) {
      alert('선택지는 최소 2개 이상이어야 합니다.')
      return
    }
    const newChoices = [...questionChoices]
    newChoices.splice(index, 1)
    setQuestionChoices(newChoices)
  }



  const handleQuestionViewClick = async (questionId) => {
    setLoading(true)
    try {
      const data = await questions.getById(questionId)
      setViewingQuestion(data)
      setShowQuestionViewModal(true)
    } catch (e) {
      console.error(e)
      setError('질문 상세 정보를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Error Modal */}
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

      {/* Category Modal */}
      <CModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        backdrop="static"
        keyboard
      >
        <CModalHeader>
          <CModalTitle>{editingCategory ? '카테고리 수정' : '새 카테고리 생성'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            type="text"
            placeholder="카테고리 이름"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setShowCategoryModal(false)}>
            취소
          </CButton>
          <CButton color="primary" onClick={handleCategorySave} disabled={loading}>
            저장
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Confirm Delete Category Modal */}
      <CModal
        visible={!!confirmDeleteCategory}
        onClose={() => setConfirmDeleteCategory(null)}
        backdrop="static"
        keyboard
      >
        <CModalHeader>
          <CModalTitle>카테고리 삭제 확인</CModalTitle>
        </CModalHeader>
        <CModalBody>
          '{confirmDeleteCategory?.name}' 카테고리를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수
          없습니다.
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            variant="outline"
            onClick={() => setConfirmDeleteCategory(null)}
          >
            취소
          </CButton>
          <CButton color="danger" onClick={handleCategoryDelete} disabled={loading}>
            삭제
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Question Modal */}
      <CModal
        visible={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
        backdrop="static"
        keyboard
        size="lg"
      >
        <CModalHeader>
          <CModalTitle>{editingQuestion ? '질문 수정' : '새 질문 생성'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <label className="form-label">질문 제목</label>
            <CFormInput
              type="text"
              placeholder="질문 제목"
              value={questionTitle}
              onChange={(e) => setQuestionTitle(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">선택지</label>
            {questionChoices.map((choice, index) => (
              <div key={index} className="d-flex align-items-center mb-2" style={{ gap: 8 }}>
                <CFormInput
                  type="text"
                  placeholder="선택지 텍스트"
                  value={choice.text}
                  onChange={(e) => handleChoiceChange(index, 'text', e.target.value)}
                  className="flex-grow-1"
                />
                <CFormInput
                  type="url"
                  placeholder="이미지 URL (선택 사항)"
                  value={choice.imageUrl}
                  onChange={(e) => handleChoiceChange(index, 'imageUrl', e.target.value)}
                  className="flex-grow-1"
                />
                <CButton color="danger" variant="outline" onClick={() => handleRemoveChoice(index)}>
                  삭제
                </CButton>
              </div>
            ))}
            <CButton color="success" variant="outline" onClick={handleAddChoice}>
              선택지 추가
            </CButton>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setShowQuestionModal(false)}>
            취소
          </CButton>
          <CButton color="primary" onClick={handleQuestionSave} disabled={loading}>
            저장
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Question View Modal */}
      <CModal
        visible={showQuestionViewModal}
        onClose={() => setShowQuestionViewModal(false)}
        size="lg"
      >
        <CModalHeader>
          <CModalTitle>질문 조회</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {viewingQuestion && (
            <div>
              <h5>{viewingQuestion.title}</h5>
              <hr />
              {viewingQuestion.choices.map((choice, index) => (
                <div key={index} className="mb-3">
                  <strong>선택지 {index + 1}:</strong> {choice.text}
                  {choice.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={choice.imageUrl}
                        alt={`Choice ${index + 1}`}
                        style={{ maxWidth: '100%', maxHeight: '200px' }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowQuestionViewModal(false)}>
            닫기
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Confirm Delete Question Modal */}
      <CModal
        visible={!!confirmDeleteQuestion}
        onClose={() => setConfirmDeleteQuestion(null)}
        backdrop="static"
        keyboard
      >
        <CModalHeader>
          <CModalTitle>질문 삭제 확인</CModalTitle>
        </CModalHeader>
        <CModalBody>
          '{confirmDeleteQuestion?.title}' 질문을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수
          없습니다.
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            variant="outline"
            onClick={() => setConfirmDeleteQuestion(null)}
          >
            취소
          </CButton>
          <CButton color="danger" onClick={handleQuestionDelete} disabled={loading}>
            삭제
          </CButton>
        </CModalFooter>
      </CModal>

      <CContainer className="mt-4">
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex align-items-center justify-content-between" style={{ gap: 12 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                질문 카테고리 관리
              </h2>
              <CButton color="primary" size="sm" onClick={handleCategoryCreateClick}>
                새 카테고리 추가
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style={{ width: 60 }}>ID</CTableHeaderCell>
                  <CTableHeaderCell>카테고리 이름</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 220 }}>액션</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {loading ? (
                  <CTableRow>
                    <CTableDataCell colSpan="3" className="text-center">
                      <CSpinner size="sm" /> 로딩 중...
                    </CTableDataCell>
                  </CTableRow>
                ) : categories.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="3" className="text-center">
                      카테고리가 없습니다.
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  categories.map((category) => (
                    <CTableRow key={category.id} active={selectedCategoryId === category.id}>
                      <CTableDataCell>{category.id}</CTableDataCell>
                      <CTableDataCell>{category.name}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="info"
                          variant="outline"
                          size="sm"
                          className="me-2"
                          onClick={() => setSelectedCategoryId(category.id)}
                        >
                          선택
                        </CButton>
                        <CButton
                          color="warning"
                          variant="outline"
                          size="sm"
                          className="me-2"
                          onClick={() => handleCategoryEditClick(category)}
                        >
                          수정
                        </CButton>
                        <CButton
                          color="danger"
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmDeleteCategory(category)}
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

        {selectedCategoryId && (
          <CCard>
            <CCardHeader>
              <div
                className="d-flex align-items-center justify-content-between"
                style={{ gap: 12 }}
              >
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                  선택된 카테고리 질문 관리 (ID: {selectedCategoryId})
                </h2>
                <CButton color="primary" size="sm" onClick={handleQuestionCreateClick}>
                  새 질문 추가
                </CButton>
              </div>
            </CCardHeader>
            <CCardBody>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell style={{ width: 60 }}>ID</CTableHeaderCell>
                    <CTableHeaderCell>질문 제목</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: 220 }}>액션</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {loading ? (
                    <CTableRow>
                      <CTableDataCell colSpan="3" className="text-center">
                        <CSpinner size="sm" /> 로딩 중...
                      </CTableDataCell>
                    </CTableRow>
                  ) : questionsList.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan="3" className="text-center">
                        선택된 카테고리에 질문이 없습니다.
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    questionsList.map((question) => (
                      <CTableRow key={question.id}>
                        <CTableDataCell>{question.id}</CTableDataCell>
                        <CTableDataCell>{question.title}</CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="info"
                            variant="outline"
                            size="sm"
                            className="me-2"
                            onClick={() => handleQuestionViewClick(question.id)}
                          >
                            조회
                          </CButton>
                          <CButton
                            color="warning"
                            variant="outline"
                            size="sm"
                            className="me-2"
                            onClick={() => handleQuestionEditClick(question.id)}
                          >
                            수정
                          </CButton>
                          <CButton
                            color="danger"
                            variant="outline"
                            size="sm"
                            onClick={() => setConfirmDeleteQuestion(question)}
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
        )}
      </CContainer>
    </>
  )
}

export default React.memo(Question)
