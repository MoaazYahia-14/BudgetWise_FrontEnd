import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client'; // Uncomment after: npm install socket.io-client
import { SOCKET_URL, API_BASE_URL } from '../config';
import { getImageUrl } from '../utils/imageUtils';
import '../styles/components/Navbar.css';

const SearchIcon = () => (
  <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="user-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const Navbar = () => {
  const { toggleTheme, toggleLanguage, theme, language, user, token } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` }
      });
      if (res.data?.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    if (!user?._id) return;
    
    fetchNotifications();
    
    // Socket.io for real-time
    const socket = io(SOCKET_URL);
    socket.emit('join', user._id);
      
    socket.on('notification', (newNotif) => {
      setNotifications(prev => {
        if (prev.find(n => n._id === newNotif._id)) return prev;
        return [newNotif, ...prev];
      });
    });

    // 2. Short Polling (Fallback every 30 seconds)
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [user?._id]);

  const handleNotificationClick = async () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown && notifications.some(n => !n.isRead)) {
      try {
        await axios.post(`${API_BASE_URL}/notifications/read`, {}, {
          headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` }
        });
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (err) {
        console.error('Error marking as read', err);
      }
    }
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API_BASE_URL}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` }
      });
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Error deleting notification', err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` }
      });
      setNotifications([]);
    } catch (err) {
      console.error('Error clearing notifications', err);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      navigate(`/user/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const avatarSrc = getImageUrl(user?.avatar) || "/images/avatar.jpg";

  return (
    <div className="navbar-top">
      <div className="navbar-search">
        <SearchIcon />
        <input
          type="text"
          className="search-input"
          placeholder={t('search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchSubmit}
        />
      </div>

      <div className="navbar-actions">
        <div className="navbar-icons">
          <button onClick={toggleLanguage} className="btn-icon btn-lang">
            {language === 'en' ? 'AR' : 'EN'}
          </button>

          <button onClick={toggleTheme} className="btn-icon">
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>

          <div style={{ position: 'relative' }}>
            <button className="btn-icon" onClick={handleNotificationClick}>
              <BellIcon />
              {notifications.some(n => !n.isRead) && (
                <span className="notification-badge">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>
            
            {showDropdown && (
              <div className="notification-dropdown">
                <div className="notif-dropdown-header">
                  <h4>{t('notifications') || 'Notifications'}</h4>
                  {notifications.length > 0 && (
                    <button onClick={clearAllNotifications} className="btn-clear-all">
                      {t('clearAll') || 'Clear All'}
                    </button>
                  )}
                </div>
                <div className="notif-list">
                  {notifications.length === 0 ? (
                    <p className="notif-empty">{t('noNotifications') || 'No notifications yet'}</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n._id} className={`notif-item ${n.isRead ? 'read' : 'unread'}`} onClick={() => n.type === 'EXPLORE_UPDATE' && navigate('/user/explore')}>
                        <div className="notif-content">
                          <strong>{n.title}</strong>
                          <p>{n.message}</p>
                          <small>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                        </div>
                        <button className="btn-delete-notif" onClick={(e) => deleteNotification(n._id, e)}>
                          <TrashIcon />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="navbar-divider"></div>

        <div className="navbar-user" onClick={() => navigate(user?.role === 'founder' ? '/founder/settings' : '/user/settings')}>
          <img 
            src={avatarSrc} 
            alt="User" 
            className="user-avatar" 
            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6C63FF&color=fff`; }} 
          />
          <span className="user-name">
            {user ? user.name : 'User'}
          </span>
          <ChevronDownIcon />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
