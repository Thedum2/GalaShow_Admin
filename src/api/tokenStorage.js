const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';
const EXPIRES_AT_KEY = 'accessTokenExpiresAt';

const STORE = sessionStorage;

export const getAccessToken = () => STORE.getItem(ACCESS_KEY);
export const setAccessToken = (token, expiresAt) => {
  STORE.setItem(ACCESS_KEY, token);
  if (expiresAt) STORE.setItem(EXPIRES_AT_KEY, String(expiresAt));
};
export const getRefreshToken = () => STORE.getItem(REFRESH_KEY);
export const setRefreshToken = (token) => {
  if (token) STORE.setItem(REFRESH_KEY, token);
};
export const clearTokens = () => {
  STORE.removeItem(ACCESS_KEY);
  STORE.removeItem(REFRESH_KEY);
  STORE.removeItem(EXPIRES_AT_KEY);
};
