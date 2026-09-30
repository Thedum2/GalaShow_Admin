import assert from 'node:assert/strict'
import test from 'node:test'

// tokenStorage.js는 브라우저 sessionStorage와 window 이벤트를 사용한다.
const store = new Map()
globalThis.sessionStorage = {
  getItem: (key) => (store.has(key) ? store.get(key) : null),
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key),
}
const events = []
globalThis.window = { dispatchEvent: (event) => events.push(event.type) }

const tokens = await import('../src/api/tokenStorage.js')

test('refresh responses replace both tokens because the server rotates refresh tokens', () => {
  tokens.saveTokenBundle({ accessToken: 'a1', refreshToken: 'r1', expiresIn: 900 })
  tokens.saveTokenBundle({ accessToken: 'a2', refreshToken: 'r2', expiresIn: 900 })
  assert.equal(tokens.getAccessToken(), 'a2')
  assert.equal(tokens.getRefreshToken(), 'r2')
})

test('expiry uses expiresIn relative to the local clock before the server timestamp', () => {
  const before = Date.now()
  tokens.saveTokenBundle({
    accessToken: 'a',
    refreshToken: 'r',
    expiresIn: 600,
    accessExpiresAt: '2000-01-01T00:00:00Z',
  })
  const expiresAt = tokens.getAccessExpiresAt()
  assert.ok(expiresAt >= before + 600_000 && expiresAt <= Date.now() + 600_000)

  tokens.saveTokenBundle({
    accessToken: 'a',
    refreshToken: 'r',
    accessExpiresAt: '2030-01-01T00:00:00Z',
  })
  assert.equal(tokens.getAccessExpiresAt(), Date.parse('2030-01-01T00:00:00Z'))
})

test('clearing tokens removes everything and notifies listeners', () => {
  events.length = 0
  tokens.clearTokens()
  assert.equal(tokens.getAccessToken(), null)
  assert.equal(tokens.getRefreshToken(), null)
  assert.equal(tokens.getAccessExpiresAt(), null)
  assert.deepEqual(events, [tokens.AUTH_CHANGED_EVENT])
})
