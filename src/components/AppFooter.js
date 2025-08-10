import React from 'react'
import {CFooter} from '@coreui/react'
import {isDev} from "src/lib/env";

const AppFooter = () => {

  const color = isDev ? 'purple' : 'red'
  const weight = '1000'

  return (
    <CFooter className="px-4 d-flex align-items-center justify-content-between">
      <div>
        Galashow Admin &copy; {new Date().getFullYear()}
      </div>
      <div className="d-flex align-items-center">
        <span className="me-2">Current Server is [</span>
        <h3 style={{color, fontWeight: weight}}>
          {isDev ? 'DEV' : 'LIVE'}
        </h3>
        <span className="me-2">]</span>

      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
