import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBrush,
  cilGamepad,
  cilGraph,
  cilImage,
  cilPencil,
  cilSpeedometer,
  cilStar,
  cilUser,
} from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavTitle,
    name: 'OVERVIEW',
  },
  {
    component: CNavItem,
    name: '대시보드',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'MANAGEMENT',
  },
  {
    component: CNavItem,
    name: '배너 관리',
    to: '/banner',
    icon: <CIcon icon={cilImage} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: '배경 콘텐츠',
    to: '/background',
    icon: <CIcon icon={cilBrush} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: '정책 관리',
    to: '/policy',
    icon: <CIcon icon={cilPencil} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'SNS 링크',
    to: '/sns',
    icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: '미니게임 관리',
    to: '/minigame',
    icon: <CIcon icon={cilGamepad} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: '생존률 관리',
    to: '/survival-rate',
    icon: <CIcon icon={cilGraph} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: '시청자 아바타',
    to: '/avatar',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
]

export default _nav
