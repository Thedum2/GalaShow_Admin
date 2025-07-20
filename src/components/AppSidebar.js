import React from 'react'
import {useSelector, useDispatch} from 'react-redux'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import {AppSidebarNav} from './AppSidebarNav'

// sidebar nav config
import navigation from '../_nav'
import Logo from "src/assets/brand/Logo";

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({type: 'set', sidebarShow: visible})
      }}
    >

      <CSidebarBrand className="d-flex align-items-center justify-content-center"
      >
        <div
          className="me-2"
          style={{
            width: '150',
            height: '150',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Logo style={{ width: '100%', height: '100%' }} />
        </div>
      </CSidebarBrand>
      <CSidebarBrand className="d-flex align-items-center justify-content-center border-bottom">
        <span className="fs-5 semibold">Galashow Admin</span>
      </CSidebarBrand>


      <AppSidebarNav items={navigation}/>
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => dispatch({type: 'set', sidebarUnfoldable: !unfoldable})}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
