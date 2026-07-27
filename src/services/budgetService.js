import api from './api';

/* ============================================================
   Budget Service — يتواصل مع الـ API الخاص بالميزانية
   ============================================================ */

/** GET /api/budget/me — جلب الميزانية الحالية للمستخدم */
export const getMyBudget = () => api.get('/budget/me');

/** POST /api/budget — إنشاء ميزانية جديدة */
export const createBudget = (data) => api.post('/budget', data);

/** PUT /api/budget/:id — تحديث الميزانية */
export const updateBudget = (id, data) => api.put(`/budget/${id}`, data);

/** GET /api/budget/stats — جلب إحصائيات الميزانية */
export const getBudgetStats = (month, year) => {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  if (year) params.append('year', year);
  
  const queryString = params.toString();
  return api.get(`/budget/stats${queryString ? `?${queryString}` : ''}`);
};

/** GET /api/budget/tips — جلب نصائح الميزانية */
export const getBudgetTips = () => api.get('/budget/tips');
