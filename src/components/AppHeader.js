import React from 'react'
import { useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { CButton, CContainer, CHeader, CHeaderToggler } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMenu, cilChevronRight, cilUser, cilAccountLogout } from '@coreui/icons'
import EnvironmentBadge from './EnvironmentBadge'
import routes from '../routes'
import { useAuth } from 'src/auth/AuthContext'

const pageNames = {
  '/dashboard': '대시보드',
  '/banner': '배너 관리',
  '/background': '배경 콘텐츠',
  '/policy': '정책 관리',
  '/sns': 'SNS 링크',
  '/minigame': '미니게임 관리',
  '/survival-rate': '생존률 관리',
  '/avatar': '시청자 아바타',
}

const AppHeader = () => {
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const { pathname } = useLocation()
  const { logout } = useAuth()
  const pageName =
    pageNames[pathname] || routes.find((route) => route.path === pathname)?.name || '워크스페이스'

  return (
    <CHeader position="sticky" className="workspace-header">
      <CContainer fluid>
        <div className="header-location">
          <CHeaderToggler
            aria-label="메뉴 열기/닫기"
            aria-controls="workspace-sidebar"
            aria-expanded={Boolean(sidebarShow)}
            onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          >
            <CIcon icon={cilMenu} size="lg" />
          </CHeaderToggler>
          <span className="header-workspace">Workspace</span>
          <CIcon icon={cilChevronRight} className="header-chevron" />
          <span className="header-page" aria-current="page">
            {pageName}
          </span>
        </div>
        <div className="header-account">
          <EnvironmentBadge />
          <span className="header-avatar" aria-label="관리자">
            <CIcon icon={cilUser} />
          </span>
          <CButton
            color="secondary"
            variant="outline"
            size="sm"
            className="d-inline-flex align-items-center"
            style={{ gap: 6 }}
            onClick={logout}
            title="로그아웃"
          >
            <CIcon icon={cilAccountLogout} />
            로그아웃
          </CButton>
        </div>
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
