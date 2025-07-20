import React from 'react'
import {CFooter} from '@coreui/react'

const MODE = import.meta.env.MODE
const isDev = MODE === 'development'

const AppFooter = () => {

  const color = isDev ? 'purple' : 'red'
  const weight = '1000'

  return (
    <CFooter className="px-4 d-flex align-items-center justify-content-between">
      <div>
        Galashow Admin &copy; {new Date().getFullYear()}
      </div>
      <div className="d-flex align-items-center">
        <span className="me-2">Current Server:</span>
        <h3 style={{color, fontWeight: weight}}>
          {isDev ? 'DEV' : 'LIVE'}
        </h3>

      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
