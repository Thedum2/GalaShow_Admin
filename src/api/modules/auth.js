import { api } from '../client';
import { unwrap } from '../unwrap';
import { setAccessToken, setRefreshToken, clearTokens } from '../tokenStorage';

export async function login({ id, email, password }) {
  if (!password || (!id && !email)) {
    throw new Error('아이디/이메일 또는 비밀번호가 없습니다.');
  }


  const body = { id: id ?? email, email, password };
  const res = await api.post('/auth/login', body);
  const payload = unwrap(res);

  const {
    accessToken,
    refreshToken,
    accessExpiresAt,
    expiresIn,
    user,
  } = payload || {};

  if (!accessToken) {
    throw new Error('응답에 accessToken이 없습니다.');
  }

  const computedExp =
    accessExpiresAt ||
    (typeof expiresIn === 'number'
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : undefined);

  setAccessToken(accessToken, computedExp);
  if (refreshToken) setRefreshToken(refreshToken);

  return user;
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } finally {
    clearTokens();
  }
}
