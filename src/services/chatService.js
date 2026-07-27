import api from './api';

export const getSessions = () => api.get('/chat/sessions');
export const createSession = (data) => api.post('/chat/sessions', data);
export const getSession = (id) => api.get(`/chat/sessions/${id}`);
export const sendMessage = (id, data) => api.post(`/chat/sessions/${id}/message`, data);
export const deleteSession = (id) => api.delete(`/chat/sessions/${id}`);
export const exportSession = (id) => api.get(`/chat/sessions/${id}/export`, { responseType: 'blob' });
