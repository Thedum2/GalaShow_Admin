import React from 'react'
import { CFooter } from '@coreui/react'
import { isDev } from '../lib/env'

const AppFooter = () => (
  <CFooter className="workspace-footer">
    <span>© {new Date().getFullYear()} GALASHOW</span>
    <span>
      <span className="footer-star" aria-hidden="true">
        ✦
      </span>{' '}
      {isDev() ? 'Development' : 'Live'} workspace
    </span>
  </CFooter>
)

export default React.memo(AppFooter)
