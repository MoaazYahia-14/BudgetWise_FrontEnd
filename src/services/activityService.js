import api from './api';

/* ============================================================
   Activity Service — يتواصل مع الـ API الخاص بالأنشطة
   ============================================================ */

/** GET /api/activities?limit=N — كل الأنشطة */
export const getAllActivities = (params = {}) => api.get('/activities', { params });

/** GET /api/activities/search?q=term — البحث في الأنشطة */
export const searchActivities = (params = {}) => api.get('/activities/search', { params });

/** GET /api/activities/recommended — أنشطة موصى بها حسب الميزانية */
export const getRecommendedActivities = () => api.get('/activities/recommended');

/** GET /api/activities/:id — نشاط واحد بالمعرف */
export const getActivityById = (id) => api.get(`/activities/${id}`);

/** POST /api/activities/:id/reviews — إضافة تقييم */
export const createReview = (activityId, data) => api.post(`/activities/${activityId}/reviews`, data);

/** GET /api/activities/:id/reviews — جلب التقييمات */
export const getActivityReviews = (activityId) => api.get(`/activities/${activityId}/reviews`);

/** POST /api/activities/seed — إدخال أنشطة تجريبية */
export const seedActivities = () => api.post('/activities/seed');
