import { readFile } from 'node:fs/promises'
import path from 'node:path'

// Swagger UI는 개발 빌드에만 포함한다. 운영 Admin에는 API 문서를 공개하지 않는다.
export const API_DOCS_MODE = 'development'
export const API_DOCS_SERVER = 'https://api-dev.galashow.cloud'

const SERVERS_ANCHOR = '\nservers:\n'

// 원본 명세(docs/swagger.yaml 사본)의 서버 목록 맨 앞에 개발 API를 추가해 Try it out 기본값으로 쓴다.
export function withDevServer(source) {
  const spec = source.replace(/\r\n/g, '\n')
  if (!spec.includes(SERVERS_ANCHOR)) {
    throw new Error('api-docs/swagger.yaml: servers 목록을 찾을 수 없습니다.')
  }
  return spec.replace(
    SERVERS_ANCHOR,
    `${SERVERS_ANCHOR}- url: ${API_DOCS_SERVER}\n  description: 개발 API (admin-dev에서 CORS 허용)\n`,
  )
}

export function apiDocs({ mode, root }) {
  return {
    name: 'galashow-api-docs',
    apply: 'build',
    async generateBundle() {
      if (mode !== API_DOCS_MODE) return
      const dir = path.join(root, 'api-docs')
      const [html, spec] = await Promise.all([
        readFile(path.join(dir, 'index.html'), 'utf8'),
        readFile(path.join(dir, 'swagger.yaml'), 'utf8'),
      ])
      this.emitFile({ type: 'asset', fileName: 'api-docs/index.html', source: html })
      this.emitFile({
        type: 'asset',
        fileName: 'api-docs/swagger.yaml',
        source: withDevServer(spec),
      })
    },
  }
}
