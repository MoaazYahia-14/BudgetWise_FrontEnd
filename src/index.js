/* 1. استيراد React */
import React from 'react';

/* 2. استيراد ReactDOM */
import ReactDOM from 'react-dom/client';

/* 3. استيراد App */
import App from './App';

/* 4. استيراد AuthProvider */
import { AuthProvider } from './context/AuthContext';

import ErrorBoundary from './components/ErrorBoundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/* 5. إعداد i18next */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ar from './locales/ar.json';

/* 6. استيراد global.css */
import './styles/global.css';

/* 7. استيراد darkmode.css */
import './styles/darkmode.css';

const queryClient = new QueryClient();

/* تهيئة i18next */
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

/* تشغيل التطبيق */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
