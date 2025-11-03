import { api } from '../client'
import { unwrap } from '../unwrap'

function isValidUrl(str) {
  try {
    const u = new URL(str)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * [3-1] 정책 조회
 * GET /policies
 * 반환: { termsOfService: string, privacyPolicy: string }
 */
export async function getPolicies() {
  const res = await api.get('/policies')
  const data = unwrap(unwrap(res))
  return {
    termsOfService: data?.termsOfService ?? '',
    privacyPolicy: data?.privacyPolicy ?? '',
  }
}

/**
 * [3-2] 정책 수정
 * PUT /policies
 * @param {{ termsOfService: string, privacyPolicy: string }}
 * 반환: true/false (성공 여부)
 * 성공 여부만 보면 되므로 unwrap 1번만 호출해서 ApiResponse.success 확인
 */
export async function updatePolicies({ termsOfService, privacyPolicy }) {
  const tos = String(termsOfService || '').trim()
  const pp  = String(privacyPolicy || '').trim()

  if (!tos) throw new Error('이용약관(termsOfService) 링크가 필요합니다.')
  if (!pp)  throw new Error('개인정보처리방침(privacyPolicy) 링크가 필요합니다.')
  if (!isValidUrl(tos)) throw new Error('이용약관 링크가 올바른 URL이 아닙니다.')
  if (!isValidUrl(pp))  throw new Error('개인정보처리방침 링크가 올바른 URL이 아닙니다.')

  const res = await api.put('/policies', { termsOfService: tos, privacyPolicy: pp })
  return res.status === 200;
}
