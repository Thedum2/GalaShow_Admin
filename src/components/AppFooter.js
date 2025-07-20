import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
          Galashow Admin &copy; {new Date().getFullYear()}
      </div>
      <div className="ms-auto">
        Current Server : DEV
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
