const MODE = (import.meta.env.MODE ?? 'development').toString().toLowerCase()

export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '') ||
  (MODE === 'production' ? 'https://api.galashow.cloud' : 'https://api-dev.galashow.cloud')

export function isDev() {
  return MODE === 'development'
}

export function isProd() {
  return MODE === 'production'
}
