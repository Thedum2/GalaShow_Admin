import React from 'react'
import { isDev } from '../lib/env'

const EnvironmentBadge = () => (
  <span className={`environment-badge ${isDev() ? 'environment-dev' : 'environment-live'}`}>
    <span className="environment-dot" aria-hidden="true" />
    {isDev() ? 'DEV' : 'LIVE'}
    <span className="environment-label">{isDev() ? '개발 환경' : '운영 환경'}</span>
  </span>
)

export default EnvironmentBadge
