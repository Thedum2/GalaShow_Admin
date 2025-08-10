import axios from 'axios';
import { unwrap } from './unwrap';
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearTokens,
} from './tokenStorage';

const BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

const AUTH_WHITELIST = ['/login'];

api.interceptors.request.use((config) => {
  const skip = AUTH_WHITELIST.some((p) => config.url?.includes(p));
  const token = getAccessToken();
  if (!skip && token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----- 401 동시성 제어용 큐 -----
let isRefreshing = false;
let queue = [];
const enqueue = (cb) => queue.push(cb);
const flush = (newToken) => {
  queue.forEach((cb) => cb(newToken));
  queue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config: original, response } = error;

    // 네트워크 에러 등
    if (!response) return Promise.reject(error);

    // 401이 아니거나, 화이트리스트 요청이면 그대로 에러 반환
    if (response.status !== 401 || AUTH_WHITELIST.some((p) => original?.url?.includes(p))) {
      return Promise.reject(error);
    }

    // 이미 리프레시 중이면 큐에 등록 후 새 토큰으로 재시도
    if (isRefreshing) {
      return new Promise((resolve) => {
        enqueue((newToken) => {
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(original));
        });
      });
    }

    isRefreshing = true;
    try {
      const plain = axios.create({ baseURL: BASE_URL });
      const body = { refreshToken: getRefreshToken() };

      const refreshRes = await plain.post('/auth/refresh', body);
      const refreshed = unwrap(refreshRes) || {};
      const { accessToken, accessExpiresAt, expiresIn } = refreshed;

      if (!accessToken) throw new Error('No accessToken in refresh response');

      const computedExp =
        accessExpiresAt ||
        (expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : undefined);
      setAccessToken(accessToken, computedExp);

      isRefreshing = false;
      flush(accessToken);

      // 실패했던 원요청 Authorization 갱신 후 재시도
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch (e) {
      isRefreshing = false;
      queue = [];

      clearTokens();
      return Promise.reject(e);
    }
  }
);
