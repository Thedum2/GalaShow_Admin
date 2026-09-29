import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'
import { AppSidebarNav } from './AppSidebarNav'
import GalaBrand from './GalaBrand'
import navigation from '../_nav'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  return (
    <CSidebar
      id="workspace-sidebar"
      className="workspace-sidebar"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => dispatch({ type: 'set', sidebarShow: visible })}
    >
      <CSidebarHeader>
        <CSidebarBrand as={Link} to="/dashboard" aria-label="GALASHOW 대시보드">
          <GalaBrand />
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          aria-label="메뉴 닫기"
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>
      <div className="sidebar-workspace-note">
        <span className="workspace-note-star" aria-hidden="true">
          ✦
        </span>
        <span>
          <strong>GalaShow Workspace</strong>
        </span>
      </div>
      <AppSidebarNav items={navigation} />
      <CSidebarFooter>
        <CSidebarToggler
          className="d-none d-lg-block"
          aria-label={unfoldable ? '메뉴 펼치기' : '메뉴 접기'}
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
