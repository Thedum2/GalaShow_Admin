import React from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'

const DefaultLayout = () => {
  return (
    <div className="workspace-shell">
      <a className="skip-link" href="#workspace-content">
        본문으로 이동
      </a>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <main id="workspace-content" className="body flex-grow-1" tabIndex={-1}>
          <AppContent />
        </main>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
