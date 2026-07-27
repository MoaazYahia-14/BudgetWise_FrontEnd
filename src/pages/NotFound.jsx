import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/pages/NotFound.css';

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const NotFound = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  return (
    <div className="not-found-container" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">
          {i18n.language === 'ar' ? 'عذراً، الصفحة غير موجودة' : 'Oops, Page Not Found'}
        </h2>
        <p className="not-found-text">
          {i18n.language === 'ar' 
            ? 'يبدو أنك وصلت إلى رابط غير صحيح أو أن الصفحة التي تبحث عنها قد تم نقلها.' 
            : 'It looks like you reached an incorrect link or the page you are looking for has been moved.'}
        </p>
        <button className="not-found-button" onClick={() => navigate('/')}>
          <HomeIcon />
          {i18n.language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
        </button>
      </div>
    </div>
  );
};

export default NotFound;
