import { api } from '../client';
import { unwrap } from '../unwrap';

/**
 * [1-1] 배너 목록 조회 (무조건 최대 10개)
 * 서버 응답이 double-wrapped 형식이라 unwrap을 두 번 호출합니다.
 * 반환: [{ id, message, order }, ...]
 */
export async function getBanners() {
  const res = await api.get('/banners');
  const rows = unwrap(unwrap(res));
  return Array.isArray(rows) ? rows : [];
}

/**
 * [1-2] 배너 수정
 * 반환: true/false (성공 여부)
 */
export async function updateBanner({ bannerId, message }) {
  if (!bannerId) throw new Error('bannerId가 필요합니다.');
  if (!message?.trim()) throw new Error('message가 필요합니다.');

  const res = await api.put(`/banners/${bannerId}`, { message });
  return res.status === 200;
}
