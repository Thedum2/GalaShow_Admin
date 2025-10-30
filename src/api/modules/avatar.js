import { api } from '../client'
import { unwrap } from '../unwrap'

/**
 * [6-9] 시청자 아바타 목록 조회
 * @returns {Promise<Array>} 아바타 목록
 */
export async function getViewerAvatars() {
  const res = await api.get('/viewer-avatars')
  const rows = unwrap(unwrap(res))
  return Array.isArray(rows) ? rows : []
}

/**
 * [6-10] 시청자 아바타 목록 수정
 * @param {Array} data - 아바타 목록
 * @returns {Promise<boolean>}
 */
export async function updateViewerAvatars(data) {
  if (!Array.isArray(data)) throw new Error('data는 배열이어야 합니다.')

  const res = await api.put('/viewer-avatars', { data })
  unwrap(res)
  // 에러가 발생하지 않으면 성공
  return true
}
