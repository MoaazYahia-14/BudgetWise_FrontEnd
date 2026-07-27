import React, { useRef, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import '../styles/components/Sidebar.css';

/* ==================================
   أيقونات
   ================================== */
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ExploreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const MyPlanIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const BudgetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const PostsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const AiStarsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, left: 0, height: 0, width: 0, opacity: 0 });

  useEffect(() => {
    const updateIndicator = () => {
      if (navRef.current) {
        const activeLink = navRef.current.querySelector('.nav-link.active');
        if (activeLink) {
          setIndicatorStyle({
            top: activeLink.offsetTop,
            left: activeLink.offsetLeft,
            height: activeLink.offsetHeight,
            width: activeLink.offsetWidth,
            opacity: 1,
          });
        } else {
          setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
        }
      }
    };

    // Timeout ensures DOM has updated its layout classes
    const timeoutId = setTimeout(updateIndicator, 50);
    window.addEventListener('resize', updateIndicator);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [location.pathname]);

  return (
    <div className="sidebar">
      {/* اللوجو */}
      <div className="sidebar-logo">
        <img src="/images/LogoBuggetWise.png" alt="BudgetWise" />
      </div>

      <div className="nav-divider"></div>

      {/* روابط التنقل */}
      <nav className="sidebar-nav" ref={navRef} style={{ position: 'relative' }}>
        <div className="active-indicator" style={{
           top: indicatorStyle.top + 'px',
           left: indicatorStyle.left + 'px',
           height: indicatorStyle.height + 'px',
           width: indicatorStyle.width + 'px',
           opacity: indicatorStyle.opacity,
        }}></div>

        {user?.role === 'founder' ? (
          /* =========================================
             Founder Sidebar Links
             ========================================= */
          <>
            <NavLink to="/founder/home" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <HomeIcon />
              <span>{t('home', 'Home')}</span>
            </NavLink>
            <NavLink to="/founder/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <DashboardIcon />
              <span>{t('dashboard', 'Dashboard')}</span>
            </NavLink>
            <NavLink to="/founder/posts" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <PostsIcon />
              <span>{t('posts', 'Posts')}</span>
            </NavLink>


            <div className="nav-divider"></div>

            <NavLink to="/founder/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <SettingsIcon />
              <span>{t('settings')}</span>
            </NavLink>
            <button onClick={logout} className="nav-link logout-btn">
              <LogoutIcon />
              <span>{t('logout')}</span>
            </button>
          </>
        ) : (
          /* =========================================
             User Sidebar Links
             ========================================= */
          <>
            <NavLink to="/user/home" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <HomeIcon />
              <span>{t('home')}</span>
            </NavLink>
            <NavLink to="/user/explore" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <ExploreIcon />
              <span>{t('explore')}</span>
            </NavLink>

            <div className="nav-divider"></div>

            <NavLink to="/user/plan" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <MyPlanIcon />
              <span>{t('myPlan')}</span>
            </NavLink>
            <NavLink to="/user/budget" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <BudgetIcon />
              <span>{t('budget')}</span>
            </NavLink>

            <div className="nav-divider"></div>

            <NavLink to="/user/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <SettingsIcon />
              <span>{t('settings')}</span>
            </NavLink>
            <button onClick={logout} className="nav-link logout-btn">
              <LogoutIcon />
              <span>{t('logout')}</span>
            </button>
          </>
        )}
      </nav>

      {/* كارد الذكاء الاصطناعي - يظهر لليوزر العادي فقط */}
      {user?.role !== 'founder' && (
        <div className="sidebar-ai-card">
          <h4>{t('needBetterIdeas')}</h4>
          <p>{t('letAiPlan')}</p>
          <NavLink to="/user/chat" className="btn-start-planning">
            <AiStarsIcon /> {t('startPlanning')}
          </NavLink>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
