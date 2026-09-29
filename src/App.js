import React, { Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { CSpinner } from '@coreui/react'
import './scss/style.scss'
import './scss/examples.scss'
import RequireAuth from 'src/auth/RequireAuth'
import { AuthProvider } from 'src/auth/AuthContext'

const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))
const Login = React.lazy(() => import('./views/pages/login/Login'))

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Suspense
        fallback={
          <div className="workspace-loading min-vh-100" role="status">
            <CSpinner color="primary" />
            <span>워크스페이스를 준비하고 있습니다.</span>
          </div>
        }
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<RequireAuth />}>
            <Route path="/*" element={<DefaultLayout />} />
          </Route>
        </Routes>
      </Suspense>
    </AuthProvider>
  </BrowserRouter>
)

export default App
