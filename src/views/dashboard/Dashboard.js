import React from 'react'
import { Link } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import {
  cilArrowRight,
  cilGamepad,
  cilImage,
  cilBrush,
  cilUser,
  cilGraph,
  cilLink,
  cilDescription,
} from '@coreui/icons'
import OrbitScene from '../../components/OrbitScene'

const management = [
  {
    to: '/banner',
    icon: cilImage,
    title: '배너 관리',
    description: '처음 만나는 한마디를 다듬어요.',
    category: 'CONTENT',
    tone: 'lavender',
  },
  {
    to: '/background',
    icon: cilBrush,
    title: '배경 콘텐츠',
    description: '장면의 분위기를 완성해요.',
    category: 'VISUAL',
    tone: 'rose',
  },
  {
    to: '/avatar',
    icon: cilUser,
    title: '시청자 아바타',
    description: '참여자의 개성을 채워요.',
    category: 'CHARACTER',
    tone: 'mint',
  },
  {
    to: '/survival-rate',
    icon: cilGraph,
    title: '생존률 관리',
    description: '게임의 균형을 살펴봐요.',
    category: 'BALANCE',
    tone: 'mint',
  },
  {
    to: '/sns',
    icon: cilLink,
    title: 'SNS 링크',
    description: '커뮤니티로 이어지는 연결.',
    category: 'CONNECT',
    tone: 'lavender',
  },
  {
    to: '/policy',
    icon: cilDescription,
    title: '정책 관리',
    description: '서비스의 약속을 관리해요.',
    category: 'SERVICE',
    tone: 'rose',
  },
]

const Dashboard = () => (
  <div className="dashboard">
    <div className="page-heading">
      <div>
        <p className="eyebrow">YOUR CREATIVE WORKSPACE</p>
        <h1>
          대시보드<span className="heading-dot">.</span>
        </h1>
        <p className="page-description">오늘도, 함께 즐길 새로운 순간을 만들어 보세요.</p>
      </div>
      <span className="dashboard-date">
        {new Intl.DateTimeFormat('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
        }).format(new Date())}
      </span>
    </div>

    <section className="dashboard-hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <span className="hero-kicker">
          <span aria-hidden="true">✦</span> A LITTLE WONDER, A LOT OF PLAY
        </span>
        <h2 id="hero-title">
          즐거운 순간은
          <br />
          <span>여기서 시작돼요.</span>
        </h2>
        <p>
          작은 아이디어가 하나의 무대가 되는 곳.
          <br />
          GalaShow의 다음 즐거움을 준비해 보세요.
        </p>
        <Link className="btn btn-primary hero-button" to="/minigame">
          미니게임 관리 <CIcon icon={cilArrowRight} />
        </Link>
      </div>
      <OrbitScene />
      <span className="hero-caption">A SPACE FOR YOUR NEXT IDEA</span>
    </section>

    <section className="workspace-section" aria-labelledby="management-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">MAKE IT YOURS</p>
          <h2 id="management-title">워크스페이스</h2>
        </div>
        <span>콘텐츠부터 플레이 경험까지</span>
      </div>
      <div className="management-grid">
        {management.map((item) => (
          <Link to={item.to} className={`management-card tone-${item.tone}`} key={item.to}>
            <div className="management-card-top">
              <span className="management-icon">
                <CIcon icon={item.icon} size="xl" />
              </span>
              <CIcon icon={cilArrowRight} className="management-arrow" />
            </div>
            <span className="management-category">{item.category}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </Link>
        ))}
      </div>
    </section>

    <Link to="/minigame" className="game-workbench">
      <span className="workbench-icon">
        <CIcon icon={cilGamepad} size="xl" />
      </span>
      <div>
        <span className="eyebrow">READY, SET, PLAY</span>
        <h2>다음 라운드를 준비할까요?</h2>
        <p>미니게임의 규칙, 튜토리얼, 태그를 한곳에서 관리하세요.</p>
      </div>
      <span className="workbench-link">
        미니게임 둘러보기 <CIcon icon={cilArrowRight} />
      </span>
    </Link>
  </div>
)

export default Dashboard
