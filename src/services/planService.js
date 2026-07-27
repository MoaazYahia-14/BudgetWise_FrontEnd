import api from './api';

/* ============================================================
   Plan Service  —  يتواصل مع الـ API بتاع الخطة
   ============================================================ */

/** GET /api/plan/me  — جلب كل الأنشطة في خطة اليوزر */
export const getMyPlan = () => api.get('/plan/me');

/** POST /api/plan/add  — إضافة نشاط للخطة
 *  @param {Object} activityData  — بيانات النشاط
 */
export const addToPlan = (activityData) => api.post('/plan/add', activityData);

/** DELETE /api/plan/remove/:itemId  — حذف نشاط من الخطة */
export const removeFromPlan = (itemId) => api.delete(`/plan/remove/${itemId}`);

/** GET /api/plan/summary  — ملخص الميزانية (Total / Spent / Remaining) */
export const getPlanSummary = () => api.get('/plan/summary');
