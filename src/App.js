import React, {Suspense, useEffect} from 'react'
import {BrowserRouter, HashRouter, Route, Routes} from 'react-router-dom'
import {useSelector} from 'react-redux'

import {CSpinner, useColorModes} from '@coreui/react'
import './scss/style.scss'

// We use those styles to show code examples, you should remove them in your application.
import './scss/examples.scss'
import RequireAuth from "src/auth/RequireAuth";
import {AuthProvider} from "src/auth/AuthContext";

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))

const App = () => {
  const {isColorModeSet, setColorMode} = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route element={<RequireAuth/>}>
            <Route path="/*" element={<DefaultLayout/>}/>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
