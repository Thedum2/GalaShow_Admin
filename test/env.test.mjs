import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { SourceTextModule } from 'node:vm'

async function loadEnv(env) {
  const source = await readFile(new URL('../src/lib/env.js', import.meta.url), 'utf8')
  const module = new SourceTextModule(source, {
    initializeImportMeta(meta) {
      meta.env = env
    },
  })
  await module.link(() => {})
  await module.evaluate()
  return module.namespace
}

test('admin requests default to the API for the selected build mode', async () => {
  for (const [mode, expected] of [
    ['development', 'https://api-dev.galashow.cloud'],
    ['production', 'https://api.galashow.cloud'],
  ]) {
    for (const value of [undefined, '', '   ']) {
      const env = await loadEnv({ MODE: mode, VITE_API_URL: value })
      assert.equal(env.API_BASE_URL, expected)
      assert.equal(env.isProd(), mode === 'production')
      assert.equal(env.isDev(), mode === 'development')
    }
  }
})

test('explicit API overrides preserve paths and normalize trailing slashes', async () => {
  const env = await loadEnv({ MODE: 'production', VITE_API_URL: ' http://localhost:8080/api/// ' })
  assert.equal(env.API_BASE_URL, 'http://localhost:8080/api')
})

test('legacy VITE_MODE cannot switch a production build to development', async () => {
  const env = await loadEnv({ MODE: 'production', VITE_MODE: 'development' })
  assert.equal(env.API_BASE_URL, 'https://api.galashow.cloud')
  assert.equal(env.isProd(), true)
  assert.equal(env.isDev(), false)
})
