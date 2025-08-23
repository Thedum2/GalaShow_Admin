import { api } from '../client'
import { unwrap } from '../unwrap'

export async function getSnsLinks() {
  const res = await api.get('/sns-links')
  const data = unwrap(res)
  return Array.isArray(data) ? data : []
}

export async function putSnsLinks(list) {
  const res = await api.put('/sns-links', { data: list })
  const data = unwrap(res)
  return data?.success === true
}
