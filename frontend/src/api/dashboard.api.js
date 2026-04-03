import api from './axios';

export const getSummary = () => api.get('/dashboard/summary');
export const getByCategory = () => api.get('/dashboard/by-category');
export const getTrends = (period = 'monthly') => api.get('/dashboard/trends', { params: { period } });
export const getRecentActivity = (limit = 8) => api.get('/dashboard/recent', { params: { limit } });