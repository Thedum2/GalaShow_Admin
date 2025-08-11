import { api } from '../client';
import { unwrap } from '../unwrap';

/**
 * [2-1] 배경 목록 조회
 */
export async function getBackgrounds() {
  const res = await api.get('/background');
  const rows = unwrap(unwrap(res));
  return Array.isArray(rows) ? rows : [];
}

/**
 * [2-2] 배경 수정
 */
export async function updateBackground({ backId, title, type, url }) {
  if (!backId) throw new Error('backId 필요합니다.');
  if (!title?.trim()) throw new Error('title이 필요합니다.');
  if (!type || !['image', 'video'].includes(type)) throw new Error('type은 "image" 또는 "video"여야 합니다.');
  if (!url?.trim()) throw new Error('url이 필요합니다.');

  const body = { title, type, url };
  const res = await api.put(`/background/${backId}`, body);
  const payload = unwrap(res); // { success: true, status: "200" }
  return payload?.success === true;
}
