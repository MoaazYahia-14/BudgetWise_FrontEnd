/* ملف إعداد Axios للتواصل مع الباك اند */
import axios from 'axios';
import { API_BASE_URL } from '../config';

/* إنشاء instance من axios مع الـ base URL */
const api = axios.create({
  baseURL: API_BASE_URL,
});

/* إضافة JWT token لكل request تلقائياً */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* معالجة أخطاء الـ 401 وإعادة التوجيه لصفحة الدخول */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.config && error.config.skipAuthInterceptor) {
      return Promise.reject(error);
    }
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      // Prevent refreshing if already on login or signup pages
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
