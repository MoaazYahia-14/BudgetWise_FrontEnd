/* صفحة اختيار اللغة - أول صفحة يراها المستخدم */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import MouseTrackingBackground from '../components/MouseTrackingBackground';
import '../styles/pages/LanguageSelect.css';
import '../styles/pages/LanguageSelect.responsive.css';

const LanguageSelect = () => {
  const { toggleLanguage, language } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(language || 'en');

  /* دالة اختيار اللغة */
  const handleSelect = (lang) => {
    setSelected(lang);
    if (language !== lang) {
      toggleLanguage();
    }
  };

  /* دالة الانتقال للموقع بعد اختيار اللغة */
  const handleStart = () => {
    navigate('/signup');
  };

  return (
    <div className="lang-page">

      {/* خلفية الجسيمات */}
      <MouseTrackingBackground />

      {/* المحتوى */}
      <div className="lang-content">

        {/* اللوجو */}
        <img
          src="/images/LogoBuggetWise.png"
          alt="BudgetWise"
          className="lang-logo"
        />

        {/* العنوان */}
        <h1 className="lang-title">
          {t('chooseLanguage')}
        </h1>
        <p className="lang-subtitle">
          {t('chooseLanguageSubtitle')}
        </p>

        {/* خيارات اللغة */}
        <div className="lang-options">

          {/* English */}
          <div
            className={`lang-card ${selected === 'en' ? 'lang-card-active' : ''}`}
            onClick={() => handleSelect('en')}
          >
            <span className="lang-flag">🇺🇸</span>
            <span className="lang-name">English</span>
            {selected === 'en' && <span className="lang-check">✓</span>}
          </div>

          {/* Arabic */}
          <div
            className={`lang-card ${selected === 'ar' ? 'lang-card-active' : ''}`}
            onClick={() => handleSelect('ar')}
          >
            <span className="lang-flag">🇪🇬</span>
            <span className="lang-name">العربية</span>
            {selected === 'ar' && <span className="lang-check">✓</span>}
          </div>

        </div>

        {/* زر البدء */}
        <button className="lang-btn" onClick={handleStart}>
          {t('startNow')}
        </button>

      </div>
    </div>
  );
};

export default LanguageSelect;
