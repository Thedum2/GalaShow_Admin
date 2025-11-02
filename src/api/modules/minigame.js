import { api } from '../client'
import { unwrap } from '../unwrap'

/**
 * [6-1] 미니게임 목록 조회
 * @param {Object} params - 필터 파라미터
 * @param {string} params.scale - xl, large, medium, small, xs
 * @param {string} params.difficulty - 1, 2, 3, 4
 * @param {string} params.round - 1-2, 3-4, 5-6, 7-8, 9+
 * @param {string} params.type - simulation, strategy, choice, luck, coop, brain (쉼표로 구분)
 * @param {string} params.survivalRate - very_high, high, medium, low, very_low
 * @param {string} params.winCondition - first, score, rank, goal, accuracy
 * @returns {Promise<{total: number, items: Array}>}
 */
export async function getMinigames(params = {}) {
  const res = await api.get('/minigames', { params })
  return unwrap(unwrap(res))
}

/**
 * [6-2] 미니게임 상세 조회
 * @param {number} gameId - 게임 ID
 * @returns {Promise<Object>} 미니게임 상세 정보 (튜토리얼, 조작법 포함)
 */
export async function getMinigameById(gameId) {
  if (!gameId) throw new Error('gameId가 필요합니다.')
  const res = await api.get(`/minigames/${gameId}`)
  return unwrap(unwrap(res))
}

/**
 * [6-3] 미니게임 생성
 * @param {Object} data - 게임 데이터
 * @param {string} data.name - 게임 이름
 * @param {string} data.description - 게임 설명
 * @param {string} data.videoUrl - 미리보기 동영상 URL
 * @param {string} data.logoUrl - 로고 이미지 URL
 * @param {Object} data.tags - 태그 객체
 * @param {Array} data.tutorial - 튜토리얼 배열
 * @param {Array} data.controls - 조작법 배열
 * @param {Object} data.phaseData - 페이즈 타이밍 데이터 (ms 단위)
 * @param {Object} data.gameData - 게임별 커스텀 데이터 (JSON)
 * @returns {Promise<Object>}
 */
export async function createMinigame(data) {
  if (!data.name?.trim()) throw new Error('name이 필요합니다.')
  if (!data.description?.trim()) throw new Error('description이 필요합니다.')

  const res = await api.post('/minigames', data)
  return unwrap(unwrap(res))
}

/**
 * [6-4] 미니게임 수정
 * @param {number} gameId - 게임 ID
 * @param {Object} data - 수정할 게임 데이터
 * @returns {Promise<Object>}
 */
export async function updateMinigame(gameId, data) {
  if (!gameId) throw new Error('gameId가 필요합니다.')

  const res = await api.put(`/minigames/${gameId}`, data)
  return unwrap(unwrap(res))
}

/**
 * [6-5] 미니게임 삭제
 * @param {number} gameId - 게임 ID
 * @returns {Promise<boolean>}
 */
export async function deleteMinigame(gameId) {
  if (!gameId) throw new Error('gameId가 필요합니다.')

  const res = await api.delete(`/minigames/${gameId}`)
  unwrap(res)
  // 에러가 발생하지 않으면 성공
  return true
}

/**
 * [6-6] 미니게임 생존률 조회
 * @param {number} gameId - 게임 ID
 * @returns {Promise<Object>} 생존률 통계
 */
export async function getMinigameSurvivalRate(gameId) {
  if (!gameId) throw new Error('gameId가 필요합니다.')

  const res = await api.get(`/minigames/${gameId}/survival-rate`)
  return unwrap(unwrap(res))
}

/**
 * [6-7] 미니게임 생존률 데이터 추가
 * @param {number} gameId - 게임 ID
 * @param {Object} data - 생존률 데이터
 * @param {number} data.totalPlayers - 총 플레이어 수
 * @param {number} data.survivors - 생존자 수
 * @returns {Promise<Object>}
 */
export async function addMinigameSurvivalRate(gameId, data) {
  if (!gameId) throw new Error('gameId가 필요합니다.')
  if (!data.totalPlayers || !data.survivors) {
    throw new Error('totalPlayers와 survivors가 필요합니다.')
  }

  const res = await api.post(`/minigames/${gameId}/survival-rate`, data)
  return unwrap(unwrap(res))
}

/**
 * [6-8] 미니게임 생존률 수정 (관리자)
 * @param {number} gameId - 게임 ID
 * @param {Object} data - 수정할 생존률 데이터
 * @param {number} data.survivalRate - 생존률
 * @param {number} data.totalGames - 총 게임 수
 * @param {number} data.totalPlayers - 총 플레이어 수
 * @param {number} data.survivors - 생존자 수
 * @returns {Promise<Object>}
 */
export async function updateMinigameSurvivalRate(gameId, data) {
  if (!gameId) throw new Error('gameId가 필요합니다.')

  const res = await api.put(`/minigames/${gameId}/survival-rate`, data)
  return unwrap(unwrap(res))
}
