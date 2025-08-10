const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';
const EXPIRES_AT_KEY = 'accessTokenExpiresAt';

export const getAccessToken = () => localStorage.getItem(ACCESS_KEY);
export const setAccessToken = (token, expiresAt) => {
  localStorage.setItem(ACCESS_KEY, token);
  if (expiresAt) localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));
};
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);
export const setRefreshToken = (token) => {
  if (token) localStorage.setItem(REFRESH_KEY, token);
};
export const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
};
