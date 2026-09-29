import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

import { API_DOCS_SERVER, apiDocs, withDevServer } from '../vite/apiDocs.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))

async function emitted(mode) {
  const files = []
  await apiDocs({ mode, root }).generateBundle.call({ emitFile: (file) => files.push(file) })
  return files
}

test('API docs are emitted only for the development build', async () => {
  assert.deepEqual(await emitted('production'), [])
  const files = await emitted('development')
  assert.deepEqual(files.map((file) => file.fileName).sort(), [
    'api-docs/index.html',
    'api-docs/swagger.yaml',
  ])
})

test('the published spec lists the dev API first and keeps the original servers', async () => {
  const source = await readFile(new URL('../api-docs/swagger.yaml', import.meta.url), 'utf8')
  const spec = withDevServer(source)
  const servers = spec.slice(spec.indexOf('\nservers:\n'), spec.indexOf('\ntags:\n'))
  assert.ok(servers.startsWith(`\nservers:\n- url: ${API_DOCS_SERVER}\n`))
  assert.ok(servers.includes('- url: http://127.0.0.1:3000'))
  assert.throws(() => withDevServer('openapi: 3.0.3\n'))
})
